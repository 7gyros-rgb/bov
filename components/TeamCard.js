

import { CARD_SHELL } from "../lib/shapes";
import ResultBadge from "./ResultBadge";
import FootballIcon from "./FootballIcon";
import { computePoints } from "../lib/points";
 
const VIEW_W = 334;
const VIEW_H = 281;
const CENTER_X = VIEW_W / 2;

// ---- Pitch colour — team colours that look washed-out on the white card panel
// get automatically darkened so the lines are always legible. ----
function getPitchColor(hex) {
  // Parse hex to r/g/b (3 or 6 digit)
  const c = hex.replace("#", "");
  const r = parseInt(c.length === 3 ? c[0] + c[0] : c.slice(0, 2), 16) / 255;
  const g = parseInt(c.length === 3 ? c[1] + c[1] : c.slice(2, 4), 16) / 255;
  const b = parseInt(c.length === 3 ? c[2] + c[2] : c.slice(4, 6), 16) / 255;
  // Perceived luminance (sRGB approximation)
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  // If the color is too light, darken it by multiplying channels
  if (lum > 0.55) {
    const factor = 0.45;
    const dr = Math.round(r * 255 * factor);
    const dg = Math.round(g * 255 * factor);
    const db = Math.round(b * 255 * factor);
    return `rgb(${dr},${dg},${db})`;
  }
  return hex;
}
 
// ---- Pitch background — tweak these if you want it bigger/thicker/etc ----
const PITCH_LEFT = 26;
const PITCH_RIGHT = 308;
const PITCH_TOP = 114;
const PITCH_BOTTOM = 264;
const PITCH_STROKE_WIDTH = 1.8;
const PITCH_OPACITY = 1.0;

const PITCH_W = PITCH_RIGHT - PITCH_LEFT;  // 282
const PITCH_H = PITCH_BOTTOM - PITCH_TOP;  // 150
const PITCH_CX = (PITCH_LEFT + PITCH_RIGHT) / 2; // 167
const PITCH_MID_Y = (PITCH_TOP + PITCH_BOTTOM) / 2; // 189  — halfway line

// Full-pitch geometry (proportional to a real 105m × 68m pitch at our pixel scale)
const PITCH_PB_W = 168; // penalty box width  (40.3m / 68m × 282px)
const PITCH_PB_H = 30;  // penalty box height (16.5m / 105m × 150px, boosted slightly for readability)
const PITCH_GB_W = 80;  // goal area width    (18.3m / 68m × 282px)
const PITCH_GB_H = 12;  // goal area height   (5.5m  / 105m × 150px, boosted for readability)
const PITCH_CCR  = 20;  // center circle radius
const PITCH_CR   = 8;   // corner arc radius
const PITCH_PS   = 18;  // penalty spot distance from goal line
const PITCH_DARC = 14;  // penalty "D" arc radius

// Player-name row Y positions, anchored to pitch zones:
//   top zone   — between top penalty box bottom and the top of the center circle
//   mid zone   — on the halfway line
//   bottom zone — between the bottom of the center circle and the bottom penalty box top
const _TOP_PB_BOTTOM = PITCH_TOP  + PITCH_PB_H; // 144
const _BOT_PB_TOP    = PITCH_BOTTOM - PITCH_PB_H; // 234
const TOP_ZONE_Y  = (_TOP_PB_BOTTOM + (PITCH_MID_Y - PITCH_CCR)) / 2; // ~157
const BOT_ZONE_Y  = ((PITCH_MID_Y + PITCH_CCR) + _BOT_PB_TOP) / 2;  // ~221
// ---------------------------------------------------------------------------
 
// ---- Header row: team name (left) + football icon & "N PTS" (right) -----
const PTS_FONT_SIZE = 28;
const PTS_Y = 40; // shared baseline for the icon block, roughly matches the team-name row
const PTS_RIGHT_PAD = 23; // gap from the card's right edge to the end of the text
const PTS_ICON_Y = 18;
const PTS_ICON_SIZE = 22;
const PTS_ICON_GAP = -9; // gap between the icon and the start of the text
const PTS_CHAR_WIDTH = PTS_FONT_SIZE * 0.56; // rough average glyph width for Lilita One
// ---------------------------------------------------------------------------
 
// Groups players into rows of 2, with a single centered name left over on
// an odd count — 5 players -> 2/2/1, 6 players -> 2/2/2.
function groupIntoRows(players) {
  const rows = [];
  let i = 0;
  while (i < players.length) {
    if (players.length - i >= 2) {
      rows.push([players[i], players[i + 1]]);
      i += 2;
    } else {
      rows.push([players[i]]);
      i += 1;
    }
  }
  return rows;
}
 
// Maps row count to y-positions anchored to the full-pitch zones.
function getRowYPositions(nRows) {
  if (nRows <= 1) return [PITCH_MID_Y];
  if (nRows === 2) return [TOP_ZONE_Y, BOT_ZONE_Y];
  if (nRows === 3) return [TOP_ZONE_Y, PITCH_MID_Y, BOT_ZONE_Y];
  // Fallback for > 3 rows
  const top = _TOP_PB_BOTTOM + 10;
  const bot = _BOT_PB_TOP - 10;
  const step = (bot - top) / (nRows - 1);
  return Array.from({ length: nRows }, (_, i) => top + step * i);
}
 
// Full top-down football pitch — clean lines, colour tinted to the team.
// Mirrors the reference layout: outer boundary with corner arcs, halfway line,
// center circle + dot, top & bottom penalty areas with goal areas, penalty
// spots, penalty-arc "D" shapes, and a center-spot-to-penalty-box connector.
function PitchBackground({ color }) {
  const pc = getPitchColor(color); // possibly darkened for readability
  const L = PITCH_LEFT, R = PITCH_RIGHT, T = PITCH_TOP, B = PITCH_BOTTOM;
  const CX = PITCH_CX;
  const CR = PITCH_CR;   // corner arc
  const CCR = PITCH_CCR; // center circle
  const PBW2 = PITCH_PB_W / 2; // half penalty-box width
  const GBW2 = PITCH_GB_W / 2; // half goal-area width
  const MID  = PITCH_MID_Y;
  const PBH  = PITCH_PB_H;
  const GBH  = PITCH_GB_H;
  const PS   = PITCH_PS;   // penalty spot from goal line
  const DA   = PITCH_DARC; // D-arc radius

  return (
    <g
      stroke={pc}
      strokeWidth={PITCH_STROKE_WIDTH}
      fill="none"
      opacity={PITCH_OPACITY}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* ── Outer boundary with rounded corners ── */}
      <path d={`
        M ${L + CR} ${T}
        L ${R - CR} ${T}
        Q ${R} ${T}  ${R} ${T + CR}
        L ${R} ${B - CR}
        Q ${R} ${B}  ${R - CR} ${B}
        L ${L + CR} ${B}
        Q ${L} ${B}  ${L} ${B - CR}
        L ${L} ${T + CR}
        Q ${L} ${T}  ${L + CR} ${T}
        Z
      `} />

      {/* ── Halfway line ── */}
      <line x1={L} y1={MID} x2={R} y2={MID} />

      {/* ── Center circle + center dot ── */}
      <circle cx={CX} cy={MID} r={CCR} />
      <circle cx={CX} cy={MID} r={2.2} fill={pc} stroke="none" />


      {/* ── TOP penalty area ── */}
      <rect x={CX - PBW2} y={T}        width={PITCH_PB_W} height={PBH} />
      {/* top goal area */}
      <rect x={CX - GBW2} y={T}        width={PITCH_GB_W} height={GBH} />
      {/* top penalty spot */}
      <circle cx={CX} cy={T + PS}  r={1.8} fill={pc} stroke="none" />
      {/* top penalty D-arc (bulges DOWN away from the top goal line) */}
      <path d={`
        M ${CX - DA} ${T + PBH}
        A ${DA} ${DA} 0 0 0 ${CX + DA} ${T + PBH}
      `} />

      {/* ── BOTTOM penalty area ── */}
      <rect x={CX - PBW2} y={B - PBH} width={PITCH_PB_W} height={PBH} />
      {/* bottom goal area */}
      <rect x={CX - GBW2} y={B - GBH} width={PITCH_GB_W} height={GBH} />
      {/* bottom penalty spot */}
      <circle cx={CX} cy={B - PS}  r={1.8} fill={pc} stroke="none" />
      {/* bottom penalty D-arc (bulges UP away from the bottom goal line) */}
      <path d={`
        M ${CX - DA} ${B - PBH}
        A ${DA} ${DA} 0 0 1 ${CX + DA} ${B - PBH}
      `} />
    </g>
  );
}
 
// Calculates the largest font size that keeps `name` within `maxPx` wide.
// charFactor is the average glyph width as a fraction of the font size
// for Lilita One (empirically ~0.62 for upper-case heavy strings).
function fitFontSize(name, maxPx, baseFontSize, charFactor = 0.62, minSize = 11) {
  if (!name || name.length === 0) return baseFontSize;
  const needed = name.length * baseFontSize * charFactor;
  if (needed <= maxPx) return baseFontSize;
  return Math.max(minSize, Math.floor(maxPx / (name.length * charFactor)));
}

export default function TeamCard({ name, color, players, form }) {
  const fullForm = form || [];
  const shownForm = fullForm.slice(-5); // strip only shows the last 5
  const points = computePoints(fullForm); // but points count the whole season
  const list = players && players.length ? players : [""];
  const rows = groupIntoRows(list);
  const rowYs = getRowYPositions(rows.length);
 
  const baseFontSize = rows.length <= 1 ? 36 : rows.length === 2 ? 32 : 27;
  const pairOffset = 82;
  // Max pixel width available for a name in each layout:
  //   pair slot  → center ± pairOffset, so each half-span is ~(CENTER_X - pairOffset - PITCH_LEFT) = ~59px each side → 118px safe zone
  //   single/centered → full pitch width minus padding → ~240px
  const PAIR_MAX_W = 118;
  const SOLO_MAX_W = 240;
 
  // Header: right-anchor the PTS text to the card edge, then work out where
  // the icon needs to sit so it clears the text with a steady gap no matter
  // how many digits the point total has.
  const ptsText = `${points} PTS`;
  const PTS_RIGHT_X = VIEW_W - PTS_RIGHT_PAD;
  const ptsTextWidth = ptsText.length * PTS_CHAR_WIDTH;
  const isChazza = name?.toUpperCase?.() === "TEAM CHAZZA";
  const chazzaExtraShift = isChazza && points >= 10 ? -9 : 0;
  const ptsIconX =
    PTS_RIGHT_X - ptsTextWidth - PTS_ICON_GAP - PTS_ICON_SIZE - chazzaExtraShift;
 
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* coloured blob body */}
      <g strokeLinecap="round" transform="translate(12.2 10)">
        <path d={CARD_SHELL.blobFill} stroke="none" fill={color} />
        <path d={CARD_SHELL.blobStroke} stroke="#1e1e1e" strokeWidth="4" fill="none" />
      </g>
 
      {/* white bottom panel */}
      <g strokeLinecap="round">
        <g transform="translate(324.2 239)" fillRule="evenodd">
          <path d={CARD_SHELL.tabFill} stroke="none" fill="#ffffff" fillRule="evenodd" />
          <path d={CARD_SHELL.tabStroke} stroke="#1e1e1e" strokeWidth="4" fill="none" />
        </g>
      </g>
 
      {/* pitch background, tinted to the team colour, sits under the names */}
      <PitchBackground color={color} />
 
      {/* divider squiggle */}
      <g strokeLinecap="round">
        <g transform="translate(11.6 105)">
          <path d={CARD_SHELL.divider} stroke="#1e1e1e" strokeWidth="4" fill="none" />
        </g>
      </g>
 
      {/* team name, left aligned, same row as the icon + PTS on the right */}
      <text
        x="32"
        y="42"
        fontFamily="'Lilita One', sans-serif"
        fontSize="28"
        fill="#1e1e1e"
        textAnchor="start"
        style={{ textTransform: "uppercase" }}
      >
        {name}
      </text>
 
      {/* points badge, top right — text is right-anchored to the card edge
          so it can never run off the card, and the icon's x is calculated
          from the text's own (approximate) width so it always sits just to
          the left of "N PTS" with a consistent gap, however many digits N is */}
      <text
        x={PTS_RIGHT_X}
        y={PTS_Y}
        fontFamily="'Lilita One', sans-serif"
        fontSize={PTS_FONT_SIZE}
        fill="#1e1e1e"
        textAnchor="end"
      >
        {ptsText}
      </text>
      <FootballIcon x={ptsIconX} y={PTS_ICON_Y} size={PTS_ICON_SIZE} />
 
      {/* recent form badges — centered horizontally */}
      {shownForm.length > 0 && (() => {
        const badgeSpacing = 48;
        const badgeWidth = 39 * 1.1; // native width × scale
        const totalWidth = (shownForm.length - 1) * badgeSpacing + badgeWidth;
        const startX = (VIEW_W - totalWidth) / 2;
        return (
          <g transform={`translate(${startX} 60)`}>
            {shownForm.map((r, i) => (
              <ResultBadge key={i} result={r} x={i * badgeSpacing} y={0} size={1.1} />
            ))}
          </g>
        );
      })()}
 
      {/* player names — pinned to pitch landmarks: top zone, halfway line,
          and inside the penalty box (see getRowYPositions).
          Each name is individually sized down if it's too long to fit. */}
      {rows.map((row, ri) => {
        const y = rowYs[ri];
        if (row.length === 2) {
          const fs0 = fitFontSize(row[0], PAIR_MAX_W, baseFontSize);
          const fs1 = fitFontSize(row[1], PAIR_MAX_W, baseFontSize);
          return (
            <g key={ri}>
              <text
                x={CENTER_X - pairOffset}
                y={y}
                fontFamily="'Lilita One', sans-serif"
                fontSize={fs0}
                fill="#1e1e1e"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {`- ${row[0]}`}
              </text>
              <text
                x={CENTER_X + pairOffset}
                y={y}
                fontFamily="'Lilita One', sans-serif"
                fontSize={fs1}
                fill="#1e1e1e"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {`- ${row[1]}`}
              </text>
            </g>
          );
        }
        const fs = fitFontSize(row[0], SOLO_MAX_W, baseFontSize);
        return (
          <text
            key={ri}
            x={CENTER_X}
            y={y}
            fontFamily="'Lilita One', sans-serif"
            fontSize={fs}
            fill="#1e1e1e"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {`- ${row[0]}`}
          </text>
        );
      })}
    </svg>
  );









