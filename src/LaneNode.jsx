export default function LaneNode({ data }) {
  const { label, sub, color, width, height } = data;
  return (
    <div
      className="lane"
      style={{
        width,
        height,
        borderColor: color,
        background: color + "0f",
      }}
    >
      <div className="lane-head">
        <span className="lane-label" style={{ color }}>
          {label}
        </span>
        <span className="lane-sub">{sub}</span>
      </div>
    </div>
  );
}
