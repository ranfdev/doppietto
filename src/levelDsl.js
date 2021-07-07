import { ARRAY_TYPE, copyVec2D, scaleVec2D, addVec2D } from "./math.js";
export const GAME_WIDTH = 360;
export const GAME_HEIGHT = 640;
export const PLAYER_SPEED = Math.PI / 1000;

const tmpVec = new ARRAY_TYPE(2)
export const changeTranslation = (speed) => (ob, time) => {
    scaleVec2D(tmpVec, speed, time);
    addVec2D(ob.transform.translation, ob.transform.translation, tmpVec);
    return ob 
}

export const changeRotation = (speed) => (ob, time) => {
    ob.transform.rotation += speed * time;
    return ob
}

export const changeOpacity = (speed) => (ob, time) => {
    ob.opacity += speed * time;
    return ob
}

export const createRect = (width, height) => [
    [width / 2, height / 2],
    [-width / 2, height / 2],
    [-width / 2, -height / 2],
    [width / 2, -height / 2]
]
export const createArrowH = (width, height) => [
    [
        [width / 2 + 10, 0],
        [width / 2, height / 2],
        [-width / 2, height / 2],
        [-width / 2 + 10, 0]
    ],
    [
        [-width / 2 + 10, 0],
        [-width / 2, -height / 2],
        [width / 2, -height / 2],
        [width / 2 + 10, 0]
    ]
]
export const createArrowV = (width, height) => [
    [
        [0, height / 2],
        [-width / 2, height / 2 + 15],
        [-width / 2, -height / 2 + 15],
        [0, -height / 2]
    ],
    [
        [-width / 2, height / 2 + 15],
        [-width, height / 2],
        [-width, -height / 2],
        [-width / 2, -height / 2 + 15]
    ]
]

export const changeLimitedTime = (start = 0, duration = Infinity) => (f) => (
    pos,
    time
) => time < start
        ? pos
        : f(pos, time - start > duration ? duration : time - start)

export const createTransform = ({
    translation = [0, 0],
    rotation = 0,
    scale = [1, 1]
}) => ({
    translation: ARRAY_TYPE.from(translation),
    rotation,
    scale: ARRAY_TYPE.from(scale)
})

export const composeChanges = (...changes) => (obj, time) => {
    for (let i = 0; i < changes.length; i++) {
        changes[i](obj, time)
    }
    return obj
}

export const createObstacleFun = (initialObstacle, change) => {
    let copy = JSON.parse(JSON.stringify(initialObstacle))
    return (time) => {
        // reset copy
        copyVec2D(copy.transform.translation, initialObstacle.transform.translation)
        copy.transform.rotation = initialObstacle.transform.rotation
        copyVec2D(copy.transform.scale, initialObstacle.transform.scale)
        return change(copy, time)
    }
}


export const createLevel = levelDescription => ({
    length: levelDescription.length || 1000*5,
    player: {
        radius: 100,
        ballsRadius: 20,
        transform: createTransform({}),
        ...levelDescription.player
    },
    obstacles: levelDescription.obstacles
})
