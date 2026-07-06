import { colors } from "@toss/tds-colors";
import { Asset, Button, List, ListRow, TextButton, Top, useDialog, useToast } from "@toss/tds-mobile";
import { useCallback, useState } from "react";

import { useDeviceAuth } from "../hooks/useDeviceAuth";
import { useMealAnalysis } from "../hooks/useMealAnalysis";
import { useMealGrowth } from "../hooks/useMealGrowth";
import { useMealLog } from "../hooks/useMealLog";
import { useMealMemoPrompt } from "../hooks/useMealMemoPrompt";
import { useMealMission } from "../hooks/useMealMission";
import { useMealNudge } from "../hooks/useMealNudge";
import { useMealPhotoCapture } from "../hooks/useMealPhotoCapture";
import { useMealStreak } from "../hooks/useMealStreak";
import { useSyncCodePrompt } from "../hooks/useSyncCodePrompt";

const MEAL_COMMENTS = [
  "오늘도 기록 완료! 잘 먹었어요.",
  "이 한 끼, 잘 남겨뒀어요.",
  "든든하게 챙겼네요, 기록 끝!",
  "사진으로 남기니까 왠지 더 뿌듯하죠?",
];

function pickRandomComment() {
  return MEAL_COMMENTS[Math.floor(Math.random() * MEAL_COMMENTS.length)];
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function extractCalorie(comment: string): string | null {
  const match = comment.match(/(\d+)\s*kcal/i);
  return match ? `${match[1]}kcal` : null;
}

function usePressScale(scale = 0.98) {
  const [pressed, setPressed] = useState(false);
  return {
    pressStyle: {
      transform: pressed ? `scale(${scale})` : "scale(1)",
      transition: "transform 0.15s ease",
    },
    pressHandlers: {
      onPointerDown: () => setPressed(true),
      onPointerUp: () => setPressed(false),
      onPointerLeave: () => setPressed(false),
    },
  };
}

interface MealLogPageProps {
  onBack: () => void;
}

export function MealLogPage({ onBack }: MealLogPageProps) {
  const { accessToken, syncCode, linkWithCode } = useDeviceAuth();
  const { entries, isLoading, addEntry, updateEntry, removeEntry } = useMealLog(accessToken);
  const { capture, pickFromAlbum, isCapturing } = useMealPhotoCapture();
  const { analyzePhoto } = useMealAnalysis(accessToken);
  const { promptMemo } = useMealMemoPrompt();
  const { promptSyncCode } = useSyncCodePrompt();
  const { mission, toggleComplete } = useMealMission();
  const streak = useMealStreak(entries);
  const { stage, nextStage, progress } = useMealGrowth(entries.length);
  const dialog = useDialog();
  const toast = useToast();
  const capturePress = usePressScale(0.98);
  const albumPress = usePressScale(0.98);

  const saveNewEntry = useCallback(
    async (photo: { dataUri: string } | null) => {
      if (!photo) {
        return;
      }

      toast.openToast("AI가 사진을 분석하고 있어요...");
      const analyzed = await analyzePhoto(photo.dataUri);

      const memo = await promptMemo(analyzed ?? "");
      if (memo === null) {
        return;
      }

      await addEntry(photo.dataUri, memo || pickRandomComment());
      toast.openToast("오늘의 한 끼가 기록됐어요!");
    },
    [analyzePhoto, promptMemo, addEntry, toast],
  );

  const handleCapture = useCallback(async () => {
    await saveNewEntry(await capture());
  }, [capture, saveNewEntry]);

  const handleAlbumPick = useCallback(async () => {
    await saveNewEntry(await pickFromAlbum());
  }, [pickFromAlbum, saveNewEntry]);

  const handleEdit = useCallback(
    async (id: string, currentComment: string) => {
      const memo = await promptMemo(currentComment);
      if (memo === null) {
        return;
      }

      await updateEntry(id, memo || pickRandomComment());
    },
    [promptMemo, updateEntry],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmed = await dialog.openConfirm({
        title: "기록을 삭제할까요?",
        description: "삭제하면 되돌릴 수 없어요.",
        confirmButton: "삭제",
        cancelButton: "취소",
      });

      if (confirmed) {
        await removeEntry(id);
      }
    },
    [dialog, removeEntry],
  );

  const handleShowSyncCode = useCallback(() => {
    if (!syncCode) {
      return;
    }

    dialog.openAlert({
      title: "내 동기화 코드",
      description: `${syncCode}\n\n다른 기기에서 이 코드를 입력하면 지금 기록을 그대로 이어서 쓸 수 있어요.`,
    });
  }, [dialog, syncCode]);

  const handleLinkDevice = useCallback(async () => {
    const code = await promptSyncCode({
      header: "다른 기기 연결하기",
      confirmButton: "연결",
    });
    if (!code) {
      return;
    }

    const success = await linkWithCode(code);
    toast.openToast(
      success ? "연결됐어요! 기록을 불러올게요." : "코드를 다시 확인해주세요.",
    );
  }, [promptSyncCode, linkWithCode, toast]);

  useMealNudge({ enabled: true, onConfirm: handleCapture });

  return (
    <>
      <Top
        title={<Top.TitleParagraph size={22}>식단 기록</Top.TitleParagraph>}
        right={<Top.RightButton onClick={onBack}>홈으로</Top.RightButton>}
      />

      <div
        style={{
          margin: "0 24px 16px",
          padding: "16px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #FFF3E4 0%, #FDE0BE 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Asset.Image
            alt={`Lv.${stage.level} ${stage.label}`}
            frameShape={{ width: 48 }}
            backgroundColor="transparent"
            src={`${import.meta.env.BASE_URL}${stage.image}`}
          />
          <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "15px", fontWeight: "bold", color: colors.grey900 }}>
              Lv.{stage.level} {stage.label}
            </span>
            <span style={{ fontSize: "13px", fontWeight: "bold", color: colors.orange600 }}>
              연속 {streak}일
            </span>
          </div>
        </div>

        <div style={{ marginTop: "14px" }}>
          <div
            style={{
              height: "6px",
              borderRadius: "999px",
              backgroundColor: "rgba(255, 255, 255, 0.6)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.round(progress * 100)}%`,
                borderRadius: "999px",
                background: "linear-gradient(90deg, #FD9B3C, #F2762A)",
              }}
            />
          </div>
          <div style={{ fontSize: "12px", color: colors.grey700, marginTop: "6px" }}>
            {nextStage ? `다음 단계까지 ${Math.round(progress * 100)}%` : "최고 단계예요!"}
          </div>
        </div>
      </div>

      {mission && (
        <div
          style={{
            margin: "0 24px 16px",
            padding: "16px",
            borderRadius: "16px",
            backgroundColor: colors.grey100,
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: "bold", color: colors.orange600, marginBottom: "6px" }}>
            오늘의 미션
          </div>
          <div
            style={{
              fontSize: "15px",
              fontWeight: "bold",
              color: colors.grey900,
              marginBottom: "12px",
              textDecoration: mission.completed ? "line-through" : "none",
            }}
          >
            {mission.text}
          </div>
          <Button
            size="small"
            variant={mission.completed ? "weak" : "fill"}
            color="dark"
            onClick={toggleComplete}
          >
            {mission.completed ? "완료 취소하기" : "완료했어요"}
          </Button>
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", padding: "0 24px 16px" }}>
        <div
          onClick={isCapturing ? undefined : handleCapture}
          {...capturePress.pressHandlers}
          style={{
            flex: 1,
            textAlign: "center",
            padding: "16px 8px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #FD9B3C, #F2762A)",
            boxShadow: "0 8px 18px rgba(242,118,42,0.3)",
            color: colors.white,
            fontWeight: "bold",
            fontSize: "15px",
            cursor: isCapturing ? "default" : "pointer",
            opacity: isCapturing ? 0.6 : 1,
            ...capturePress.pressStyle,
          }}
        >
          {isCapturing ? "처리 중..." : "사진으로 기록"}
        </div>
        <div
          onClick={isCapturing ? undefined : handleAlbumPick}
          {...albumPress.pressHandlers}
          style={{
            flex: 1,
            textAlign: "center",
            padding: "16px 8px",
            borderRadius: "16px",
            backgroundColor: colors.white,
            border: `1px solid ${colors.grey200}`,
            color: colors.grey800,
            fontWeight: "bold",
            fontSize: "15px",
            cursor: isCapturing ? "default" : "pointer",
            ...albumPress.pressStyle,
            opacity: isCapturing ? 0.6 : 1,
          }}
        >
          앨범에서 선택
        </div>
      </div>

      <div style={{ padding: "0 24px 8px" }}>
        <span style={{ fontSize: "16px", fontWeight: "bold", color: colors.grey900 }}>
          기록한 한 끼 · {entries.length}개
        </span>
      </div>

      {!isLoading && entries.length === 0 && (
        <div style={{ padding: "40px 24px", textAlign: "center" }}>
          <span style={{ color: colors.grey600 }}>
            아직 기록이 없어요. 첫 끼니를 남겨보세요!
          </span>
        </div>
      )}

      {entries.length > 0 && (
        <List>
          {entries.map((entry) => {
            const calorie = extractCalorie(entry.comment);

            return (
              <ListRow
                key={entry.id}
                verticalPadding="large"
                left={
                  <ListRow.AssetImage
                    src={entry.photoDataUri}
                    shape="square"
                    size="small"
                  />
                }
                contents={
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        color: colors.grey800,
                        fontWeight: "bold",
                        fontSize: "15px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {entry.comment}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginTop: "4px",
                      }}
                    >
                      {calorie && (
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "bold",
                            color: colors.orange600,
                            backgroundColor: colors.orange50,
                            padding: "2px 8px",
                            borderRadius: "999px",
                            flexShrink: 0,
                          }}
                        >
                          {calorie}
                        </span>
                      )}
                      <span style={{ fontSize: "12px", color: colors.grey600 }}>
                        {formatTime(entry.createdAt)}
                      </span>
                    </div>
                  </div>
                }
                right={
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "6px",
                    }}
                  >
                    <TextButton
                      size="small"
                      color={colors.grey600}
                      onClick={() => handleEdit(entry.id, entry.comment)}
                    >
                      수정
                    </TextButton>
                    <TextButton
                      size="small"
                      color={colors.red500}
                      onClick={() => handleDelete(entry.id)}
                    >
                      삭제
                    </TextButton>
                  </div>
                }
              />
            );
          })}
        </List>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          padding: "8px 24px 0",
        }}
      >
        <TextButton size="small" color={colors.grey600} onClick={handleShowSyncCode}>
          내 동기화 코드 보기
        </TextButton>
        <TextButton size="small" color={colors.grey600} onClick={handleLinkDevice}>
          다른 기기 연결하기
        </TextButton>
      </div>
    </>
  );
}
