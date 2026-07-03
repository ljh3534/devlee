import { colors } from "@toss/tds-colors";
import { useBottomSheet } from "@toss/tds-mobile";
import { useCallback, useRef } from "react";

interface UseMealMemoPromptReturn {
  /**
   * 메모 입력 바텀시트를 띄운다.
   * @returns 저장 시 입력한 문자열(빈 문자열 가능), 취소 시 null
   */
  promptMemo: (initialValue?: string) => Promise<string | null>;
}

export function useMealMemoPrompt(): UseMealMemoPromptReturn {
  const bottomSheet = useBottomSheet();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const promptMemo = useCallback(
    async (initialValue = ""): Promise<string | null> => {
      const action = await bottomSheet.openTwoButtonSheet({
        header: "한마디 남기기",
        children: (
          <div style={{ padding: "0 24px 24px" }}>
            <textarea
              ref={textareaRef}
              defaultValue={initialValue}
              placeholder="오늘 뭐 드셨어요? 비워두면 재치있는 코멘트를 자동으로 붙여드려요."
              rows={3}
              style={{
                width: "100%",
                boxSizing: "border-box",
                resize: "none",
                border: `1px solid ${colors.grey200}`,
                borderRadius: "12px",
                padding: "12px",
                fontSize: "15px",
                fontFamily: "inherit",
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

      return textareaRef.current?.value.trim() ?? "";
    },
    [bottomSheet],
  );

  return { promptMemo };
}
