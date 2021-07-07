export const ARRAY_TYPE = Float32Array;
export const addVec2D = (out, a, b) => {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out
}
export const subVec2D = (out, a, b) => {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out
}
export const scaleVec2D = (out, a, s) => {
    out[0] = a[0] * s;
    out[1] = a[1] * s;
    return out
}
export const copyVec2D = (out, a) => {
    out[0] = a[0]
    out[1] = a[1]
}
export const transformMat2D = (out, a, m) => {
    const x = a[0]
    const y = a[1]
    out[0] = m[0] * x + m[1] * y + m[2]
    out[1] = m[3] * x + m[4] * y + m[5]
    return out
}
export const createMat2D = () => {
    const l = 9
    const mat = new ARRAY_TYPE(l);
    for (let i = 0; i < l; i++) {
        mat[i] = 0
    }
    return mat
}
export const initTransformMat2D = (out, tx, ty, r, sx, sy) => {
    out[0] = Math.cos(r) * sx
    out[1] = -Math.sin(r) * sx
    out[2] = tx
    out[3] = Math.sin(r) * sy
    out[4] = Math.cos(r) * sy
    out[5] = ty
    out[6] = 0
    out[7] = 0
    out[8] = 1
    return out
}