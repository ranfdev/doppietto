import { GAME_WIDTH, GAME_HEIGHT, createRect } from "./levelDsl.js"
import { createMat2D, initTransformMat2D, scaleVec2D, transformMat2D } from "./math.js"

const GOLDEN_RATIO = 1.61803
const drawRect = (ctx, x, y, w, h) => {
    ctx.fillRect(
        window.innerWidth / 2 + x - w / 2,
        window.innerHeight / 2 - y + h / 2,
        w,
        -h
    )
}
const rectsHidingCenter = (ctx, time, { innerWidth, innerHeight }) => {
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, innerWidth, innerHeight)

    const period = 1000
    const diagonal = Math.sqrt(innerWidth * innerWidth + innerHeight * innerHeight)
    const n = Math.floor(diagonal / 100)
    const speed = diagonal / 2 / n / period
    const rotSpeed = Math.PI / (period * 20)
    ctx.save()
    ctx.translate(innerWidth / 2, innerHeight / 2)
    ctx.rotate(rotSpeed * time)
    ctx.translate(-innerWidth / 2, -innerHeight / 2)
    ctx.fillStyle = "rgba(20,15,20,1)"

    for (let i = 0; i < n; i++) {
        const x = -diagonal / 2 + speed * ((time % period) + i * period)
        const obw = x / n
        drawRect(ctx, x + obw / 2, 0, obw, diagonal)
        drawRect(ctx, -x - obw / 2, 0, obw, diagonal)
    }
    ctx.restore()
}

const spiral = (ctx, time, { innerWidth, innerHeight }) => {
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, innerWidth, innerHeight)

    const diagonal = Math.sqrt(innerWidth * innerWidth + innerHeight * innerHeight)
    const n = 50
    ctx.fillStyle = "#201520"
    const spiralPeriod = 1000*10

    const matrix = createMat2D()
    const originalRect = createRect(diagonal, diagonal)
    const tmpRect = createRect(diagonal, diagonal)

    for (let i = 0; i < n; i++) {
        const bigRotation = Math.PI*2/spiralPeriod * (time % spiralPeriod) + GOLDEN_RATIO/3 * i
        const bigRotationAmplitude = +diagonal / 2 - diagonal/2/n * i
        const obw = bigRotationAmplitude / 10

        initTransformMat2D(matrix, 
            Math.cos(bigRotation) * bigRotationAmplitude,
            Math.sin(bigRotation) * bigRotationAmplitude,  
            Math.PI * (time % 1000) / 1000 + GOLDEN_RATIO/3 * i, 
            obw/diagonal,
            obw/diagonal
        )
        for (let i = 0; i < tmpRect.length; i++) {
            transformMat2D(tmpRect[i], originalRect[i], matrix)
        }
        ctx.beginPath()
        for (let i = 0; i < tmpRect.length; i++) {
            ctx.lineTo(innerWidth / 2 + tmpRect[i][0], innerHeight / 2 + -tmpRect[i][1])
        }
    ctx.fill()

    }
    ctx.restore()

}

export {
    rectsHidingCenter,
    spiral,
}