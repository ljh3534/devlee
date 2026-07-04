import { Storage } from "@apps-in-toss/web-framework";
import { useCallback, useEffect, useState } from "react";

const MISSIONS = [
  "오늘은 야채 한 가지 추가해보기",
  "물 한 잔 더 마시기",
  "천천히 꼭꼭 씹어먹기",
  "간식 대신 과일 먹어보기",
  "국물은 반만 남겨보기",
  "식사 전에 물 한 컵 마시기",
  "튀김 대신 구운 음식 선택해보기",
  "오늘 하루는 야식 참아보기",
];

const STORAGE_KEY = "devlee.dailyMission";

function todayKey(): string {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

interface DailyMission {
  date: string;
  text: string;
  completed: boolean;
}

interface UseMealMissionReturn {
  mission: DailyMission | null;
  isLoading: boolean;
  toggleComplete: () => Promise<void>;
}

export function useMealMission(): UseMealMissionReturn {
  const [mission, setMission] = useState<DailyMission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMission() {
      try {
        const raw = await Storage.getItem(STORAGE_KEY);
        const saved = raw ? (JSON.parse(raw) as DailyMission) : null;

        if (saved && saved.date === todayKey()) {
          setMission(saved);
          return;
        }

        const next: DailyMission = {
          date: todayKey(),
          text: MISSIONS[Math.floor(Math.random() * MISSIONS.length)],
          completed: false,
        };

        await Storage.setItem(STORAGE_KEY, JSON.stringify(next));
        setMission(next);
      } catch (error) {
        console.error("오늘의 미션 불러오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMission();
  }, []);

  const toggleComplete = useCallback(async () => {
    if (!mission) {
      return;
    }

    const next = { ...mission, completed: !mission.completed };
    setMission(next);

    try {
      await Storage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error("오늘의 미션 저장 실패:", error);
    }
  }, [mission]);

  return { mission, isLoading, toggleComplete };
}
