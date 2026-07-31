export default function ThumbnailArt({ seed = "default", className = "" }) {
  const hues = [
    [47, 169, 77],
    [232, 169, 77],
    [139, 127, 209],
    [232, 115, 92],
  ];
  const hash = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const [r, g, b] = hues[hash % hues.length];

  return (
    <svg
      viewBox="0 0 600 400"
      className={`absolute inset-0 h-full w-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="600" height="400" fill={`rgb(${r * 0.15},${g * 0.15},${b * 0.15})`} />
      <circle cx="300" cy="200" r="120" fill={`rgb(${r},${g},${b})`} opacity="0.3" />
      <circle cx="180" cy="120" r="60" fill={`rgb(${r},${g},${b})`} opacity="0.2" />
      <circle cx="420" cy="280" r="80" fill={`rgb(${r},${g},${b})`} opacity="0.15" />
      <path
        d="M0 300 Q150 250 300 300 T600 300 V400 H0Z"
        fill={`rgb(${r},${g},${b})`}
        opacity="0.25"
      />
    </svg>
  );
}
