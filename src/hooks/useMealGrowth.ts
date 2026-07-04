import { useMemo } from "react";

export interface GrowthStage {
  level: number;
  label: string;
  minEntries: number;
}

// TODO: 실제 캐릭터 일러스트가 생기면 label 대신 이미지 에셋으로 교체
const GROWTH_STAGES: GrowthStage[] = [
  { level: 1, label: "씨앗", minEntries: 0 },
  { level: 2, label: "새싹", minEntries: 3 },
  { level: 3, label: "나무", minEntries: 7 },
  { level: 4, label: "열매", minEntries: 14 },
];

interface UseMealGrowthReturn {
  stage: GrowthStage;
  nextStage: GrowthStage | null;
  /** 다음 단계까지 진행률 (0~1). 최고 단계면 1 */
  progress: number;
}

export function useMealGrowth(entryCount: number): UseMealGrowthReturn {
  return useMemo(() => {
    const stage = [...GROWTH_STAGES]
      .reverse()
      .find((candidate) => entryCount >= candidate.minEntries)!;

    const nextStage =
      GROWTH_STAGES.find((candidate) => candidate.minEntries > stage.minEntries) ?? null;

    const progress = nextStage
      ? Math.min(
          1,
          (entryCount - stage.minEntries) / (nextStage.minEntries - stage.minEntries),
        )
      : 1;

    return { stage, nextStage, progress };
  }, [entryCount]);
}
