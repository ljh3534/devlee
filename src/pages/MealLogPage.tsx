import { colors } from "@toss/tds-colors";
import {
  Asset,
  Button,
  List,
  ListRow,
  TextButton,
  Top,
  useDialog,
  useToast,
} from "@toss/tds-mobile";
import { useCallback } from "react";

import { useMealGrowth } from "../hooks/useMealGrowth";
import { useMealLog } from "../hooks/useMealLog";
import { useMealMemoPrompt } from "../hooks/useMealMemoPrompt";
import { useMealMission } from "../hooks/useMealMission";
import { useMealNudge } from "../hooks/useMealNudge";
import { useMealPhotoCapture } from "../hooks/useMealPhotoCapture";
import { useMealStreak } from "../hooks/useMealStreak";

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

interface MealLogPageProps {
  onBack: () => void;
}

export function MealLogPage({ onBack }: MealLogPageProps) {
  const { entries, isLoading, addEntry, updateEntry, removeEntry } = useMealLog();
  const { capture, pickFromAlbum, isCapturing } = useMealPhotoCapture();
  const { promptMemo } = useMealMemoPrompt();
  const { mission, toggleComplete } = useMealMission();
  const streak = useMealStreak(entries);
  const { stage } = useMealGrowth(entries.length);
  const dialog = useDialog();
  const toast = useToast();

  const saveNewEntry = useCallback(
    async (photo: { dataUri: string } | null) => {
      if (!photo) {
        return;
      }

      const memo = await promptMemo("");
      if (memo === null) {
        return;
      }

      await addEntry(photo.dataUri, memo || pickRandomComment());
      toast.openToast("오늘의 한 끼가 기록됐어요!");
    },
    [promptMemo, addEntry, toast],
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

  useMealNudge({ enabled: true, onConfirm: handleCapture });

  return (
    <>
      <Top
        title={<Top.TitleParagraph size={22}>오늘 뭐 먹었나요?</Top.TitleParagraph>}
        subtitleBottom={
          <Top.SubtitleParagraph size={17}>
            사진으로 가볍게 식단을 기록해보세요.
          </Top.SubtitleParagraph>
        }
      />

      <div style={{ padding: "0 24px 16px", textAlign: "center" }}>
        <Asset.Image
          alt={`성장 단계 Lv.${stage.level} ${stage.label}`}
          frameShape={{ width: 120 }}
          backgroundColor="transparent"
          src={`${import.meta.env.BASE_URL}${stage.image}`}
        />
        <div
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: colors.grey800,
            marginTop: "8px",
          }}
        >
          Lv.{stage.level} {stage.label}
        </div>
        <div style={{ fontSize: "13px", color: colors.grey600, marginTop: "2px" }}>
          연속 기록 {streak}일
        </div>
      </div>

      {mission && (
        <div
          style={{
            margin: "0 24px 16px",
            padding: "16px",
            borderRadius: "12px",
            border: `1px solid ${colors.grey200}`,
          }}
        >
          <div style={{ fontSize: "13px", color: colors.grey600, marginBottom: "4px" }}>
            오늘의 미션
          </div>
          <div
            style={{
              fontSize: "15px",
              color: colors.grey800,
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
        <Button
          color="dark"
          variant="fill"
          loading={isCapturing}
          onClick={handleCapture}
          style={{ flex: 1 }}
        >
          사진 찍기
        </Button>
        <Button
          color="dark"
          variant="weak"
          loading={isCapturing}
          onClick={handleAlbumPick}
          style={{ flex: 1 }}
        >
          앨범에서 선택
        </Button>
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
          {entries.map((entry) => (
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
                <ListRow.Texts
                  type="2RowTypeA"
                  top={entry.comment}
                  topProps={{ color: colors.grey800, fontWeight: "bold" }}
                  bottom={formatTime(entry.createdAt)}
                  bottomProps={{ color: colors.grey600 }}
                />
              }
              right={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <TextButton
                    size="small"
                    color={colors.grey600}
                    onClick={() => handleEdit(entry.id, entry.comment)}
                  >
                    수정
                  </TextButton>
                  <div
                    style={{ width: "1px", height: "12px", backgroundColor: colors.grey200 }}
                  />
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
          ))}
        </List>
      )}

      <TextButton
        style={{ padding: "16px 24px" }}
        size="medium"
        color={colors.blue500}
        onClick={onBack}
      >
        ← 홈으로
      </TextButton>
    </>
  );
}
