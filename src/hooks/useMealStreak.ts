import { useMemo } from "react";

import type { MealEntry } from "./useMealLog";

function toDateKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/**
 * 오늘부터 거슬러 올라가며 기록이 연속으로 있는 날 수를 센다.
 */
export function useMealStreak(entries: MealEntry[]): number {
  return useMemo(() => {
    if (entries.length === 0) {
      return 0;
    }

    const recordedDays = new Set(entries.map((entry) => toDateKey(entry.createdAt)));
    const cursor = new Date();
    let streak = 0;

    while (recordedDays.has(toDateKey(cursor.getTime()))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }, [entries]);
}
