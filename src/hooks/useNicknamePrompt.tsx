import { colors } from "@toss/tds-colors";
import { useBottomSheet } from "@toss/tds-mobile";
import { useCallback, useRef } from "react";

interface UseNicknamePromptReturn {
  /** 닉네임 입력 바텀시트를 띄운다. 저장 시 입력값, 취소 시 null */
  promptNickname: (initialValue?: string) => Promise<string | null>;
}

export function useNicknamePrompt(): UseNicknamePromptReturn {
  const bottomSheet = useBottomSheet();
  const inputRef = useRef<HTMLInputElement>(null);

  const promptNickname = useCallback(
    async (initialValue = ""): Promise<string | null> => {
      const action = await bottomSheet.openTwoButtonSheet({
        header: "닉네임 설정하기",
        children: (
          <div style={{ padding: "0 24px 24px" }}>
            <input
              ref={inputRef}
              defaultValue={initialValue}
              placeholder="랭킹에 표시될 닉네임 (1~20자)"
              maxLength={20}
              style={{
                width: "100%",
                boxSizing: "border-box",
                border: `1px solid ${colors.grey200}`,
                borderRadius: "12px",
                padding: "12px",
                fontSize: "15px",
              }}
            />
          </div>
        ),
        leftButton: "취소",
        rightButton: "저장",
      });

      if (action !== "rightButtonClick") {
        return null;
      }

      return inputRef.current?.value.trim() ?? "";
    },
    [bottomSheet],
  );

  return { promptNickname };
}
