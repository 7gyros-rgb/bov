

import { CARD_SHELL } from "../lib/shapes";
import ResultBadge from "./ResultBadge";
import FootballIcon from "./FootballIcon";
import { computePoints } from "../lib/points";
 
const VIEW_W = 334;
const VIEW_H = 281;
const CENTER_X = VIEW_W / 2;
 
// ---- Pitch background — tweak these if you want it bigger/thicker/etc ----
const PITCH_LEFT = 26;
const PITCH_RIGHT = 308;
const PITCH_TOP = 114;
const PITCH_BOTTOM = 264;
const PITCH_STROKE_WIDTH = 2.2; // "a little bit thicker" lives here
const PITCH_OPACITY = 0.85; // how strong the team-colour lines look
 
const PITCH_MID_Y = (PITCH_TOP + PITCH_BOTTOM) / 2; // halfway line, y = 189
const BOX_WIDTH = 96;
const BOX_TOP = PITCH_BOTTOM - 34; // y = 230
const BOX_MID_Y = (BOX_TOP + PITCH_BOTTOM) / 2; // centre of the penalty box, y = 247
 
// Player-name row baselines, pinned to pitch landmarks instead of an even
// generic split:
//   3 rows -> near the halfway line / mid-pitch / inside the penalty box
//   2 rows -> near the halfway line / inside the penalty box
//   1 row  -> mid-pitch
const TOP_ROW_Y = PITCH_TOP + (PITCH_MID_Y - PITCH_TOP) * 0.37; // ~142
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
 
// Maps a row count to the y-baselines those rows should sit on, anchored to
// the pitch's own features rather than dividing the panel evenly.
function getRowYPositions(nRows) {
  if (nRows <= 1) return [PITCH_MID_Y];
  if (nRows === 2) return [TOP_ROW_Y, BOX_MID_Y];
  if (nRows === 3) return [TOP_ROW_Y, PITCH_MID_Y, BOX_MID_Y];
  // Defensive fallback for >3 rows (shouldn't happen at up to 6 players)
  const top = PITCH_TOP + 28;
  const bottom = BOX_MID_Y;
  const step = (bottom - top) / (nRows - 1);
  return Array.from({ length: nRows }, (_, i) => top + step * i);
}
 
function PitchBackground({ color }) {
  const cornerR = 10;
  const circleR = 34; // half-pitch centre circle, cut by the halfway line
  const dArcR = 28; // penalty arc "D" bulging above the box's open edge
 
  return (
    <g
      stroke={color}
      strokeWidth={PITCH_STROKE_WIDTH}
      fill="none"
      opacity={PITCH_OPACITY}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* pitch boundary — square top corners (this edge is the halfway-line
          cut, so it has no corner arc), rounded bottom corners (the real
          goal-line corners) */}
      <path
        d={`
          M ${PITCH_LEFT} ${PITCH_TOP}
          L ${PITCH_RIGHT} ${PITCH_TOP}
          L ${PITCH_RIGHT} ${PITCH_BOTTOM - cornerR}
          A ${cornerR} ${cornerR} 0 0 1 ${PITCH_RIGHT - cornerR} ${PITCH_BOTTOM}
          L ${PITCH_LEFT + cornerR} ${PITCH_BOTTOM}
          A ${cornerR} ${cornerR} 0 0 1 ${PITCH_LEFT} ${PITCH_BOTTOM - cornerR}
          Z
        `}
      />
      {/* halfway line is just the pitch's own top edge above; the centre
          circle is cut in half by it, bulging down into the pitch */}
      <path
        d={`M ${CENTER_X - circleR} ${PITCH_TOP} A ${circleR} ${circleR} 0 0 0 ${
          CENTER_X + circleR
        } ${PITCH_TOP}`}
      />
      <circle cx={CENTER_X} cy={PITCH_TOP} r="1.6" fill={color} stroke="none" />
 
      {/* goal box, flush with the bottom (goal-line) edge */}
      <path
        d={`M ${CENTER_X - BOX_WIDTH / 2} ${PITCH_BOTTOM} L ${CENTER_X - BOX_WIDTH / 2} ${BOX_TOP} L ${
          CENTER_X + BOX_WIDTH / 2
        } ${BOX_TOP} L ${CENTER_X + BOX_WIDTH / 2} ${PITCH_BOTTOM}`}
      />
      {/* penalty arc — the "D" bulging up off the box's open edge */}
      <path
        d={`M ${CENTER_X - dArcR} ${BOX_TOP} A ${dArcR} ${dArcR} 0 0 1 ${
          CENTER_X + dArcR
        } ${BOX_TOP}`}
      />
    </g>
  );
}
 
export default function TeamCard({ name, color, players, form }) {
  const fullForm = form || [];
  const shownForm = fullForm.slice(-5); // strip only shows the last 5
  const points = computePoints(fullForm); // but points count the whole season
  const list = players && players.length ? players : [""];
  const rows = groupIntoRows(list);
  const rowYs = getRowYPositions(rows.length);
 
  const fontSize = rows.length <= 1 ? 36 : rows.length === 2 ? 32 : 27;
  const pairOffset = 82;
 
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
 
      {/* recent form badges — left aligned, empty until results are added */}
      {shownForm.length > 0 && (
        <g transform="translate(20 60)">
          {shownForm.map((r, i) => (
            <ResultBadge key={i} result={r} x={i * 48} y={0} size={1.1} />
          ))}
        </g>
      )}
 
      {/* player names — pinned to pitch landmarks: top zone, halfway line,
          and inside the penalty box (see getRowYPositions) */}
      {rows.map((row, ri) => {
        const y = rowYs[ri];
        if (row.length === 2) {
          return (
            <g key={ri}>
              <text
                x={CENTER_X - pairOffset}
                y={y}
                fontFamily="'Lilita One', sans-serif"
                fontSize={fontSize}
                fill="#1e1e1e"
                textAnchor="middle"
              >
                {row[0]}
              </text>
              <text
                x={CENTER_X + pairOffset}
                y={y}
                fontFamily="'Lilita One', sans-serif"
                fontSize={fontSize}
                fill="#1e1e1e"
                textAnchor="middle"
              >
                {row[1]}
              </text>
            </g>
          );
        }
        return (
          <text
            key={ri}
            x={CENTER_X}
            y={y}
            fontFamily="'Lilita One', sans-serif"
            fontSize={fontSize}
            fill="#1e1e1e"
            textAnchor="middle"
          >
            {row[0]}
          </text>
        );
      })}
    </svg>
  );
}
 











