import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import TeamCard from "../../components/TeamCard";
import { useScoreboard } from "../../lib/useScoreboard";
import { computePoints } from "../../lib/points";

// Card dimensions (must match TeamCard's internal VIEW_W / VIEW_H ratio)
const CARD_W = 220; // px when horizontal
const CARD_H = 281; // natural height (ratio ~1.28 of 220px width)

// Overlap fraction per layout — vertical fans out nicely with overlap,
// horizontal uses a plain gap (0 overlap) so cards sit side-by-side.
const OVERLAP_HORIZ = 0.0;  // 0% = spaced out, matching vertical feel
const OVERLAP_VERT  = 0.30; // 30% overlap for vertical stack

export default function OverlayAll() {
  const { state } = useScoreboard(1000);
  const isHoriz = state?.layout === "horizontal";
  const allTeams = state?.teams?.filter((t) => !t.hidden) ?? [];

  // Sort by points: highest first (will map to top/right)
  const sortedTeams = [...allTeams].sort(
    (a, b) => computePoints(b.form || []) - computePoints(a.form || [])
  );

  // Vertical:   highest points at TOP   (index 0), lowest at BOTTOM
  // Horizontal: highest points at LEFT  (index 0), lowest at RIGHT
  // sortedTeams is already highest-first, so use it directly for both.
  const displayTeams = sortedTeams;

  // Track previous order for animation
  const prevOrderRef = useRef(null);
  const [positions, setPositions] = useState({});
  const [animating, setAnimating] = useState(false);

  const n = displayTeams.length;

  // Calculate pixel offset for each card based on its rank
  function getOffset(idx, total, horizontal) {
    if (total === 0) return 0;
    const step = horizontal
      ? CARD_W  * (1 - OVERLAP_HORIZ)   // full card width — no overlap
      : CARD_H  * (1 - OVERLAP_VERT);   // 30% overlap for vertical
    return idx * step;
  }

  // On first render or team count change, set positions immediately (no animation)
  useEffect(() => {
    if (displayTeams.length === 0) return;
    const initial = {};
    displayTeams.forEach((t, idx) => {
      initial[t.id] = getOffset(idx, displayTeams.length, isHoriz);
    });
    setPositions(initial);
    prevOrderRef.current = displayTeams.map((t) => t.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHoriz, displayTeams.length]);

  // When order changes, animate to new positions
  useEffect(() => {
    if (displayTeams.length === 0) return;
    const newOrder = displayTeams.map((t) => t.id);
    const prev = prevOrderRef.current;
    if (!prev) return;

    const orderChanged =
      newOrder.length !== prev.length ||
      newOrder.some((id, i) => id !== prev[i]);

    if (orderChanged) {
      setAnimating(true);
      const next = {};
      displayTeams.forEach((t, idx) => {
        next[t.id] = getOffset(idx, displayTeams.length, isHoriz);
      });
      setPositions(next);
      prevOrderRef.current = newOrder;
      const timeout = setTimeout(() => setAnimating(false), 700);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayTeams.map((t) => t.id).join(","), isHoriz]);

  if (n === 0) return null;

  const containerW = isHoriz
    ? CARD_W + getOffset(n - 1, n, true)
    : CARD_W;
  const containerH = isHoriz
    ? CARD_H
    : CARD_H + getOffset(n - 1, n, false);

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
        {/* Render lowest-ranked first so highest-ranked renders on top (vertical z-index) */}
        {[...displayTeams].reverse().map((t, revIdx) => {
          const idx = n - 1 - revIdx; // actual position index (0 = highest ranked)
          const offset = positions[t.id] ?? getOffset(idx, n, isHoriz);
          // Vertical: highest rank on top. Horizontal: all same level (no overlap).
          const zIndex = isHoriz ? 1 : idx + 1;

          return (
            <div
              key={t.id}
              style={{
                position: "absolute",
                width: CARD_W,
                left: isHoriz ? offset : 0,
                top: isHoriz ? 0 : offset,
                zIndex: zIndex,
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
