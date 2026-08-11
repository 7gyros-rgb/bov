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

function PitchBackground({ color }) {
  const midY = (PITCH_TOP + PITCH_BOTTOM) / 2;
  const boxW = 96;
  const boxTop = PITCH_BOTTOM - 34;
  const goalW = 32;

  return (
    <g
      stroke={color}
      strokeWidth={PITCH_STROKE_WIDTH}
      fill="none"
      opacity={PITCH_OPACITY}
      strokeLinecap="round"
    >
      {/* outer pitch boundary */}
      <rect
        x={PITCH_LEFT}
        y={PITCH_TOP}
        width={PITCH_RIGHT - PITCH_LEFT}
        height={PITCH_BOTTOM - PITCH_TOP}
        rx="10"
      />
      {/* halfway line */}
      <line x1={PITCH_LEFT} y1={midY} x2={PITCH_RIGHT} y2={midY} />
      {/* centre circle + dot */}
      <circle cx={CENTER_X} cy={midY} r="24" />
      <circle cx={CENTER_X} cy={midY} r="1.6" fill={color} stroke="none" />
      {/* penalty box (open at the pitch's own bottom edge) */}
      <path
        d={`M ${CENTER_X - boxW / 2} ${PITCH_BOTTOM} L ${CENTER_X - boxW / 2} ${boxTop} L ${
          CENTER_X + boxW / 2
        } ${boxTop} L ${CENTER_X + boxW / 2} ${PITCH_BOTTOM}`}
      />
      {/* small goal notch */}
      <path
        d={`M ${CENTER_X - goalW / 2} ${PITCH_BOTTOM} L ${CENTER_X - goalW / 2} ${
          PITCH_BOTTOM + 8
        } L ${CENTER_X + goalW / 2} ${PITCH_BOTTOM + 8} L ${CENTER_X + goalW / 2} ${PITCH_BOTTOM}`}
      />
      {/* corner arcs */}
      <path d={`M ${PITCH_LEFT} ${PITCH_TOP + 10} A 10 10 0 0 1 ${PITCH_LEFT + 10} ${PITCH_TOP}`} />
      <path d={`M ${PITCH_RIGHT - 10} ${PITCH_TOP} A 10 10 0 0 1 ${PITCH_RIGHT} ${PITCH_TOP + 10}`} />
      <path
        d={`M ${PITCH_RIGHT} ${PITCH_BOTTOM - 10} A 10 10 0 0 1 ${PITCH_RIGHT - 10} ${PITCH_BOTTOM}`}
      />
      <path d={`M ${PITCH_LEFT + 10} ${PITCH_BOTTOM} A 10 10 0 0 1 ${PITCH_LEFT} ${PITCH_BOTTOM - 10}`} />
    </g>
  );
}

export default function TeamCard({ name, color, players, form }) {
  const fullForm = form || [];
  const shownForm = fullForm.slice(-5); // strip only shows the last 5
  const points = computePoints(fullForm); // but points count the whole season
  const list = players && players.length ? players : [""];
  const rows = groupIntoRows(list);

  const panelTop = 128;
  const panelBottom = 262;
  const rowGap = (panelBottom - panelTop) / rows.length;
  const fontSize = rows.length <= 1 ? 36 : rows.length === 2 ? 32 : 27;
  const pairOffset = 82;

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

      {/* team name, left aligned */}
      <text
        x="20"
        y="38"
        fontFamily="'Lilita One', sans-serif"
        fontSize="27"
        fill="#1e1e1e"
        textAnchor="start"
      >
        {name}
      </text>

      {/* points badge, top right */}
      <g transform={`translate(${VIEW_W - 24 - 20} 20)`}>
        <FootballIcon x={0} y={0} size={20} />
        <text
          x="26"
          y="17"
          fontFamily="'Lilita One', sans-serif"
          fontSize="22"
          fill="#1e1e1e"
          textAnchor="start"
        >
          {points} PTS
        </text>
      </g>

      {/* recent form badges — left aligned, empty until results are added */}
      {shownForm.length > 0 && (
        <g transform="translate(20 60)">
          {shownForm.map((r, i) => (
            <ResultBadge key={i} result={r} x={i * 48} y={0} size={1.1} />
          ))}
        </g>
      )}

      {/* player names — centred formation, 2 per row with a lone centred
          name on the last row if the count is odd */}
      {rows.map((row, ri) => {
        const y = panelTop + ri * rowGap + fontSize * 0.7;
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
