import { Storage } from "@apps-in-toss/web-framework";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { MealEntry } from "./useMealLog";

const MANUAL_MISSIONS = [
  "오늘은 야채 한 가지 추가해보기",
  "물 한 잔 더 마시기",
  "천천히 꼭꼭 씹어먹기",
  "간식 대신 과일 먹어보기",
  "국물은 반만 남겨보기",
  "식사 전에 물 한 컵 마시기",
  "튀김 대신 구운 음식 선택해보기",
  "오늘 하루는 야식 참아보기",
];

interface AutoMissionContext {
  entries: MealEntry[];
  streak: number;
}

interface AutoMission {
  id: string;
  text: string;
  check: (context: AutoMissionContext) => boolean;
}

const AUTO_MISSIONS: AutoMission[] = [
  {
    id: "today-log",
    text: "오늘 기록 1개 남기기",
    check: ({ entries }) => entries.some((entry) => toDateKey(entry.createdAt) === todayKey()),
  },
  {
    id: "streak-3",
    text: "연속 기록 3일 달성하기",
    check: ({ streak }) => streak >= 3,
  },
  {
    id: "week-5",
    text: "이번 주 5끼 기록하기",
    check: ({ entries }) => {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return entries.filter((entry) => entry.createdAt >= weekAgo).length >= 5;
    },
  },
];

const STORAGE_KEY = "devlee.dailyMission";

function todayKey(): string {
  return toDateKey(Date.now());
}

function toDateKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function pickDailyMission(): StoredMission {
  const pool = [
    ...MANUAL_MISSIONS.map((text) => ({ type: "manual" as const, text })),
    ...AUTO_MISSIONS.map((auto) => ({ type: "auto" as const, text: auto.text, autoId: auto.id })),
  ];
  const picked = pool[Math.floor(Math.random() * pool.length)];

  return {
    date: todayKey(),
    completed: false,
    ...picked,
  };
}

interface StoredMission {
  date: string;
  type: "manual" | "auto";
  text: string;
  autoId?: string;
  completed: boolean;
}

export interface DailyMission {
  type: "manual" | "auto";
  text: string;
  completed: boolean;
}

interface UseMealMissionReturn {
  mission: DailyMission | null;
  isLoading: boolean;
  toggleComplete: () => Promise<void>;
}

export function useMealMission(entries: MealEntry[], streak: number): UseMealMissionReturn {
  const [stored, setStored] = useState<StoredMission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMission() {
      try {
        const raw = await Storage.getItem(STORAGE_KEY);
        const saved = raw ? (JSON.parse(raw) as StoredMission) : null;

        if (saved && saved.date === todayKey()) {
          setStored(saved);
          return;
        }

        const next = pickDailyMission();
        await Storage.setItem(STORAGE_KEY, JSON.stringify(next));
        setStored(next);
      } catch (error) {
        console.error("오늘의 미션 불러오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMission();
  }, []);

  const toggleComplete = useCallback(async () => {
    if (!stored || stored.type === "auto") {
      return;
    }

    const next = { ...stored, completed: !stored.completed };
    setStored(next);

    try {
      await Storage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error("오늘의 미션 저장 실패:", error);
    }
  }, [stored]);

  const mission = useMemo<DailyMission | null>(() => {
    if (!stored) {
      return null;
    }

    if (stored.type === "auto") {
      const auto = AUTO_MISSIONS.find((item) => item.id === stored.autoId);
      const completed = auto ? auto.check({ entries, streak }) : false;
      return { type: "auto", text: stored.text, completed };
    }

    return { type: "manual", text: stored.text, completed: stored.completed };
  }, [stored, entries, streak]);

  return { mission, isLoading, toggleComplete };
}
