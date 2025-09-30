export function getRelationColor(value: number): string {
  const normalized = (value + 10) / 20;
  if (normalized <= 0.5) {
    const t = normalized * 2;
    const r = Math.round(255);
    const g = Math.round(255 * t);
    const b = Math.round(68 * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const t = (normalized - 0.5) * 2;
    const r = Math.round(255 * (1 - t));
    const g = Math.round(255);
    const b = Math.round(68 + 187 * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
}
