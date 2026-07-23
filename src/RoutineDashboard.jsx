import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ─── Config: change these to your children's names & emojis ──────────────────
const CHILDREN = [
  { name: "Child 1", emoji: "⭐" },
  { name: "Child 2", emoji: "🌈" },
];

// ─── SVG toothbrush (🪥 isn't supported on iOS < 14) ─────────────────────────
// Narrow handle + small oval head + tufted bristles = unmistakably a toothbrush
const ToothbrushIcon = ({ completed, size = 70 }) => {
  const handle = completed ? "rgba(255,255,255,0.88)" : "#3A9FCC";
  const bristle = completed ? "#7B6CF6" : "#FFFFFF";
  return (
    <svg viewBox="0 0 44 130" width={size * 0.5} height={size} xmlns="http://www.w3.org/2000/svg">
      {/* Bristle tufts — clearly separate from head, grouped in pairs */}
      {[6, 14, 22, 30, 38].map((x) => (
        <rect key={x} x={x} y={0} width={6} height={22} rx={3}
          fill={bristle} opacity={0.93} />
      ))}
      {/* Head — narrow oval, clearly smaller than a razor blade */}
      <rect x={2} y={20} width={40} height={20} rx={10} fill={handle} />
      {/* Neck — thin connector */}
      <rect x={18} y={38} width={8} height={14} rx={4} fill={handle} />
      {/* Handle — long, slim */}
      <rect x={14} y={50} width={16} height={74} rx={8} fill={handle} />
      {/* Grip ridges */}
      {[66, 78, 90].map((y) => (
        <rect key={y} x={17} y={y} width={10} height={5} rx={2.5}
          fill={completed ? "#7B6CF6" : "rgba(255,255,255,0.38)"} />
      ))}
    </svg>
  );
};

// ─── Tasks ────────────────────────────────────────────────────────────────────
const MORNING_TASKS = [
  { id: "wake",      label: "Wake Up",       emoji: "🌞" },
  { id: "potty",     label: "Potty",         emoji: "🚽" },
  { id: "brush-am",  label: "Brush Teeth",   Icon: ToothbrushIcon },
  { id: "dress",     label: "Get Dressed",   emoji: "👕" },
  { id: "breakfast", label: "Eat Breakfast", emoji: "🥣" },
  { id: "bag",       label: "Pack Bag",      emoji: "🎒" },
];

const EVENING_TASKS = [
  { id: "dinner",    label: "Dinner",       emoji: "🍽️" },
  { id: "bath",      label: "Bath Time",    emoji: "🛁" },
  { id: "brush-pm",  label: "Brush Teeth",  Icon: ToothbrushIcon },
  { id: "pjs",       label: "Put On PJs",   emoji: "🌙" },
  { id: "story",     label: "Story Time",   emoji: "📚" },
  { id: "lights",    label: "Lights Out",   emoji: "⭐" },
];

// ─── Palettes ─────────────────────────────────────────────────────────────────
const PALETTES = {
  morning: {
    bg:         "linear-gradient(160deg, #FFE9C7 0%, #FFD3A8 50%, #FFC2C2 100%)",
    accent:     "#FF8A5B",
    accentSoft: "#FFD8B5",
    text:       "#6B4226",
    tile:       "#FFFDF8",
    divider:    "rgba(107,66,38,0.12)",
    title:      "Good Morning!",
    icon:       "☀️",
  },
  evening: {
    bg:         "linear-gradient(160deg, #C9D6FF 0%, #B6C4FF 50%, #9AAEEB 100%)",
    accent:     "#7B6CF6",
    accentSoft: "#D8D4FF",
    text:       "#3B3566",
    tile:       "#FBFAFF",
    divider:    "rgba(59,53,102,0.12)",
    title:      "Good Evening!",
    icon:       "🌙",
  },
};

function getMode(date) {
  const h = date.getHours() + date.getMinutes() / 60;
  if (h >= 5  && h < 12) return "morning";
  if (h >= 17 && h < 21) return "evening";
  const dist = (a, b) => { const d = Math.abs(a - b); return Math.min(d, 24 - d); };
  return dist(h, 8.5) <= dist(h, 19) ? "morning" : "evening";
}

// ─── DragScroll ───────────────────────────────────────────────────────────────
function DragScroll({ children, padX = 32, gap = 16 }) {
  const viewportRef = useRef(null);
  const trackRef    = useRef(null);
  const s = useRef({ active:false, startX:0, startT:0, translate:0, prevX:0, prevTime:0, velocity:0, rafId:null });

  const applyT = (x) => {
    if (trackRef.current) trackRef.current.style.transform = `translateX(${x}px)`;
    s.current.translate = x;
  };
  const getMin = useCallback(() => {
    if (!viewportRef.current || !trackRef.current) return 0;
    const gap2 = trackRef.current.scrollWidth - viewportRef.current.offsetWidth;
    return gap2 > 0 ? -gap2 : 0;
  }, []);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const cancel = () => { if (s.current.rafId) { cancelAnimationFrame(s.current.rafId); s.current.rafId = null; } };

  const settle = useCallback(() => {
    const min = getMin(), diff = clamp(s.current.translate, min, 0) - s.current.translate;
    if (Math.abs(diff) < 0.5) { applyT(clamp(s.current.translate, min, 0)); return; }
    applyT(s.current.translate + diff * 0.18);
    s.current.rafId = requestAnimationFrame(settle);
  }, [getMin]);

  const glide = useCallback(() => {
    const min = getMin();
    s.current.velocity *= 0.93;
    const next = s.current.translate + s.current.velocity * 16;
    if (next > 0 || next < min) {
      applyT(clamp(next, min, 0)); s.current.velocity = 0;
      s.current.rafId = requestAnimationFrame(settle); return;
    }
    applyT(next);
    if (Math.abs(s.current.velocity) > 0.02) s.current.rafId = requestAnimationFrame(glide);
  }, [getMin, settle]);

  const startDrag = (x) => {
    cancel();
    Object.assign(s.current, { active:true, startX:x, startT:s.current.translate, prevX:x, prevTime:Date.now(), velocity:0 });
  };
  const moveDrag = (x, e) => {
    if (!s.current.active) return;
    const dx = x - s.current.startX;
    if (Math.abs(dx) > 8 && e) e.preventDefault();
    const now = Date.now(), dt = Math.max(now - s.current.prevTime, 1);
    s.current.velocity = (x - s.current.prevX) / dt;
    s.current.prevX = x; s.current.prevTime = now;
    const min = getMin();
    let next = s.current.startT + dx;
    if (next > 0) next *= 0.3; else if (next < min) next = min + (next - min) * 0.3;
    applyT(next);
  };
  const endDrag = () => {
    s.current.active = false;
    s.current.velocity *= 16;
    s.current.rafId = requestAnimationFrame(glide);
  };

  const onTouchStart = useCallback((e) => startDrag(e.touches[0].clientX), []);
  const onTouchMove  = useCallback((e) => moveDrag(e.touches[0].clientX, e), [getMin]);
  const onTouchEnd   = useCallback(endDrag, [glide]);

  const onMouseDown  = useCallback((e) => {
    startDrag(e.clientX);
    const onMove = (ev) => moveDrag(ev.clientX, null);
    const onUp   = () => { endDrag(); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  }, [getMin, glide]);

  return (
    <div ref={viewportRef} onTouchStart={onTouchStart} onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd} onMouseDown={onMouseDown}
      style={{ flex:1, position:"relative", overflow:"hidden", userSelect:"none", WebkitUserSelect:"none" }}>
      <div ref={trackRef} style={{
        display:"inline-flex", alignItems:"center",
        padding:`8px ${padX}px 16px`, gap, willChange:"transform",
        position:"absolute", top:0, left:0, height:"100%", cursor:"grab",
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
const CC = ["#FF8A5B","#FFC2C2","#FFD3A8","#7B6CF6","#9AAEEB","#FFE066","#6BCB77"];
function ConfettiPiece({ i }) {
  const left = useMemo(() => Math.random()*100, []);
  const delay = useMemo(() => Math.random()*1.5, []);
  const dur   = useMemo(() => 2.5+Math.random()*2, []);
  const size  = useMemo(() => 10+Math.random()*14, []);
  const rot   = useMemo(() => Math.random()*360, []);
  return <div style={{ position:"absolute", top:"-5%", left:`${left}%`, width:size, height:size*0.4,
    backgroundColor:CC[i%CC.length], borderRadius:3, opacity:0.9,
    animation:`confetti-fall ${dur}s ease-in ${delay}s infinite`, transform:`rotate(${rot}deg)` }} />;
}
function Confetti() {
  const ps = useMemo(() => Array.from({length:55},(_,i)=>i), []);
  return <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
    {ps.map(i => <ConfettiPiece key={i} i={i} />)}
  </div>;
}

// ─── Task Tile (compact) ──────────────────────────────────────────────────────
function TaskTile({ task, completed, onTap, palette, tileW, tileH, emojiSize, labelSize }) {
  const press   = (e) => { e.currentTarget.style.transform = "scale(0.90) translateY(6px)"; };
  const release = (e) => { e.currentTarget.style.transform = completed ? "scale(0.95) translateY(4px)" : "scale(1)"; };
  return (
    <button onClick={() => onTap(task.id)} onPointerDown={press} onPointerUp={release} onPointerLeave={release}
      style={{
        flexShrink:0, width:tileW, height:tileH, borderRadius:24, border:"none", outline:"none",
        cursor:"pointer", background:completed ? palette.accent : palette.tile,
        boxShadow: completed
          ? `0 8px 0 0 ${palette.accentSoft}, 0 12px 22px rgba(0,0,0,0.18)`
          : "0 7px 0 0 rgba(0,0,0,0.06), 0 10px 20px rgba(0,0,0,0.11)",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10,
        transition:"transform 0.15s ease, background 0.22s ease",
        transform: completed ? "scale(0.95) translateY(4px)" : "scale(1)",
        WebkitTapHighlightColor:"transparent", userSelect:"none", WebkitUserSelect:"none",
        position:"relative", overflow:"hidden",
      }}>
      <div style={{
        fontSize:emojiSize, lineHeight:1,
        transform: completed ? "scale(1.12) rotate(-5deg)" : "scale(1)",
        transition:"transform 0.3s cubic-bezier(.34,1.56,.64,1)",
        filter: completed ? "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" : "none",
      }}>
        {task.Icon ? <task.Icon completed={completed} size={emojiSize * 0.8} /> : task.emoji}
      </div>
      <div style={{
        fontSize:labelSize, fontWeight:800,
        color: completed ? "#FFFFFF" : palette.text,
        fontFamily:"'Baloo 2','Comic Sans MS',system-ui,sans-serif",
        textAlign:"center", padding:"0 10px", lineHeight:1.2,
      }}>
        {task.label}
      </div>
      {completed && (
        <div style={{
          position:"absolute", top:10, right:10, width:36, height:36, borderRadius:"50%",
          background:"rgba(255,255,255,0.92)", display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:20, animation:"pop-in 0.35s cubic-bezier(.34,1.56,.64,1)",
        }}>✅</div>
      )}
    </button>
  );
}

// ─── One child's half-screen lane ─────────────────────────────────────────────
function RoutineLane({ child, tasks, palette, completed, onToggle, tileW, tileH, emojiSize, labelSize }) {
  const allDone = tasks.every(t => completed[t.id]);
  return (
    <div style={{
      flex:1, display:"flex", flexDirection:"column", position:"relative", overflow:"hidden",
    }}>
      {/* Name bar */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 32px 4px", flexShrink:0 }}>
        <span style={{ fontSize:28 }}>{child.emoji}</span>
        <span style={{ fontSize:26, fontWeight:900, color:palette.text, fontFamily:"'Baloo 2','Comic Sans MS',system-ui,sans-serif", lineHeight:1.2 }}>
          {child.name}
        </span>
        {/* Progress dots */}
        <div style={{ display:"flex", gap:8, marginLeft:"auto" }}>
          {tasks.map(t => (
            <div key={t.id} style={{
              width:16, height:16, borderRadius:"50%",
              background: completed[t.id] ? palette.accent : "rgba(255,255,255,0.55)",
              border:`2.5px solid ${palette.accent}`,
              transition:"background 0.3s ease", flexShrink:0,
            }} />
          ))}
        </div>
      </div>

      {/* Tiles */}
      <DragScroll padX={32} gap={16}>
        {tasks.map(task => (
          <TaskTile key={task.id} task={task} completed={!!completed[task.id]}
            onTap={onToggle} palette={palette}
            tileW={tileW} tileH={tileH} emojiSize={emojiSize} labelSize={labelSize} />
        ))}
      </DragScroll>

      {/* Per-child celebration banner (stays in-lane) */}
      {allDone && (
        <div style={{
          position:"absolute", inset:0,
          background:`radial-gradient(circle at 50% 40%, ${palette.accentSoft} 0%, ${palette.accent} 100%)`,
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          zIndex:5,
        }}>
          <Confetti />
          <div style={{ fontSize:70, animation:"celebrate-bounce 1.2s ease-in-out infinite",
            filter:"drop-shadow(0 6px 14px rgba(0,0,0,0.2))" }}>🎉</div>
          <div style={{ fontSize:28, fontWeight:900, color:"#FFF",
            textShadow:"0 3px 10px rgba(0,0,0,0.2)", marginTop:6, textAlign:"center",
            fontFamily:"'Baloo 2','Comic Sans MS',system-ui,sans-serif" }}>
            Great job, {child.name}!
          </div>
          <button onClick={() => onToggle("__reset__")} style={{
            marginTop:20, fontSize:20, fontWeight:800, color:palette.accent,
            background:"#FFF", border:"none", borderRadius:999,
            padding:"14px 36px", boxShadow:"0 7px 0 0 rgba(0,0,0,0.1)", cursor:"pointer",
            fontFamily:"'Baloo 2','Comic Sans MS',system-ui,sans-serif",
          }}>
            Start Again 🔁
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function RoutineDashboard() {
  const [mode, setMode] = useState(() => getMode(new Date()));
  // completed[childIdx][taskId]
  const [completed, setCompleted] = useState([{}, {}]);

  useEffect(() => {
    const id = setInterval(() => setMode(getMode(new Date())), 30_000);
    return () => clearInterval(id);
  }, []);

  const tasks   = mode === "morning" ? MORNING_TASKS : EVENING_TASKS;
  const palette = PALETTES[mode];

  const makeToggle = (childIdx) => (id) => {
    if (id === "__reset__") {
      setCompleted(prev => prev.map((c, i) => i === childIdx ? {} : c));
      return;
    }
    setCompleted(prev => prev.map((c, i) =>
      i === childIdx ? { ...c, [id]: !c[id] } : c
    ));
  };

  // Tile sizing — compact to fit half the screen height comfortably
  const TILE_W  = 148;
  const TILE_H  = 188;
  const EMOJI_S = 64;
  const LABEL_S = 18;

  return (
    <div style={{
      position:"fixed", inset:0, background:palette.bg,
      display:"flex", flexDirection:"column",
      fontFamily:"'Baloo 2','Comic Sans MS',system-ui,sans-serif",
      overflow:"hidden",
    }}>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform:translateY(0)     rotate(0deg);   opacity:0.95; }
          100% { transform:translateY(115vh) rotate(540deg); opacity:0.6;  }
        }
        @keyframes pop-in {
          0%   { transform:scale(0);   opacity:0; }
          70%  { transform:scale(1.2); opacity:1; }
          100% { transform:scale(1);   opacity:1; }
        }
        @keyframes celebrate-bounce {
          0%,100% { transform:translateY(0)    scale(1);    }
          50%     { transform:translateY(-14px) scale(1.05); }
        }
      `}</style>

      {/* Shared header — small, time-of-day label */}
      <div style={{ padding:"12px 32px 4px", flexShrink:0, display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:28 }}>{palette.icon}</span>
        <span style={{ fontSize:24, fontWeight:900, color:palette.text, lineHeight:1.2 }}>
          {palette.title}
        </span>
      </div>

      {/* Divider at midpoint */}
      <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
        {CHILDREN.map((child, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && (
              <div style={{ height:3, background:palette.divider, flexShrink:0, margin:"0 24px" }} />
            )}
            <RoutineLane
              child={child}
              tasks={tasks}
              palette={palette}
              completed={completed[idx]}
              onToggle={makeToggle(idx)}
              tileW={TILE_W} tileH={TILE_H}
              emojiSize={EMOJI_S} labelSize={LABEL_S}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
