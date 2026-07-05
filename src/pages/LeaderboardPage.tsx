import { colors } from "@toss/tds-colors";
import { Button, List, ListRow, TextButton, Top, useToast } from "@toss/tds-mobile";
import { useCallback } from "react";

import { useDeviceAuth } from "../hooks/useDeviceAuth";
import { useFriends } from "../hooks/useFriends";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { useNickname } from "../hooks/useNickname";
import { useNicknamePrompt } from "../hooks/useNicknamePrompt";
import { useSyncCodePrompt } from "../hooks/useSyncCodePrompt";

interface LeaderboardPageProps {
  onBack: () => void;
}

export function LeaderboardPage({ onBack }: LeaderboardPageProps) {
  const { accessToken } = useDeviceAuth();
  const { nickname, setNickname } = useNickname(accessToken);
  const { entries, myRank, refresh } = useLeaderboard(accessToken);
  const { friends, addFriend } = useFriends(accessToken);
  const { promptNickname } = useNicknamePrompt();
  const { promptSyncCode } = useSyncCodePrompt();
  const toast = useToast();

  const handleSetNickname = useCallback(async () => {
    const name = await promptNickname(nickname ?? "");
    if (!name) {
      return;
    }

    const success = await setNickname(name);
    if (success) {
      toast.openToast("닉네임이 설정됐어요. 랭킹에 노출돼요!");
      await refresh();
    } else {
      toast.openToast("닉네임 설정에 실패했어요. 다시 시도해주세요.");
    }
  }, [promptNickname, nickname, setNickname, toast, refresh]);

  const handleAddFriend = useCallback(async () => {
    const code = await promptSyncCode({
      header: "친구 추가하기",
      confirmButton: "추가",
    });
    if (!code) {
      return;
    }

    const success = await addFriend(code);
    toast.openToast(success ? "친구를 추가했어요!" : "코드를 다시 확인해주세요.");
  }, [promptSyncCode, addFriend, toast]);

  return (
    <>
      <Top
        title={<Top.TitleParagraph size={22}>랭킹</Top.TitleParagraph>}
        subtitleBottom={
          <Top.SubtitleParagraph size={17}>
            닉네임을 설정하면 다른 사람들과 기록량을 비교할 수 있어요.
          </Top.SubtitleParagraph>
        }
      />

      <div
        style={{
          margin: "0 24px 16px",
          padding: "16px",
          borderRadius: "12px",
          backgroundColor: colors.grey100,
          textAlign: "center",
        }}
      >
        {myRank && (
          <div style={{ fontSize: "15px", color: colors.grey800, marginBottom: "8px" }}>
            {nickname
              ? `내 순위: ${myRank.rank}위 (기록 ${myRank.mealCount}개)`
              : `닉네임을 설정하면 랭킹에 참여할 수 있어요 (현재 기록 ${myRank.mealCount}개)`}
          </div>
        )}
        <Button size="small" variant="weak" color="dark" onClick={handleSetNickname}>
          {nickname ? "닉네임 변경하기" : "닉네임 설정하기"}
        </Button>
      </div>

      <List>
        {entries.map((entry, index) => (
          <ListRow
            key={`${entry.nickname}-${index}`}
            verticalPadding="medium"
            left={
              <div style={{ width: "24px", textAlign: "center", fontWeight: "bold" }}>
                {index + 1}
              </div>
            }
            contents={
              <ListRow.Texts
                type="1RowTypeA"
                top={entry.nickname}
                topProps={{ color: colors.grey800 }}
              />
            }
            right={
              <span style={{ color: colors.grey600, fontSize: "14px" }}>
                {entry.mealCount}개
              </span>
            }
          />
        ))}
      </List>

      {entries.length === 0 && (
        <div style={{ padding: "24px", textAlign: "center" }}>
          <span style={{ color: colors.grey600 }}>
            아직 랭킹에 참여한 사람이 없어요.
          </span>
        </div>
      )}

      <div style={{ padding: "24px 24px 8px" }}>
        <div style={{ fontSize: "16px", fontWeight: "bold", color: colors.grey800 }}>
          친구
        </div>
      </div>

      <List>
        {friends.map((friend, index) => (
          <ListRow
            key={`${friend.nickname}-${index}`}
            verticalPadding="medium"
            contents={
              <ListRow.Texts
                type="1RowTypeA"
                top={friend.nickname ?? "닉네임 미설정"}
                topProps={{ color: colors.grey800 }}
              />
            }
            right={
              <span style={{ color: colors.grey600, fontSize: "14px" }}>
                {friend.mealCount}개
              </span>
            }
          />
        ))}
      </List>

      {friends.length === 0 && (
        <div style={{ padding: "8px 24px 24px", textAlign: "center" }}>
          <span style={{ color: colors.grey600 }}>아직 추가한 친구가 없어요.</span>
        </div>
      )}

      <div style={{ padding: "0 24px 16px" }}>
        <Button size="small" variant="weak" color="dark" onClick={handleAddFriend}>
          친구 추가하기
        </Button>
      </div>

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
