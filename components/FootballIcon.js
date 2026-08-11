// A drawn football icon (outline + pentagon), not an emoji, so it matches
// the sketchy hand-drawn card style and renders consistently everywhere.
export default function FootballIcon({ x = 0, y = 0, size = 18 }) {
  const s = size / 24; // scale factor against a 24x24 base drawing
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="12" cy="12" r="10" fill="#ffffff" stroke="#1e1e1e" strokeWidth="2" />
      <path
        d="M12 7.2 L15.4 9.6 L14.1 13.6 L9.9 13.6 L8.6 9.6 Z"
        fill="#1e1e1e"
      />
      <path
        d="M12 7.2 L12 3.5 M15.4 9.6 L19 8.3 M14.1 13.6 L16.3 17 M9.9 13.6 L7.7 17 M8.6 9.6 L5 8.3"
        stroke="#1e1e1e"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}
