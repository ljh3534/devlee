import { useCallback, useEffect, useState } from "react";

import { API_BASE_URL } from "../config";

export interface MealEntry {
  id: string;
  photoDataUri: string;
  comment: string;
  createdAt: number;
}

interface ServerMealEntry {
  id: string;
  photo_data_uri: string;
  comment: string;
  created_at: string;
}

function toMealEntry(raw: ServerMealEntry): MealEntry {
  return {
    id: raw.id,
    photoDataUri: raw.photo_data_uri,
    comment: raw.comment,
    createdAt: new Date(raw.created_at).getTime(),
  };
}

interface UseMealLogReturn {
  entries: MealEntry[];
  isLoading: boolean;
  addEntry: (photoDataUri: string, comment: string) => Promise<void>;
  updateEntry: (id: string, comment: string) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
}

/** accessToken이 없으면(기기 인증 준비 전) 아무 동작도 하지 않는다. */
export function useMealLog(accessToken: string | null): UseMealLogReturn {
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const authHeaders = useCallback(
    (): HeadersInit => ({
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    }),
    [accessToken],
  );

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    async function loadEntries() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/meals`, {
          headers: authHeaders(),
        });
        const data = (await response.json()) as ServerMealEntry[];
        setEntries(data.map(toMealEntry));
      } catch (error) {
        console.error("식단 기록 불러오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadEntries();
  }, [accessToken, authHeaders]);

  const addEntry = useCallback(
    async (photoDataUri: string, comment: string) => {
      if (!accessToken) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/meals`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ photo_data_uri: photoDataUri, comment }),
        });
        const created = (await response.json()) as ServerMealEntry;
        setEntries((prev) => [toMealEntry(created), ...prev]);
      } catch (error) {
        console.error("식단 기록 저장 실패:", error);
      }
    },
    [accessToken, authHeaders],
  );

  const updateEntry = useCallback(
    async (id: string, comment: string) => {
      if (!accessToken) {
        return;
      }

      try {
        await fetch(`${API_BASE_URL}/api/meals/${id}`, {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ comment }),
        });
        setEntries((prev) =>
          prev.map((entry) => (entry.id === id ? { ...entry, comment } : entry)),
        );
      } catch (error) {
        console.error("식단 기록 수정 실패:", error);
      }
    },
    [accessToken, authHeaders],
  );

  const removeEntry = useCallback(
    async (id: string) => {
      if (!accessToken) {
        return;
      }

      try {
        await fetch(`${API_BASE_URL}/api/meals/${id}`, {
          method: "DELETE",
          headers: authHeaders(),
        });
        setEntries((prev) => prev.filter((entry) => entry.id !== id));
      } catch (error) {
        console.error("식단 기록 삭제 실패:", error);
      }
    },
    [accessToken, authHeaders],
  );

  return { entries, isLoading, addEntry, updateEntry, removeEntry };
}
