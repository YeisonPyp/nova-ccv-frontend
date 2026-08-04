export class DynamicColor {
  readonly background: string;
  readonly foreground: string;

  constructor(hex: string) {
    this.background = hex || '#FFFFFF';
    this.foreground = DynamicColor.contrastColor(this.background);
  }

  private static contrastColor(hex: string): string {
    const normalized = hex.replace('#', '');
    if (normalized.length !== 6) return '#000000';

    const r = parseInt(normalized.substring(0, 2), 16);
    const g = parseInt(normalized.substring(2, 4), 16);
    const b = parseInt(normalized.substring(4, 6), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#000000' : '#FFFFFF';
  }
}
