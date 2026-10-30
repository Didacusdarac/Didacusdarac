export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;
export const DURATION = 8 * FPS;

export const HORIZON_Y = 720;
export const GROUND_Y = 985; // donde pisa el caminante
export const MAN_X = 800;

// Frames de un ciclo completo de caminata (dos pasos)
export const WALK_CYCLE = 40;
// px/frame a la altura de los pies; coincide con el avance de la zancada
export const GROUND_SPEED = 8.3;

// Velocidad de scroll en perspectiva: más cerca del borde inferior = más rápido
export const speedAtY = (y: number) =>
  (GROUND_SPEED * (y - HORIZON_Y)) / (GROUND_Y - HORIZON_Y);

export const rand = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};
