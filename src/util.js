import { mat3 } from 'gl-matrix';

export function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export function openCVMatToGLMat(cvMat) {
  if (cvMat.data64F.length !== 9) {
    throw new Error('cvMat.data32F.length must be 9');
  }

  // gl-matrix uses column-major order
  return mat3.fromValues(
    cvMat.data64F[0], cvMat.data64F[3], cvMat.data64F[6],
    cvMat.data64F[1], cvMat.data64F[4], cvMat.data64F[7],
    cvMat.data64F[2], cvMat.data64F[5], cvMat.data64F[8],
  );
}
