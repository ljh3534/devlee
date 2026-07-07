import { colors } from "@toss/tds-colors";
import { Top, useToast } from "@toss/tds-mobile";
import { useCallback, useState } from "react";

import { useDeviceAuth } from "../hooks/useDeviceAuth";
import { useFriends } from "../hooks/useFriends";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { useNickname } from "../hooks/useNickname";
import { useNicknamePrompt } from "../hooks/useNicknamePrompt";
import { useSyncCodePrompt } from "../hooks/useSyncCodePrompt";

const RANK_BADGE_COLORS = ["#FBE39B", colors.grey200, "#F3C892"];

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

function RankBadge({ rank }: { rank: number }) {
  const backgroundColor = RANK_BADGE_COLORS[rank - 1] ?? colors.grey100;

  return (
    <div
      style={{
        width: "28px",
        height: "28px",
        borderRadius: "999px",
        backgroundColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "13px",
        fontWeight: "bold",
        color: colors.grey800,
        flexShrink: 0,
      }}
    >
      {rank}
    </div>
  );
}

function InitialAvatar({ text }: { text: string }) {
  return (
    <div
      style={{
        width: "28px",
        height: "28px",
        borderRadius: "999px",
        backgroundColor: colors.blue100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "bold",
        color: colors.blue700,
        flexShrink: 0,
      }}
    >
      {text.slice(0, 1)}
    </div>
  );
}

interface RankCardProps {
  left: React.ReactNode;
  name: string;
  count: number;
}

function RankCard({ left, name, count }: RankCardProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 16px",
        borderRadius: "14px",
        backgroundColor: colors.white,
        border: `1px solid ${colors.grey200}`,
        marginBottom: "8px",
      }}
    >
      {left}
      <span style={{ flex: 1, fontSize: "15px", color: colors.grey900 }}>{name}</span>
      <span style={{ fontSize: "14px", color: colors.grey600 }}>{count}개</span>
    </div>
  );
}

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
  const nicknamePress = usePressScale(0.97);
  const friendAddPress = usePressScale(0.97);

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
        right={<Top.RightButton onClick={onBack}>홈으로</Top.RightButton>}
      />

      <div
        style={{
          margin: "0 24px 20px",
          padding: "18px",
          borderRadius: "16px",
          backgroundColor: colors.grey900,
        }}
      >
        {myRank && (
          <div style={{ color: colors.white, fontSize: "14px", lineHeight: 1.5, marginBottom: "12px" }}>
            {nickname
              ? `내 순위: ${myRank.rank}위 (기록 ${myRank.mealCount}개)`
              : `닉네임을 설정하면 랭킹에 참여할 수 있어요 (현재 기록 ${myRank.mealCount}개)`}
          </div>
        )}
        <div
          onClick={handleSetNickname}
          {...nicknamePress.pressHandlers}
          style={{
            display: "inline-block",
            padding: "8px 16px",
            borderRadius: "999px",
            backgroundColor: colors.blue500,
            color: colors.white,
            fontSize: "13px",
            fontWeight: "bold",
            cursor: "pointer",
            ...nicknamePress.pressStyle,
          }}
        >
          {nickname ? "닉네임 변경하기" : "닉네임 설정하기"}
        </div>
      </div>

      <div style={{ padding: "0 24px 8px" }}>
        <span style={{ fontSize: "16px", fontWeight: "bold", color: colors.grey900 }}>
          전체 랭킹
        </span>
      </div>

      <div style={{ padding: "0 24px" }}>
        {entries.map((entry, index) => (
          <RankCard
            key={`${entry.nickname}-${index}`}
            left={<RankBadge rank={index + 1} />}
            name={entry.nickname}
            count={entry.mealCount}
          />
        ))}
      </div>

      {entries.length === 0 && (
        <div style={{ padding: "0 24px 16px", textAlign: "center" }}>
          <span style={{ color: colors.grey600 }}>
            아직 랭킹에 참여한 사람이 없어요.
          </span>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px 8px",
        }}
      >
        <span style={{ fontSize: "16px", fontWeight: "bold", color: colors.grey900 }}>
          친구
        </span>
        <div
          onClick={handleAddFriend}
          {...friendAddPress.pressHandlers}
          style={{
            padding: "6px 14px",
            borderRadius: "999px",
            backgroundColor: colors.blue100,
            color: colors.blue700,
            fontSize: "13px",
            fontWeight: "bold",
            cursor: "pointer",
            ...friendAddPress.pressStyle,
          }}
        >
          + 친구 추가
        </div>
      </div>

      <div style={{ padding: "0 24px" }}>
        {friends.map((friend, index) => (
          <RankCard
            key={`${friend.nickname}-${index}`}
            left={<InitialAvatar text={friend.nickname ?? "?"} />}
            name={friend.nickname ?? "닉네임 미설정"}
            count={friend.mealCount}
          />
        ))}
      </div>

      {friends.length === 0 && (
        <div style={{ padding: "0 24px 16px", textAlign: "center" }}>
          <span style={{ color: colors.grey600 }}>아직 추가한 친구가 없어요.</span>
        </div>
      )}
    </>
  );
}
