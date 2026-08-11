// Your ball.png, fixed so the white patches are actually opaque white
// (they were transparent in the original export) — sits in /public/ball.png.
export default function FootballIcon({ x = 0, y = 0, size = 22 }) {
  return (
    <image
      href="/ball.png"
      x={x}
      y={y}
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
    />
  );
}
