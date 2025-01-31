const range = (n) => [...Array(n).keys()];
const dotVector3 = (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];

const getCol = (m, index) => m.map((r) => r[index]);

const getRow = (m, index) => m[index];

// assumes matrix of same dimension
export const multiplyMatrix3x3 = (m1, m2) =>
  range(3).map((row) =>
    range(3).map((col) => dotVector3(getRow(m1, row), getCol(m2, col))),
  );

export const toHomogeneous = (v) => [v[0], v[1], 1];
export const toCartesian = (v) => [v[0] / v[2], v[1] / v[2]];
