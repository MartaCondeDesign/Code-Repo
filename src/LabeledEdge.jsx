import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "@xyflow/react";

export default function LabeledEdge({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
  style,
  data,
}) {
  const [path] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const color = data?.color || "#a1a1aa";
  const labelX = targetX + (data?.labelOffsetX || 0);
  const labelY = targetY + (data?.labelOffsetY !== undefined ? data.labelOffsetY : -14);
  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />
      {!data?.hideLabel && (
        <EdgeLabelRenderer>
          <div
            className={"edge-label" + (data?.dimmed ? " dimmed" : "")}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              color,
              borderColor: color,
            }}
          >
            {data.verb}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
