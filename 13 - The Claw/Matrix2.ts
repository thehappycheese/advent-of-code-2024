import { Vector2 } from "./Vector2.ts";

export type Matrix2 = [[number, number], [number, number]];
export const Matrix2 = {
  vstack(a: Vector2, b: Vector2): Matrix2 {
    return [
      [a.x, a.y],
      [b.x, b.y]
    ];
  },
  hstack(a: Vector2, b: Vector2): Matrix2 {
    return [
      [a.x, b.x],
      [a.y, b.y]
    ];
  },
  transpose(m: Matrix2): Matrix2 {
    return [
      [m[0][0], m[1][0]],
      [m[0][1], m[1][1]],
    ];
  },
  determinant(m: Matrix2): number {
    return m[0][0] * m[1][1] - m[1][0] * m[0][1];
  },
  scale(m: Matrix2, s: number): Matrix2 {
    return [
      [m[0][0] * s, m[0][1] * s],
      [m[1][0] * s, m[1][1] * s],
    ];
  },
  div(m: Matrix2, s: number): Matrix2 {
    return [
      [m[0][0] / s, m[0][1] / s],
      [m[1][0] / s, m[1][1] / s],
    ];
  },
  adjunct(m: Matrix2): Matrix2 {
    return [
      [m[1][1], -m[0][1]],
      [-m[1][0], m[0][0]],
    ];
  },
  invert(m: Matrix2): Matrix2 {
    return Matrix2.scale(
      [
        [m[1][1], -m[0][1]],
        [-m[1][0], m[0][0]],
      ],
      1 / Matrix2.determinant(m)
    );
  },
  to_string(m: Matrix2) {
    return (
      `┌${m[0][0]} ${m[0][1]}┐\n`
      + `└${m[1][0]} ${m[1][1]}┘`
    );
  },
  apply(m: Matrix2, v: Vector2): Vector2 {
    return {
      x: m[0][0] * v.x + m[0][1] * v.y,
      y: m[1][0] * v.x + m[1][1] * v.y,
    };
  },
  apply_inverse(m: Matrix2, v: Vector2): Vector2 {
    return Vector2.descale(Matrix2.apply(Matrix2.adjunct(m), v), Matrix2.determinant(m));
  },
  ident(): Matrix2 {
    return [
      [1, 0],
      [0, 1]
    ];
  },
  log(m: Matrix2) {
    console.log(Matrix2.to_string(m));
  }
};
