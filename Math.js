const range = (n) => [...Array(n).keys()];
const dotVector3 = (v1, v2) => v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];

const getCol = (m, index) => m.map((r) => r[index]);

const getRow = (m, index) => m[index];

// assumes matrix of same dimension
const multiplyMatrix3x3 = (m1, m2) =>
  range(3).map((row) =>
    range(3).map((col) => dotVector3(getRow(m1, row), getCol(m2, col))),
  );

const multiplyVectorMatrix3x3 = (m, v) => {
  range(3).map((row) => m[row][0] * v[0] + m[row][1] * v[1] + m[row][2] * v[2]);
}

const bulkMultiplyMatrix3x3 = (matrices) =>
  matrices.reduce((acc, m) => multiplyMatrix3x3(acc, m));

const toHomogeneous = (v) => [v[0], v[1], 1];
const toCartesian = (v) => [v[0] / v[2], v[1] / v[2]];
