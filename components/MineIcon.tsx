// Pure SVG icon shapes used consistently across WorldMap, drawMap, and Legend.
// Keeps icon logic in one place instead of copy-pasting across files.

export type ElementName = "Lithium" | "Nickel" | "Cobalt" | "Copper" | "Silver" | "Aluminium";

interface MineIconProps {
  elementName: string;
  color: string;
  size?: number; // s value, default 7
  x?: number;
  y?: number;
}

export function MineIconGroup({ elementName, color, size = 7, x = 0, y = 0 }: MineIconProps) {
  const s = size;
  const sw = 1.5;
  const t = s * 0.55;
  const common = { fill: "none", stroke: color, strokeWidth: sw };

  let shapes: React.ReactNode;
  switch (elementName) {
    case "Aluminium":
      shapes = (
        <>
          <rect x={-s} y={-s} width={s * 2} height={s * 2} {...common} />
          <line x1={-s} y1={-s} x2={s} y2={s} {...common} />
          <line x1={s} y1={-s} x2={-s} y2={s} {...common} />
        </>
      );
      break;
    case "Lithium":
      shapes = <polygon points={`0,${-s} ${s},0 0,${s} ${-s},0`} {...common} />;
      break;
    case "Nickel":
      shapes = (
        <>
          <circle r={s} {...common} />
          <line x1={-s} y1={0} x2={s} y2={0} {...common} />
          <line x1={0} y1={-s} x2={0} y2={s} {...common} />
        </>
      );
      break;
    case "Silver":
      shapes = <circle r={s} {...common} />;
      break;
    case "Copper":
      shapes = (
        <>
          <circle r={s} {...common} />
          <polygon points={`0,${-t} ${t},${t} ${-t},${t}`} fill="none" stroke={color} strokeWidth={1.2} />
        </>
      );
      break;
    case "Cobalt":
      shapes = (
        <>
          <circle r={s} {...common} />
          <circle r={s * 0.45} fill="none" stroke={color} strokeWidth={1.2} />
        </>
      );
      break;
    default:
      shapes = <circle r={s} {...common} />;
  }

  return <g transform={`translate(${x},${y})`}>{shapes}</g>;
}