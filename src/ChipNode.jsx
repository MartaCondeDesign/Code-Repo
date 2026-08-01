import { Handle, Position } from "@xyflow/react";

export default function ChipNode({ data }) {
  const color = data.color || "#a78bfa";
  return (
    <div
      className={"chip" + (data.selected ? " selected" : "") + (data.dimmed ? " dimmed" : "")}
      style={{
        width: data.width,
        borderColor: color,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: color }} />
      <Handle type="source" position={Position.Bottom} style={{ background: color }} />
      <div className="chip-top">
        <div className="chip-title">{data.title}</div>
        <span className="chip-tag" style={{ background: color + "1f", color }}>
          {data.tag}
        </span>
      </div>
      <div className="chip-sub">{data.sub}</div>
    </div>
  );
}
