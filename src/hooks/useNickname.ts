import { useCallback, useEffect, useState } from "react";

import { API_BASE_URL } from "../config";

interface UseNicknameReturn {
  nickname: string | null;
  isLoading: boolean;
  /** 닉네임을 설정한다 (설정해야 글로벌 랭킹에 노출됨). 성공 여부를 반환 */
  setNickname: (name: string) => Promise<boolean>;
}

export function useNickname(accessToken: string | null): UseNicknameReturn {
  const [nickname, setNicknameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    async function load() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = (await response.json()) as { nickname: string | null };
        setNicknameState(data.nickname);
      } catch (error) {
        console.error("닉네임 불러오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [accessToken]);

  const setNickname = useCallback(
    async (name: string): Promise<boolean> => {
      if (!accessToken) {
        return false;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nickname: name }),
        });

        if (!response.ok) {
          return false;
        }

        const data = (await response.json()) as { nickname: string | null };
        setNicknameState(data.nickname);
        return true;
      } catch (error) {
        console.error("닉네임 설정 실패:", error);
        return false;
      }
    },
    [accessToken],
  );

  return { nickname, isLoading, setNickname };
}
