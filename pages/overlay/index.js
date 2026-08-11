import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import TeamCard from "../../components/TeamCard";
import { useScoreboard } from "../../lib/useScoreboard";
import { computePoints } from "../../lib/points";

// ── Card dimensions ──────────────────────────────────────────────────────────
// The SVG viewBox is 334×281. We render at CARD_W wide, so the actual
// rendered height is CARD_W × (281/334).
const CARD_W = 220;
const CARD_H = Math.round(CARD_W * (281 / 334)); // ≈ 185 px

// ── Layout constants ─────────────────────────────────────────────────────────
const HORIZ_GAP   = 14;   // px gap between cards in horizontal mode
const VERT_OVERLAP = 0.30; // 30 % overlap in vertical mode

// ── Helpers ──────────────────────────────────────────────────────────────────
function getOffset(idx, horizontal) {
  if (horizontal) return idx * (CARD_W + HORIZ_GAP);
  return idx * CARD_H * (1 - VERT_OVERLAP);
}

export default function OverlayAll() {
  const { state } = useScoreboard(1000);
  const isHoriz = state?.layout === "horizontal";
  const allTeams = state?.teams?.filter((t) => !t.hidden) ?? [];

  // Sorted highest → lowest points.
  // Vertical:   index 0 = TOP   (highest pts)
  // Horizontal: index 0 = LEFT  (highest pts), last index = RIGHT (lowest pts)
  const displayTeams = [...allTeams].sort(
    (a, b) => computePoints(b.form || []) - computePoints(a.form || [])
  );

  const n = displayTeams.length;

  // ── Animation: track each team's pixel offset and animate when order changes
  const prevIdsRef = useRef(null);
  const [positions, setPositions]   = useState({});
  const [animating, setAnimating]   = useState(false);

  // Set positions immediately (no animation) when layout mode or team count changes
  useEffect(() => {
    if (n === 0) return;
    const next = {};
    displayTeams.forEach((t, i) => { next[t.id] = getOffset(i, isHoriz); });
    setPositions(next);
    prevIdsRef.current = displayTeams.map((t) => t.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHoriz, n]);

  // Animate to new positions when point-order changes
  const orderKey = displayTeams.map((t) => t.id).join(",");
  useEffect(() => {
    if (n === 0) return;
    const prev = prevIdsRef.current;
    if (!prev) return;
    const changed = prev.length !== n || prev.some((id, i) => id !== displayTeams[i]?.id);
    if (!changed) return;

    setAnimating(true);
    const next = {};
    displayTeams.forEach((t, i) => { next[t.id] = getOffset(i, isHoriz); });
    setPositions(next);
    prevIdsRef.current = displayTeams.map((t) => t.id);
    const t = setTimeout(() => setAnimating(false), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderKey, isHoriz]);

  if (n === 0) return null;

  const containerW = isHoriz ? n * CARD_W + (n - 1) * HORIZ_GAP : CARD_W;
  const containerH = isHoriz ? CARD_H : CARD_H + getOffset(n - 1, false);

  return (
    <>
      <Head>
        <title>Scoreboard Overlay</title>
      </Head>
      <div
        style={{
          background: "transparent",
          position: "relative",
          width: containerW,
          height: containerH,
          overflow: "visible",
        }}
      >
        {/* Render lowest-ranked first so highest-ranked is painted on top (vertical) */}
        {[...displayTeams].reverse().map((t, revIdx) => {
          const idx    = n - 1 - revIdx;
          const offset = positions[t.id] ?? getOffset(idx, isHoriz);
          const zIndex = isHoriz ? 1 : idx + 1; // vertical: highest pts on top

          return (
            <div
              key={t.id}
              style={{
                position:   "absolute",
                width:      CARD_W,
                height:     CARD_H,
                left:       isHoriz ? offset : 0,
                top:        isHoriz ? 0      : offset,
                zIndex,
                transition: animating
                  ? "left 0.65s cubic-bezier(0.4,0,0.2,1), top 0.65s cubic-bezier(0.4,0,0.2,1)"
                  : "none",
              }}
            >
              <TeamCard
                name={t.name}
                color={t.color}
                players={t.players}
                form={t.form}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
