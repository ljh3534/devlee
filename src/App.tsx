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

interface HomeCtaCardProps {
  title: string;
  subtitle: string;
  variant: "primary" | "secondary";
  onClick: () => void;
}

function HomeCtaCard({ title, subtitle, variant, onClick }: HomeCtaCardProps) {
  const isPrimary = variant === "primary";

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 20px",
        borderRadius: "16px",
        backgroundColor: isPrimary ? colors.orange500 : colors.white,
        border: isPrimary ? "none" : `1px solid ${colors.grey200}`,
        cursor: "pointer",
      }}
    >
      <div>
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
        <Asset.Image
          alt={`Lv.${stage.level} ${stage.label}`}
          frameShape={{ width: 140 }}
          backgroundColor="transparent"
          src={`${import.meta.env.BASE_URL}${stage.image}`}
        />
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
          padding: "24px 24px 0",
        }}
      >
        <HomeCtaCard
          variant="primary"
          title="오늘 뭐 먹었는지 기록하기"
          subtitle="사진 찍고 30초 만에 기록 끝"
          onClick={() => setPage("meal")}
        />
        <HomeCtaCard
          variant="secondary"
          title="랭킹 · 친구"
          subtitle="다른 사람들과 기록량을 비교해보세요"
          onClick={() => setPage("leaderboard")}
        />
      </div>

      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Asset.Image
          alt="apps in toss logo"
          frameShape={{ width: 120 }}
          backgroundColor="transparent"
          src={`${import.meta.env.BASE_URL}appsintoss-logo.png`}
        />
      </div>
    </div>
  );
}

export default App;
