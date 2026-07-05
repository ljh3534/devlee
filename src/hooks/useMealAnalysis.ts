import { useCallback } from "react";

import { API_BASE_URL } from "../config";

interface UseMealAnalysisReturn {
  /** 사진을 Claude Vision으로 분석해 코멘트를 받는다. 실패하면 null */
  analyzePhoto: (photoDataUri: string) => Promise<string | null>;
}

export function useMealAnalysis(accessToken: string | null): UseMealAnalysisReturn {
  const analyzePhoto = useCallback(
    async (photoDataUri: string): Promise<string | null> => {
      if (!accessToken) {
        return null;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/meals/analyze`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ photo_data_uri: photoDataUri }),
        });

        if (!response.ok) {
          return null;
        }

        const data = (await response.json()) as { comment: string };
        return data.comment;
      } catch (error) {
        console.error("사진 분석 실패:", error);
        return null;
      }
    },
    [accessToken],
  );

  return { analyzePhoto };
}
