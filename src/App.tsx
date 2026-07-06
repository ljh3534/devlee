import { colors } from "@toss/tds-colors";
import { Asset } from "@toss/tds-mobile";
import "./App.css";
import { useDeviceAuth } from "./hooks/useDeviceAuth";
import { useMealGrowth } from "./hooks/useMealGrowth";
import { useMealLog } from "./hooks/useMealLog";
import { useMealStreak } from "./hooks/useMealStreak";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { MealLogPage } from "./pages/MealLogPage";
import { useState } from "react";

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

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div
      style={{
        flex: 1,
        padding: "12px 8px",
        borderRadius: "16px",
        backgroundColor: colors.white,
        border: `1px solid ${colors.grey200}`,
        boxShadow: "0 2px 10px rgba(25,31,40,0.05)",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "17px", fontWeight: "bold", color: colors.grey900 }}>
        {value}
      </div>
      <div style={{ fontSize: "12px", color: colors.grey600, marginTop: "2px" }}>
        {label}
      </div>
    </div>
  );
}

function CameraIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function TrophyIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M17 5h3a2 2 0 0 1-2 4M7 5H4a2 2 0 0 0 2 4" />
    </svg>
  );
}

interface HomeCtaCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  variant: "primary" | "secondary";
  onClick: () => void;
}

function HomeCtaCard({ icon, title, subtitle, variant, onClick }: HomeCtaCardProps) {
  const isPrimary = variant === "primary";
  const { pressStyle, pressHandlers } = usePressScale(0.98);

  return (
    <div
      onClick={onClick}
      {...pressHandlers}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "18px 20px",
        borderRadius: "16px",
        background: isPrimary ? "linear-gradient(135deg, #FD9B3C, #F2762A)" : colors.white,
        border: isPrimary ? "none" : `1px solid ${colors.grey200}`,
        boxShadow: isPrimary ? "0 12px 26px rgba(242,118,42,0.35)" : undefined,
        cursor: "pointer",
        ...pressStyle,
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "999px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isPrimary ? "rgba(255, 255, 255, 0.25)" : colors.orange100,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: isPrimary ? colors.white : colors.grey900,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "13px",
            marginTop: "4px",
            color: isPrimary ? colors.white : colors.grey600,
            opacity: isPrimary ? 0.85 : 1,
          }}
        >
          {subtitle}
        </div>
      </div>
      <span style={{ fontSize: "20px", color: isPrimary ? colors.white : colors.grey400 }}>
        ›
      </span>
    </div>
  );
}

function App() {
  const [page, setPage] = useState<string | null>(null);
  const { accessToken } = useDeviceAuth();
  const { entries } = useMealLog(accessToken);
  const streak = useMealStreak(entries);
  const { stage, progress } = useMealGrowth(entries.length);

  if (page === "meal") return <MealLogPage onBack={() => setPage(null)} />;
  if (page === "leaderboard") return <LeaderboardPage onBack={() => setPage(null)} />;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #FDEBD8 0%, #FFFFFF 45%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "24px 24px 0" }}>
        <Asset.Image
          alt="오늘뭐먹"
          frameShape={{ width: 24 }}
          backgroundColor="transparent"
          src={`${import.meta.env.BASE_URL}whatimeat-logo.png`}
        />
        <span style={{ fontSize: "14px", fontWeight: "bold", color: colors.grey700 }}>
          오늘뭐먹
        </span>
      </div>

      <div style={{ padding: "20px 24px 0" }}>
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: colors.grey900,
            lineHeight: 1.35,
          }}
        >
          오늘도 잘
          <br />
          챙겨 드셨나요?
        </div>
        <div style={{ fontSize: "15px", color: colors.grey600, marginTop: "8px" }}>
          사진 한 장으로 가볍게 식단을 기록해보세요
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "24px 24px 0" }}>
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background:
                "radial-gradient(closest-side, rgba(253,155,60,0.30), rgba(253,155,60,0) 72%)",
              zIndex: 0,
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <Asset.Image
              alt={`Lv.${stage.level} ${stage.label}`}
              frameShape={{ width: 140 }}
              backgroundColor="transparent"
              src={`${import.meta.env.BASE_URL}${stage.image}`}
            />
          </div>
        </div>
        <div
          style={{
            display: "inline-block",
            marginTop: "8px",
            padding: "4px 14px",
            borderRadius: "999px",
            backgroundColor: colors.white,
            fontSize: "13px",
            fontWeight: "bold",
            color: colors.orange500,
          }}
        >
          Lv.{stage.level} {stage.label}
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", padding: "24px 24px 0" }}>
        <StatCard label="총 기록" value={`${entries.length}개`} />
        <StatCard label="연속 기록" value={`${streak}일`} />
        <StatCard label="다음 단계" value={`${Math.round(progress * 100)}%`} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "24px 24px 40px",
        }}
      >
        <HomeCtaCard
          variant="primary"
          icon={<CameraIcon color={colors.white} />}
          title="오늘 뭐 먹었는지 기록하기"
          subtitle="사진 찍고 30초 만에 기록 끝"
          onClick={() => setPage("meal")}
        />
        <HomeCtaCard
          variant="secondary"
          icon={<TrophyIcon color={colors.orange500} />}
          title="랭킹 · 친구"
          subtitle="다른 사람들과 기록량을 비교해보세요"
          onClick={() => setPage("leaderboard")}
        />
      </div>
    </div>
  );
}

export default App;
