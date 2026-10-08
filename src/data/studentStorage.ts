import { StudentProfile, SUTDepartment, AuthMode } from '../types';
import { calculateLevel } from './achievementsData';
import { TEST_15_STUDENTS, TEST_ACCOUNTS_CREDENTIALS } from './testAccounts';

const STORAGE_KEY_STUDENTS = 'sut_sochi_all_students_v4';
const STORAGE_KEY_ACTIVE_ID = 'sut_sochi_active_student_id_v3';
const STORAGE_KEY_AUTH_MODE = 'sut_sochi_auth_mode_v3';

export const ADMIN_SECRET_CODE = 'artdyshfj7289djsbc782q';

export const DEFAULT_STUDENTS: StudentProfile[] = TEST_15_STUDENTS;
export { TEST_ACCOUNTS_CREDENTIALS };

// Synchronous local reading with default fallback
export function getAllStudents(): StudentProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load students from localStorage:', err);
  }
  saveAllStudents(DEFAULT_STUDENTS);
  return DEFAULT_STUDENTS;
}

export function saveAllStudents(students: StudentProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  } catch (err) {
    console.error('Failed to save students to localStorage:', err);
  }
}

// Asynchronous Backend API sync
export async function apiFetchStudents(): Promise<StudentProfile[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('/api/students', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      saveAllStudents(data);
      return data;
    }
  } catch (err) {
    console.warn('Backend API /api/students not available or timed out, using local storage cache:', err);
  }
  return getAllStudents();
}

export async function apiRegisterStudent(data: {
  name: string;
  callsign: string;
  pin?: string;
  avatar: string;
  department: SUTDepartment;
  grade: string;
  notes?: string;
}): Promise<StudentProfile> {
  try {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const created: StudentProfile = await res.json();
      const current = getAllStudents().filter(s => s.id !== created.id);
      saveAllStudents([created, ...current]);
      setActiveStudentId(created.id);
      setAuthSession('student', created.id);
      return created;
    }
  } catch (err) {
    console.warn('API register failed, performing local registration:', err);
  }
  return registerNewStudent(data);
}

export async function apiUpdateStudent(id: string, fields: Partial<StudentProfile>): Promise<StudentProfile | null> {
  try {
    fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    }).catch(err => console.warn('Background sync error (update):', err));
  } catch (err) {
    console.warn('API update failed:', err);
  }
  return updateStudentById(id, fields);
}

export async function apiDeleteStudent(id: string): Promise<boolean> {
  try {
    fetch(`/api/students/${id}`, { method: 'DELETE' }).catch(err => console.warn('Background sync error (delete):', err));
  } catch (err) {
    console.warn('API delete failed:', err);
  }
  deleteStudentById(id);
  return true;
}

export async function apiResetCohort(): Promise<boolean> {
  try {
    fetch('/api/students/reset', { method: 'POST' }).catch(err => console.warn('Background sync error (reset):', err));
  } catch (err) {
    console.warn('API reset failed:', err);
  }
  resetToDefaultCohort();
  return true;
}

// Session state
export function getAuthSession(): { mode: AuthMode; studentId?: string } {
  try {
    const mode = (localStorage.getItem(STORAGE_KEY_AUTH_MODE) as AuthMode) || 'gateway';
    const studentId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID) || undefined;
    return { mode, studentId };
  } catch (err) {
    return { mode: 'gateway' };
  }
}

export function setAuthSession(mode: AuthMode, studentId?: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_AUTH_MODE, mode);
    if (studentId) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, studentId);
    }
  } catch (err) {
    console.error('Failed to set auth session:', err);
  }
}

export function getActiveStudentId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (id) return id;
  } catch (err) {
    console.error('Failed to get active student ID:', err);
  }
  return '';
}

export function setActiveStudentId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch (err) {
    console.error('Failed to set active student ID:', err);
  }
}

export function getActiveStudent(): StudentProfile {
  const students = getAllStudents();
  const activeId = getActiveStudentId();
  const found = students.find((s) => s.id === activeId);
  if (found) return found;
  if (students.length > 0) return students[0];
  return DEFAULT_STUDENTS[0];
}

export function verifyStudentLogin(callsignOrLogin: string, pin: string): StudentProfile | null {
  const students = getAllStudents();
  const cleanQuery = callsignOrLogin.trim().toLowerCase().replace(/^@/, '');
  const cleanPin = pin.trim();

  const student = students.find(
    (s) =>
      (s.login && s.login.toLowerCase() === cleanQuery) ||
      s.callsign.toLowerCase() === cleanQuery ||
      s.name.toLowerCase() === cleanQuery
  );

  if (!student) return null;
  const expectedPin = (student.pin || '').trim();
  if (expectedPin === cleanPin) {
    setActiveStudentId(student.id);
    setAuthSession('student', student.id);
    return student;
  }
  return null;
}

export function verifyAdminPassword(password: string): boolean {
  const clean = password.trim();
  return clean === ADMIN_SECRET_CODE;
}

export function registerNewStudent(data: {
  name: string;
  callsign: string;
  pin?: string;
  avatar: string;
  department: SUTDepartment;
  grade: string;
  notes?: string;
}): StudentProfile {
  const students = getAllStudents();
  const uniqueNum = Math.floor(1000 + Math.random() * 9000);
  const newId = `sut-student-${Date.now()}-${uniqueNum}`;

  const welcomeXp = 100;
  const initialTokens = 5000;
  const tier = calculateLevel(welcomeXp);

  const newStudent: StudentProfile = {
    id: newId,
    name: data.name.trim(),
    callsign: data.callsign.trim().replace(/^@/, ''),
    pin: data.pin?.trim() || '1234',
    avatar: data.avatar || '🚀',
    department: data.department,
    grade: data.grade || '7 класс',
    registeredAt: new Date().toISOString().split('T')[0],
    xp: welcomeXp,
    level: tier.level,
    levelTitle: tier.title,
    completedLessonIds: [],
    completedQuestIds: [],
    unlockedAchievementIds: ['first_step'],
    favoriteTool: 'ИИ-Лаборатория СЮТ',
    questionsAskedCount: 0,
    tokenBalance: initialTokens,
    totalTokensUsed: 0,
    notes: data.notes || 'Новый ученик СЮТ Сочи.',
    role: 'student',
  };

  const updatedList = [newStudent, ...students];
  saveAllStudents(updatedList);
  setActiveStudentId(newId);
  setAuthSession('student', newId);
  return newStudent;
}

export function consumeTokens(studentId: string, amount: number): { remaining: number; success: boolean } {
  const students = getAllStudents();
  let remaining = 0;
  let success = false;

  const updated = students.map((s) => {
    if (s.id === studentId) {
      if (s.tokenBalance >= amount) {
        s.tokenBalance -= amount;
        s.totalTokensUsed += amount;
        remaining = s.tokenBalance;
        success = true;
      } else {
        const left = s.tokenBalance;
        s.totalTokensUsed += left;
        s.tokenBalance = 0;
        remaining = 0;
        success = false;
      }
    }
    return s;
  });

  saveAllStudents(updated);
  return { remaining, success };
}

export function addTokens(studentId: string, amount: number): number {
  const students = getAllStudents();
  let newBalance = 0;

  const updated = students.map((s) => {
    if (s.id === studentId) {
      s.tokenBalance += amount;
      newBalance = s.tokenBalance;
    }
    return s;
  });

  saveAllStudents(updated);
  return newBalance;
}

export function updateStudentById(
  studentId: string,
  fields: Partial<StudentProfile>
): StudentProfile | null {
  const students = getAllStudents();
  let target: StudentProfile | null = null;

  const updated = students.map((s) => {
    if (s.id === studentId) {
      const merged = { ...s, ...fields };
      const tier = calculateLevel(merged.xp);
      target = {
        ...merged,
        level: tier.level,
        levelTitle: tier.title,
      };
      return target;
    }
    return s;
  });

  if (target) {
    saveAllStudents(updated);
  }
  return target;
}

export function deleteStudentById(studentId: string): void {
  const students = getAllStudents().filter((s) => s.id !== studentId);
  saveAllStudents(students);
  if (getActiveStudentId() === studentId && students.length > 0) {
    setActiveStudentId(students[0].id);
  }
}

export function resetToDefaultCohort(): void {
  saveAllStudents(DEFAULT_STUDENTS);
  setActiveStudentId(DEFAULT_STUDENTS[0].id);
  setAuthSession('student', DEFAULT_STUDENTS[0].id);
}
