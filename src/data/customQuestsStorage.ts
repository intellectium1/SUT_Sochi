import { Quest } from '../types';
import { QUESTS as DEFAULT_QUESTS } from './questsData';

const STORAGE_KEY_QUESTS = 'sut_sochi_all_quests_v2';

export function getAllQuests(): Quest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUESTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load quests:', err);
  }
  saveAllQuests(DEFAULT_QUESTS);
  return DEFAULT_QUESTS;
}

export function saveAllQuests(quests: Quest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_QUESTS, JSON.stringify(quests));
  } catch (err) {
    console.error('Failed to save quests:', err);
  }
}

export function addCustomQuest(questData: Omit<Quest, 'id'>): Quest {
  const quests = getAllQuests();
  const id = `quest-custom-${Date.now()}`;
  const newQuest: Quest = {
    ...questData,
    id,
  };
  const updated = [newQuest, ...quests];
  saveAllQuests(updated);
  return newQuest;
}

export function deleteQuestById(questId: string): void {
  const quests = getAllQuests().filter((q) => q.id !== questId);
  saveAllQuests(quests);
}
