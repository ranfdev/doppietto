import {
    changeRotation,
    changeLimitedTime,
    changeTranslation,
    changeOpacity,
    composeChanges,
    createTransform,
    createObstacleFun,
    createArrowH,
    createArrowV,
    createRect,
    createLevel,
    GAME_WIDTH,
    GAME_HEIGHT,
    PLAYER_SPEED,
} from "./levelDsl.js"

const PADDING = GAME_WIDTH / 16;
const PLAYER_RADIUS = GAME_WIDTH/4
const BALLS_RADIUS = GAME_WIDTH/24;
export const level1 = createLevel({
    player: {
        radius: PLAYER_RADIUS,
        ballsRadius: BALLS_RADIUS,
        transform: createTransform({translation: [0, -GAME_HEIGHT/2 + PLAYER_RADIUS + BALLS_RADIUS + PADDING]}),
    },
    obstacles: [
        createObstacleFun({
                meshes: createArrowV(GAME_WIDTH*4/8, GAME_HEIGHT/20),
                transform: createTransform({translation: [-100, 100]}),
                opacity: 1,
            },
            composeChanges(
                changeLimitedTime(0)(changeRotation(-PLAYER_SPEED)),
                changeLimitedTime(0)(changeTranslation([0, -40 / 1000])),
            )
        ),
        createObstacleFun({
            meshes: [createRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform({translation: [GAME_WIDTH/2 - GAME_WIDTH*4/8/2 - PADDING, GAME_HEIGHT]}),
            opacity: 1,
        },
        composeChanges(
            changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
        )
    )
        /*{
            meshes: createObstacleArrowH(GAME_WIDTH/8, GAME_HEIGHT/20),
            transform: createTransform([-GAME_WIDTH/2 + GAME_WIDTH*3/8 + GAME_WIDTH/8/2 + PADDING + 10, 400]),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS]),
                changeLimitedTime(5000, 7000)(changeTranslation([400 / 1000, 0]))
            ]
        },
        {
            meshes: createObstacleArrowH(GAME_WIDTH*3/8, GAME_HEIGHT/20),
            transform: createTransform([-GAME_WIDTH/2 + GAME_WIDTH*3/8/2 + PADDING, 400]),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS]),

            ]
        },
        {
            meshes: createObstacleArrowV(GAME_WIDTH*4/8, GAME_HEIGHT/20),
            transform: createTransform([-100, 500]),
            opacity: 1,
            change: [
                changeLimitedTime(3000)(changeRotation(-PLAYER_SPEED)),
                changeLimitedTime(0)(changeTranslation([0, -40 / 1000])),
            ]
        },
        {
            meshes: [createObstacleRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform({translation: [GAME_WIDTH/2 - GAME_WIDTH*4/8/2 - PADDING, GAME_HEIGHT]}),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
        {
            meshes: [createObstacleRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform({translation: [GAME_WIDTH/2 - GAME_WIDTH*4/8/2 - PADDING, GAME_HEIGHT + PLAYER_RADIUS*2]}),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
        {
            meshes: [createObstacleRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform({translation: [GAME_WIDTH/2 - GAME_WIDTH*4/8/2 - PADDING, GAME_HEIGHT + PLAYER_RADIUS*4]}),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
        {
            meshes: [createObstacleRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform({translation: [GAME_WIDTH/2 - GAME_WIDTH*4/8/2 - PADDING, GAME_HEIGHT + PLAYER_RADIUS*6]}),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
        {
            meshes: [createObstacleRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform({translation: [GAME_WIDTH/2 - GAME_WIDTH*4/8/2 - PADDING, GAME_HEIGHT + PLAYER_RADIUS*8]}),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
        {
            meshes: [createObstacleRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform({translation: [GAME_WIDTH/2 - GAME_WIDTH*4/8/2 - PADDING, GAME_HEIGHT + PLAYER_RADIUS*10]}),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
        {
            meshes: [createObstacleRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform({translation: [- GAME_WIDTH/2 + GAME_WIDTH*4/8/2 + PADDING, GAME_HEIGHT + PLAYER_RADIUS*12]}),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
        {
            meshes: [createObstacleRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform({translation: [- GAME_WIDTH/2 + GAME_WIDTH*4/8/2 + PADDING, GAME_HEIGHT + PLAYER_RADIUS*14]}),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
        {
            meshes: [createObstacleRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform({translation: [- GAME_WIDTH/2 + GAME_WIDTH*4/8/2 + PADDING, GAME_HEIGHT + PLAYER_RADIUS*16]}),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
        {
            meshes: [createObstacleRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform({translation: [GAME_WIDTH/2 - GAME_WIDTH*4/8/2 - PADDING, GAME_HEIGHT + PLAYER_RADIUS*18]}),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
        {
            meshes: [createObstacleRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform({translation: [- GAME_WIDTH/2 + GAME_WIDTH*4/8/2 + PADDING, GAME_HEIGHT + PLAYER_RADIUS*20]}),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },*/
    ]
})
export const level2 = createLevel({
    player: {
        radius: PLAYER_RADIUS,
        ballsRadius: BALLS_RADIUS,
        transform: createTransform({translation: [0, -GAME_HEIGHT/2 + PLAYER_RADIUS + BALLS_RADIUS + PADDING]}),
    },
    obstacles: [
        {
            meshes: [createRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform({translation: [GAME_WIDTH/2 - GAME_WIDTH*4/8/2 - PADDING, GAME_HEIGHT]}),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
        {
            meshes: [createRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform({translation: [0, GAME_HEIGHT + PLAYER_RADIUS*4]}),
            opacity: 1,
            change: [
                changeRotation(-PLAYER_SPEED * 1.5),
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
        {
            meshes: [createRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform({translation: [GAME_WIDTH/2 - GAME_WIDTH*4/8/2 - PADDING, GAME_HEIGHT + PLAYER_RADIUS*8]}),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
        {
            meshes: [createRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform({translation: [GAME_WIDTH/2 - GAME_WIDTH*4/8/2 - PADDING, GAME_HEIGHT + PLAYER_RADIUS*10]}),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
        {
            meshes: [createRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform({translation: [0, GAME_HEIGHT + PLAYER_RADIUS*14], rotation: PLAYER_SPEED*500}),
            opacity: 1,
            change: [
                changeRotation(-PLAYER_SPEED * 1.5),
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
        {
            meshes: [createRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform({translation: [GAME_WIDTH/2 - GAME_WIDTH*4/8/2 - PADDING, GAME_HEIGHT + PLAYER_RADIUS*18]}),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
        {
            meshes: [createRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform({translation: [- GAME_WIDTH/2 + GAME_WIDTH*4/8/2 + PADDING, GAME_HEIGHT + PLAYER_RADIUS*20]}),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
    ]
})
export const level3 = createLevel({
    length: 1000*20,
    player: {
        radius: PLAYER_RADIUS,
        ballsRadius: BALLS_RADIUS,
        transform: createTransform({translation: [0, -GAME_HEIGHT/2 + PLAYER_RADIUS + BALLS_RADIUS + PADDING]}),
    },
    obstacles: [
        {
            meshes: createArrowH(GAME_WIDTH*4/8, GAME_HEIGHT/20),
            transform: createTransform({translation: [GAME_WIDTH/2 - GAME_WIDTH*4/8/2 - PADDING, GAME_HEIGHT]}),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },/*
        {
            meshes: [createObstacleRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform([0, GAME_HEIGHT + PLAYER_RADIUS*4]),
            opacity: 1,
            change: [
                changeRotation(-PLAYER_SPEED * 1.5),
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
        {
            meshes: [createObstacleRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform([GAME_WIDTH/2 - GAME_WIDTH*4/8/2 - PADDING, GAME_HEIGHT + PLAYER_RADIUS*8]),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
        {
            meshes: [createObstacleRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform([GAME_WIDTH/2 - GAME_WIDTH*4/8/2 - PADDING, GAME_HEIGHT + PLAYER_RADIUS*10]),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
        {
            meshes: [createObstacleRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform([0, GAME_HEIGHT + PLAYER_RADIUS*14], PLAYER_SPEED*500),
            opacity: 1,
            change: [
                changeRotation(-PLAYER_SPEED * 1.5),
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
        {
            meshes: [createObstacleRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform([GAME_WIDTH/2 - GAME_WIDTH*4/8/2 - PADDING, GAME_HEIGHT + PLAYER_RADIUS*18]),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },
        {
            meshes: [createObstacleRect(GAME_WIDTH*4/8, GAME_HEIGHT/20)],
            transform: createTransform([- GAME_WIDTH/2 + GAME_WIDTH*4/8/2 + PADDING, GAME_HEIGHT + PLAYER_RADIUS*20]),
            opacity: 1,
            change: [
                changeTranslation([0, -PLAYER_SPEED/Math.PI * PLAYER_RADIUS * 2]),
            ]
        },*/
    ]
})