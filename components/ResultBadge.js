import { BADGE_SHAPES } from "../lib/shapes";

// Renders one hand-drawn W / D / L badge at (x, y). Native badge art is
// 39 x 31, so we just translate it into place — no scaling, no distortion.
export default function ResultBadge({ result, x, y, size = 1 }) {
  const shape = BADGE_SHAPES[result];
  if (!shape) return null;

  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <path d={shape.fillPath} stroke="none" fill={shape.color} />
      <path d={shape.strokePath} stroke="#1e1e1e" strokeWidth="4" fill="none" />
      <text
        x="19.5"
        y="15.5"
        fontFamily="'Lilita One', sans-serif"
        fontSize="22"
        fill="#1e1e1e"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {result}
      </text>
    </g>
  );
}
