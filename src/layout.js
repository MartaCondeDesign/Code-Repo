import { subFor } from "./map-data.js";

const LANE_TOP_PAD = 24;
const LANE_GAP = 48;
const LANE_PAD = 28;
const ROW_H = 72;
const CHIP_X0 = 340;
const MAX_ROW_W = 1450;
const WRAP_COUNT = 6;

function chipWidth(sub, title) {
  const subW = sub.length > 34 ? 250 : 218;
  const titleW = title.length * 8 + 72;
  return Math.min(Math.max(subW, titleW), 300);
}

export function buildLayout(data, lang) {
  const LAYER_ORDER = data.layers.map((l) => l.id);
  const perLayer = {};
  for (const item of data.nodes) {
    (perLayer[item.layer] = perLayer[item.layer] || []).push(item);
  }

  const lanes = [];
  const nodes = [];
  let y = 40;
  for (const layerId of LAYER_ORDER) {
    const items = perLayer[layerId] || [];
    const layer = data.layers.find((l) => l.id === layerId);
    const laneItems = [];
    let x = CHIP_X0;
    let row = 0;
    let maxEnd = CHIP_X0;
    const wrap = items.length > WRAP_COUNT;
    for (const item of items) {
      const w = chipWidth(subFor(item, lang), item.title);
      if (wrap && x > CHIP_X0 && x + w > MAX_ROW_W) {
        row += 1;
        x = CHIP_X0;
      }
      laneItems.push({
        id: item.id,
        type: "chip",
        position: { x, y: y + LANE_TOP_PAD + row * ROW_H },
        data: {
          layer: item.layer,
          title: item.title,
          sub: subFor(item, lang),
          tag: item.tag,
          width: w,
        },
      });
      x += w + 16;
      maxEnd = Math.max(maxEnd, x - 16);
    }
    const rows = row + 1;
    const laneHeight = LANE_TOP_PAD + rows * ROW_H + 24;
    lanes.push({
      id: layerId,
      top: y,
      height: laneHeight,
      width: Math.max(maxEnd + LANE_PAD, 300),
      color: layer.color,
      label: layer.label,
      sub: subFor(layer, lang),
    });
    nodes.push(...laneItems);
    y += laneHeight + LANE_GAP;
  }
  return { lanes, nodes };
}
