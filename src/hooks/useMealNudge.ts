import { useDialog, useToast } from "@toss/tds-mobile";
import { useEffect, useRef } from "react";

interface UseMealNudgeParams {
  /** 팝업을 띄울지 여부. 페이지가 활성화되어 있을 때만 true로 전달해주세요. */
  enabled: boolean;
  /** "먹고 있어요"를 선택했을 때 실행할 콜백 (보통 사진 촬영 플로우) */
  onConfirm: () => void;
}

// 너무 자주 뜨면 스트레스, 너무 뜸하면 무의미해서 랜덤 간격(45~90초)으로 뜨게 했어요.
const MIN_DELAY_MS = 45_000;
const MAX_DELAY_MS = 90_000;

const NUDGE_MESSAGES: { title: string; description: string }[] = [
  {
    title: "혹시 지금 뭐 먹고 있는 거 아니지...?",
    description: "몰래 드시고 계셨다면 지금 찰칵 남겨주세요.",
  },
  {
    title: "저기... 손에 뭐 들고 계신가요?",
    description: "간식이었다면 살짝 기록해두는 건 어때요?",
  },
  {
    title: "방금 뭔가 씹는 소리가 들린 것 같아요",
    description: "지금 드시는 중이라면 사진 한 장 부탁해요.",
  },
];

const DISMISS_REPLIES = [
  "믿을게요! 다음에 또 물어볼게요.",
  "좋아요, 이번엔 그냥 넘어갈게요.",
  "정말이죠? 지켜보고 있을게요.",
];

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function useMealNudge({ enabled, onConfirm }: UseMealNudgeParams) {
  const dialog = useDialog();
  const toast = useToast();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isMounted = true;

    const scheduleNext = () => {
      const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);

      timerRef.current = setTimeout(async () => {
        const message = pickRandom(NUDGE_MESSAGES);
        const confirmed = await dialog.openConfirm({
          title: message.title,
          description: message.description,
          confirmButton: "찰칵 찍기",
          cancelButton: "아니에요",
        });

        if (!isMounted) {
          return;
        }

        if (confirmed) {
          onConfirm();
        } else {
          toast.openToast(pickRandom(DISMISS_REPLIES));
        }

        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      isMounted = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [enabled]);
}
