import React, { useEffect, useMemo, useRef, useState } from "react";

const MORNING_TASKS = [
  { id: "wake", label: "Wake Up", emoji: "🌞" },
  { id: "potty", label: "Potty", emoji: "🚽" },
  { id: "brush-am", label: "Brush Teeth", emoji: "🦷" },
  { id: "dress", label: "Get Dressed", emoji: "👕" },
  { id: "breakfast", label: "Eat Breakfast", emoji: "🥣" },
  { id: "bag", label: "Pack Bag", emoji: "🎒" },
];

const EVENING_TASKS = [
  { id: "dinner", label: "Dinner", emoji: "🍽️" },
  { id: "bath", label: "Bath Time", emoji: "🛁" },
  { id: "brush-pm", label: "Brush Teeth", emoji: "🦷" },
  { id: "pjs", label: "Put On PJs", emoji: "🌙" },
  { id: "story", label: "Story Time", emoji: "📚" },
  { id: "lights", label: "Lights Out", emoji: "⭐" },
];

const PALETTES = {
  morning: {
    bg: "linear-gradient(160deg, #FFE9C7 0%, #FFD3A8 45%, #FFC2C2 100%)",
    accent: "#FF8A5B",
    accentSoft: "#FFD8B5",
    text: "#6B4226",
    tile: "#FFFDF8",
    title: "Good Morning!",
    sub: "Let's get ready for the day",
  },
  evening: {
    bg: "linear-gradient(160deg, #C9D6FFDummy, #B6C4FF 0%, #9AAEEB 45%, #7C8FD6 100%)",
    accent: "#7B6CF6",
    accentSoft: "#D8D4FF",
    text: "#3B3566",
    tile: "#FBFAFF",
    title: "Good Evening!",
    sub: "Time to wind down for bed",
  },
};
// fix accidental typo in gradient string above
PALETTES.evening.bg = "linear-gradient(160deg, #C9D6FF 0%, #B6C4FF 45%, #9AAEEB 100%)";

function getMode(date) {
  const hour = date.getHours() + date.getMinutes() / 60;

  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 17 && hour < 21) return "evening";

  // Default to whichever period is closer in time-of-day distance.
  const morningCenter = 8.5; // midpoint of 5–12
  const eveningCenter = 19; // midpoint of 17–21

  const dist = (a, b) => {
    const diff = Math.abs(a - b);
    return Math.min(diff, 24 - diff);
  };

  return dist(hour, morningCenter) <= dist(hour, eveningCenter) ? "morning" : "evening";
}

const CONFETTI_COLORS = ["#FF8A5B", "#FFC2C2", "#FFD3A8", "#7B6CF6", "#9AAEEB", "#FFE066", "#6BCB77"];

function ConfettiPiece({ index }) {
  const left = useMemo(() => Math.random() * 100, []);
  const delay = useMemo(() => Math.random() * 1.5, []);
  const duration = useMemo(() => 2.5 + Math.random() * 2, []);
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const size = 10 + Math.random() * 14;
  const rotateStart = Math.random() * 360;

  return (
    <div
      style={{
        position: "absolute",
        top: "-5%",
        left: `${left}%`,
        width: size,
        height: size * 0.4,
        backgroundColor: color,
        borderRadius: 3,
        opacity: 0.9,
        animation: `confetti-fall ${duration}s ease-in ${delay}s infinite`,
        transform: `rotate(${rotateStart}deg)`,
      }}
    />
  );
}

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {pieces.map((i) => (
        <ConfettiPiece key={i} index={i} />
      ))}
    </div>
  );
}

function TaskTile({ task, completed, onTap, palette }) {
  return (
    <button
      onClick={() => onTap(task.id)}
      style={{
        flex: "0 0 auto",
        width: 260,
        height: 320,
        marginRight: 28,
        borderRadius: 36,
        border: "none",
        outline: "none",
        cursor: "pointer",
        background: completed ? palette.accent : palette.tile,
        boxShadow: completed
          ? `0 12px 0 0 ${palette.accentSoft}, 0 18px 30px rgba(0,0,0,0.18)`
          : "0 10px 0 0 rgba(0,0,0,0.06), 0 16px 30px rgba(0,0,0,0.12)",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        transition: "transform 0.18s ease, box-shadow 0.18s ease, background 0.25s ease",
        transform: completed ? "scale(0.96) translateY(6px)" : "scale(1)",
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
        position: "relative",
        overflow: "hidden",
        scrollSnapAlign: "start",
      }}
    >
      <div
        style={{
          fontSize: 110,
          lineHeight: 1,
          transform: completed ? "scale(1.15) rotate(-6deg)" : "scale(1)",
          transition: "transform 0.35s cubic-bezier(.34,1.56,.64,1)",
          filter: completed ? "drop-shadow(0 6px 10px rgba(0,0,0,0.15))" : "none",
        }}
      >
        {task.emoji}
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 800,
          color: completed ? "#FFFFFF" : palette.text,
          fontFamily: "'Baloo 2','Comic Sans MS',system-ui,sans-serif",
          textAlign: "center",
          padding: "0 16px",
        }}
      >
        {task.label}
      </div>

      {completed && (
        <div
          style={{
            position: "absolute",
            top: 18,
            right: 18,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            animation: "pop-in 0.4s cubic-bezier(.34,1.56,.64,1)",
          }}
        >
          ✅
        </div>
      )}
    </button>
  );
}

export default function RoutineDashboard() {
  const [now, setNow] = useState(() => new Date());
  const [mode, setMode] = useState(() => getMode(new Date()));
  const [completedByMode, setCompletedByMode] = useState({ morning: {}, evening: {} });
  const railRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = new Date();
      setNow(next);
      setMode(getMode(next));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const tasks = mode === "morning" ? MORNING_TASKS : EVENING_TASKS;
  const palette = PALETTES[mode];
  const completed = completedByMode[mode];
  const completedCount = tasks.filter((t) => completed[t.id]).length;
  const allDone = completedCount === tasks.length;

  const toggleTask = (id) => {
    setCompletedByMode((prev) => ({
      ...prev,
      [mode]: { ...prev[mode], [id]: !prev[mode][id] },
    }));
  };

  const resetMode = () => {
    setCompletedByMode((prev) => ({ ...prev, [mode]: {} }));
  };

  const scrollRail = (direction) => {
    const el = railRef.current;
    if (!el) return;

    const delta = direction * 300;
    try {
      el.scrollBy({ left: delta, behavior: "smooth" });
      return;
    } catch {
      // Older iOS Safari can throw on object-form scrollBy.
    }

    el.scrollLeft += delta;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: palette.bg,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Baloo 2','Comic Sans MS',system-ui,sans-serif",
        overflow: "hidden",
        touchAction: "auto",
      }}
    >
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.95; }
          100% { transform: translateY(115vh) rotate(540deg); opacity: 0.6; }
        }
        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes celebrate-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-22px) scale(1.05); }
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "48px 56px 12px", flexShrink: 0 }}>
        <div style={{ fontSize: 52, lineHeight: 1.25, fontWeight: 900, color: palette.text }}>
          {palette.title} {mode === "morning" ? "☀️" : "🌙"}
        </div>
        <div style={{ fontSize: 26, lineHeight: 1.4, color: palette.text, opacity: 0.7, marginTop: 10 }}>
          {palette.sub}
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 14, padding: "8px 56px 28px", flexShrink: 0 }}>
        {tasks.map((t) => (
          <div
            key={t.id}
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: completed[t.id] ? palette.accent : "rgba(255,255,255,0.55)",
              border: `3px solid ${palette.accent}`,
              transition: "background 0.3s ease",
            }}
          />
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 56px 8px", flexShrink: 0 }}>
        <button
          onClick={() => scrollRail(-1)}
          style={{
            border: "none",
            borderRadius: 999,
            padding: "10px 20px",
            fontSize: 22,
            fontWeight: 800,
            background: "rgba(255,255,255,0.82)",
            color: palette.text,
          }}
        >
          ◀
        </button>
        <button
          onClick={() => scrollRail(1)}
          style={{
            border: "none",
            borderRadius: 999,
            padding: "10px 20px",
            fontSize: 22,
            fontWeight: 800,
            background: "rgba(255,255,255,0.82)",
            color: palette.text,
          }}
        >
          ▶
        </button>
      </div>

      {/* Horizontal scrolling row */}
      <div
        ref={railRef}
        style={{
          display: "block",
          whiteSpace: "nowrap",
          overflowX: "scroll",
          overflowY: "hidden",
          padding: "10px 56px 64px",
          flex: 1,
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          touchAction: "auto",
          overscrollBehaviorX: "contain",
          scrollSnapType: "x proximity",
        }}
      >
        {tasks.map((task) => (
          <TaskTile
            key={task.id}
            task={task}
            completed={!!completed[task.id]}
            onTap={toggleTask}
            palette={palette}
          />
        ))}
      </div>

      {/* Celebration overlay */}
      {allDone && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 50% 40%, ${palette.accentSoft} 0%, ${palette.accent} 100%)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <Confetti />
          <div
            style={{
              fontSize: 140,
              animation: "celebrate-bounce 1.4s ease-in-out infinite",
              filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.2))",
            }}
          >
            🎉
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: "#FFFFFF",
              textShadow: "0 4px 14px rgba(0,0,0,0.2)",
              marginTop: 12,
              textAlign: "center",
              padding: "0 40px",
            }}
          >
            Great Job!
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#FFFFFF",
              opacity: 0.9,
              marginTop: 10,
              textAlign: "center",
            }}
          >
            You finished your {mode === "morning" ? "morning" : "evening"} routine!
          </div>

          <button
            onClick={resetMode}
            style={{
              marginTop: 56,
              fontSize: 30,
              fontWeight: 800,
              color: palette.accent,
              background: "#FFFFFF",
              border: "none",
              borderRadius: 999,
              padding: "22px 56px",
              boxShadow: "0 10px 0 0 rgba(0,0,0,0.12)",
              cursor: "pointer",
            }}
          >
            Start Again 🔁
          </button>
        </div>
      )}
    </div>
  );
}
