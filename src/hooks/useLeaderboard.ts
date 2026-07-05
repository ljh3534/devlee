import { useCallback, useEffect, useState } from "react";

import { API_BASE_URL } from "../config";

export interface LeaderboardEntry {
  nickname: string;
  mealCount: number;
}

export interface MyRank {
  rank: number;
  mealCount: number;
  nickname: string | null;
}

interface ServerLeaderboardEntry {
  nickname: string;
  meal_count: number;
}

interface ServerMyRank {
  rank: number;
  meal_count: number;
  nickname: string | null;
}

interface UseLeaderboardReturn {
  entries: LeaderboardEntry[];
  myRank: MyRank | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useLeaderboard(accessToken: string | null): UseLeaderboardReturn {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<MyRank | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    try {
      const [listResponse, meResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/leaderboard`),
        fetch(`${API_BASE_URL}/api/leaderboard/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      const list = (await listResponse.json()) as ServerLeaderboardEntry[];
      const me = (await meResponse.json()) as ServerMyRank;

      setEntries(list.map((e) => ({ nickname: e.nickname, mealCount: e.meal_count })));
      setMyRank({ rank: me.rank, mealCount: me.meal_count, nickname: me.nickname });
    } catch (error) {
      console.error("랭킹 불러오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, myRank, isLoading, refresh };
}
