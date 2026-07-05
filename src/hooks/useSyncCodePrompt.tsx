import { colors } from "@toss/tds-colors";
import { useBottomSheet } from "@toss/tds-mobile";
import { useCallback, useRef } from "react";

interface UseSyncCodePromptReturn {
  /** 동기화 코드 입력 바텀시트를 띄운다. 저장 시 입력값, 취소 시 null */
  promptSyncCode: () => Promise<string | null>;
}

export function useSyncCodePrompt(): UseSyncCodePromptReturn {
  const bottomSheet = useBottomSheet();
  const inputRef = useRef<HTMLInputElement>(null);

  const promptSyncCode = useCallback(async (): Promise<string | null> => {
    const action = await bottomSheet.openTwoButtonSheet({
      header: "다른 기기 연결하기",
      children: (
        <div style={{ padding: "0 24px 24px" }}>
          <input
            ref={inputRef}
            placeholder="다른 기기에서 받은 8자리 코드"
            maxLength={8}
            style={{
              width: "100%",
              boxSizing: "border-box",
              border: `1px solid ${colors.grey200}`,
              borderRadius: "12px",
              padding: "12px",
              fontSize: "15px",
              textTransform: "uppercase",
            }}
          />
        </div>
      ),
      leftButton: "취소",
      rightButton: "연결",
    });

    if (action !== "rightButtonClick") {
      return null;
    }

    return inputRef.current?.value.trim() ?? "";
  }, [bottomSheet]);

  return { promptSyncCode };
}
