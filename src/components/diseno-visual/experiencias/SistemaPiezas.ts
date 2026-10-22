/* Contenido de las doce fichas del instrumento de sistemas. Programación
   inventada de un centro cultural: realista, sin referirse a nadie. */

export interface Pieza {
  categoria: string;
  titulo: string;
  fecha: string;
  /** alto de la imagen con variación máxima, en px */
  alto: number;
  forma: 'circulo' | 'cuadro' | 'triangulo' | 'barras' | 'medio';
}

export const piezas: Pieza[] = [
  { categoria: 'Música', titulo: 'Coro de cámara', fecha: 'Vie 7 · 7:00 p. m.', alto: 56, forma: 'circulo' },
  { categoria: 'Cine', titulo: 'Cine mudo con piano en vivo', fecha: 'Sáb 8 · 4:00 p. m.', alto: 84, forma: 'cuadro' },
  { categoria: 'Taller', titulo: 'Encuadernación para principiantes', fecha: 'Dom 9 · 10:00 a. m.', alto: 40, forma: 'barras' },
  { categoria: 'Charla', titulo: 'Cómo se diseña una señal', fecha: 'Mar 11 · 6:30 p. m.', alto: 64, forma: 'triangulo' },
  { categoria: 'Teatro', titulo: 'Lectura dramatizada', fecha: 'Mié 12 · 7:00 p. m.', alto: 92, forma: 'medio' },
  { categoria: 'Exposición', titulo: 'Carteles de barrio, 1970–1990', fecha: 'Hasta el dom 30', alto: 48, forma: 'cuadro' },
  { categoria: 'Música', titulo: 'Jazz en la terraza', fecha: 'Jue 13 · 8:00 p. m.', alto: 72, forma: 'circulo' },
  { categoria: 'Infancia', titulo: 'Hora del cuento', fecha: 'Sáb 15 · 11:00 a. m.', alto: 36, forma: 'medio' },
  { categoria: 'Danza', titulo: 'Ensayo abierto', fecha: 'Dom 16 · 5:00 p. m.', alto: 88, forma: 'triangulo' },
  { categoria: 'Taller', titulo: 'Tipografía con sellos de caucho', fecha: 'Mar 18 · 3:00 p. m.', alto: 52, forma: 'barras' },
  { categoria: 'Cine', titulo: 'Documental y conversación', fecha: 'Jue 20 · 7:00 p. m.', alto: 76, forma: 'cuadro' },
  { categoria: 'Feria', titulo: 'Mercado de editoriales independientes', fecha: 'Sáb 22 · todo el día', alto: 44, forma: 'circulo' },
];

/* Los cuatro acentos pasan AA con texto blanco encima (la excepción de
   color invierte) y sobre papel. */
export const acentos: Record<string, string> = {
  rojo: '#b3261e',
  azul: '#1f4e8c',
  verde: '#2e6b3a',
  tinta: '#222222',
};

export const nombreTipo: Record<string, string> = {
  color: 'el color',
  escala: 'la escala',
  alineacion: 'la alineación',
};
