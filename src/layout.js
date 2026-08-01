import { subFor } from "./map-data.js";

const LANE_TOP_PAD = 36;
const LANE_GAP = 54;
const LANE_PAD = 28;
const CHIP_X0 = 340;

const COLS = 4;
const COL_WIDTH = 250;
const COL_GAP = 24;
const ROW_GAP = 96;

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
    
    let maxEnd = CHIP_X0;
    
    items.forEach((item, index) => {
      const col = index % COLS;
      const row = Math.floor(index / COLS);
      const x = CHIP_X0 + col * (COL_WIDTH + COL_GAP);
      const nodeY = y + LANE_TOP_PAD + row * ROW_GAP;
      
      laneItems.push({
        id: item.id,
        type: "chip",
        position: { x, y: nodeY },
        data: {
          layer: item.layer,
          title: item.title,
          sub: subFor(item, lang),
          tag: item.tag,
          width: COL_WIDTH,
        },
      });
      maxEnd = Math.max(maxEnd, x + COL_WIDTH);
    });
    
    const rows = Math.max(1, Math.ceil(items.length / COLS));
    const laneHeight = LANE_TOP_PAD + rows * ROW_GAP + 20;
    
    lanes.push({
      id: layerId,
      top: y,
      height: laneHeight,
      width: Math.max(maxEnd + LANE_PAD, 300),
      color: layer ? layer.color : "#a78bfa",
      label: layer ? layer.label : layerId,
      sub: layer ? subFor(layer, lang) : "",
    });
    nodes.push(...laneItems);
    y += laneHeight + LANE_GAP;
  }
  return { lanes, nodes };
}
