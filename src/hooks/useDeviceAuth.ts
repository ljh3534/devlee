import { Storage } from "@apps-in-toss/web-framework";
import { useCallback, useEffect, useState } from "react";

import { API_BASE_URL } from "../config";

const TOKEN_KEY = "devlee.accessToken";
const SYNC_CODE_KEY = "devlee.syncCode";

interface UseDeviceAuthReturn {
  accessToken: string | null;
  syncCode: string | null;
  /** 최초 인증(불러오기 또는 신규 발급) 시도가 끝났는지 여부 */
  isReady: boolean;
  /** 다른 기기에서 발급받은 동기화 코드로 이 기기를 연결한다. 성공 여부를 반환 */
  linkWithCode: (code: string) => Promise<boolean>;
}

export function useDeviceAuth(): UseDeviceAuthReturn {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [syncCode, setSyncCode] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [savedToken, savedSyncCode] = await Promise.all([
          Storage.getItem(TOKEN_KEY),
          Storage.getItem(SYNC_CODE_KEY),
        ]);

        if (savedToken && savedSyncCode) {
          setAccessToken(savedToken);
          setSyncCode(savedSyncCode);
          return;
        }
      } catch (error) {
        console.error("저장된 인증 정보 불러오기 실패:", error);
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
        });
        const data = (await response.json()) as {
          access_token: string;
          sync_code: string;
        };

        setAccessToken(data.access_token);
        setSyncCode(data.sync_code);

        try {
          await Promise.all([
            Storage.setItem(TOKEN_KEY, data.access_token),
            Storage.setItem(SYNC_CODE_KEY, data.sync_code),
          ]);
        } catch (storageError) {
          console.error("인증 정보 로컬 저장 실패:", storageError);
        }
      } catch (error) {
        console.error("기기 인증 발급 실패:", error);
      } finally {
        setIsReady(true);
      }
    }

    init();
  }, []);

  const linkWithCode = useCallback(async (code: string): Promise<boolean> => {
    const normalized = code.trim().toUpperCase();

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sync_code: normalized }),
      });

      if (!response.ok) {
        return false;
      }

      const data = (await response.json()) as { access_token: string };

      setAccessToken(data.access_token);
      setSyncCode(normalized);

      try {
        await Promise.all([
          Storage.setItem(TOKEN_KEY, data.access_token),
          Storage.setItem(SYNC_CODE_KEY, normalized),
        ]);
      } catch (storageError) {
        console.error("인증 정보 로컬 저장 실패:", storageError);
      }

      return true;
    } catch (error) {
      console.error("동기화 코드 연결 실패:", error);
      return false;
    }
  }, []);

  return { accessToken, syncCode, isReady, linkWithCode };
}
