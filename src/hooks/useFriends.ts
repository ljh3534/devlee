import { useCallback, useEffect, useState } from "react";

import { API_BASE_URL } from "../config";

export interface FriendEntry {
  nickname: string | null;
  mealCount: number;
}

interface ServerFriendEntry {
  nickname: string | null;
  meal_count: number;
}

interface UseFriendsReturn {
  friends: FriendEntry[];
  isLoading: boolean;
  /** 친구의 동기화 코드로 친구를 추가한다. 성공 여부를 반환 */
  addFriend: (code: string) => Promise<boolean>;
}

export function useFriends(accessToken: string | null): UseFriendsReturn {
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/friends`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = (await response.json()) as ServerFriendEntry[];
      setFriends(data.map((f) => ({ nickname: f.nickname, mealCount: f.meal_count })));
    } catch (error) {
      console.error("친구 목록 불러오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const addFriend = useCallback(
    async (code: string): Promise<boolean> => {
      if (!accessToken) {
        return false;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/friends`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sync_code: code.trim().toUpperCase() }),
        });

        if (!response.ok) {
          return false;
        }

        await load();
        return true;
      } catch (error) {
        console.error("친구 추가 실패:", error);
        return false;
      }
    },
    [accessToken, load],
  );

  return { friends, isLoading, addFriend };
}
