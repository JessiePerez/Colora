
export interface ColorData {
  hex: string;
  name: string;
  rgb: string;
}

export interface PaletteItem {
  color: string;
  percentage: number;
}

export interface Palette {
  title: string;
  description: string;
  items: PaletteItem[];
}

export interface AnalysisResponse {
  baseColor: ColorData;
  palettes: Palette[];
  boldColors: string[]; // 4 colors that are risky but harmonic
}
