import { Storage } from "@apps-in-toss/web-framework";
import { useCallback, useEffect, useState } from "react";

export interface MealEntry {
  id: string;
  photoDataUri: string;
  comment: string;
  createdAt: number;
}

interface UseMealLogReturn {
  entries: MealEntry[];
  isLoading: boolean;
  addEntry: (photoDataUri: string, comment: string) => Promise<void>;
  updateEntry: (id: string, comment: string) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
}

const STORAGE_KEY = "devlee.mealEntries";

export function useMealLog(): UseMealLogReturn {
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEntries() {
      try {
        const raw = await Storage.getItem(STORAGE_KEY);
        setEntries(raw ? (JSON.parse(raw) as MealEntry[]) : []);
      } catch (error) {
        console.error("식단 기록 불러오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadEntries();
  }, []);

  const persist = useCallback(async (next: MealEntry[]) => {
    setEntries(next);

    try {
      await Storage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error("식단 기록 저장 실패:", error);
    }
  }, []);

  const addEntry = useCallback(
    async (photoDataUri: string, comment: string) => {
      const entry: MealEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        photoDataUri,
        comment,
        createdAt: Date.now(),
      };

      await persist([entry, ...entries]);
    },
    [entries, persist],
  );

  const updateEntry = useCallback(
    async (id: string, comment: string) => {
      await persist(
        entries.map((entry) => (entry.id === id ? { ...entry, comment } : entry)),
      );
    },
    [entries, persist],
  );

  const removeEntry = useCallback(
    async (id: string) => {
      await persist(entries.filter((entry) => entry.id !== id));
    },
    [entries, persist],
  );

  return { entries, isLoading, addEntry, updateEntry, removeEntry };
}
