/* ------------------------------------------------------------------
   Razón de contraste según WCAG 2.x (luminancia relativa de sRGB).
   https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
   Es un piso de legibilidad, no un juicio estético.
------------------------------------------------------------------ */

export type RGB = [number, number, number];

export function hexARgb(hex: string): RGB {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbAHex([r, g, b]: RGB): string {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
}

export function luminancia([r, g, b]: RGB): number {
  const canal = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

export function razonContraste(a: string, b: string): number {
  const la = luminancia(hexARgb(a));
  const lb = luminancia(hexARgb(b));
  const [claro, oscuro] = la > lb ? [la, lb] : [lb, la];
  return (claro + 0.05) / (oscuro + 0.05);
}

/** Umbrales de WCAG 2 para texto. «Grande» = 18pt, o 14pt en negrita. */
export function cumple(razon: number) {
  return {
    aaNormal: razon >= 4.5,
    aaGrande: razon >= 3,
    aaaNormal: razon >= 7,
    aaaGrande: razon >= 4.5,
  };
}

export function hslAHex(h: number, s: number, l: number): string {
  const sat = s / 100;
  const lum = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(lum, 1 - lum);
  const f = (n: number) => lum - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbAHex([f(0) * 255, f(8) * 255, f(4) * 255]);
}

export function hexAHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexARgb(hex).map((c) => c / 255) as RGB;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

/** Gris con la misma luminancia relativa: cómo se vería sin tono. */
export function aGris(hex: string): string {
  const y = luminancia(hexARgb(hex));
  const s = y <= 0.0031308 ? 12.92 * y : 1.055 * y ** (1 / 2.4) - 0.055;
  const v = Math.round(s * 255);
  return rgbAHex([v, v, v]);
}
