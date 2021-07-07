import { changeRotation, changeLimitedTime, PLAYER_SPEED, GAME_WIDTH, GAME_HEIGHT, composeChanges } from "./levelDsl.js"
import * as backgrounds from "./backgrounds.js"
import { transformMat2D, createMat2D, initTransformMat2D, subVec2D, ARRAY_TYPE, copyVec2D, } from "./math.js"
import * as levels from "./levels.js"

const STEP_SIZE = 1

const setupCanvas = (gameElement) =>
  ["background", "playerObstacles"].reduce((renderTargets, id) => {
    const canvas = document.createElement('canvas')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    gameElement.appendChild(canvas)
    renderTargets[id] = canvas.getContext("2d")
    return renderTargets
  }, {})

const drawPoly = (ctx, points) => {
  ctx.beginPath()
  for (let i = 0; i < points.length; i++) {
    ctx.lineTo(window.innerWidth / 2 + points[i][0], window.innerHeight / 2 + -points[i][1])

  }
  ctx.fill()
}
const drawCirc = (ctx, x, y, r) => {
  ctx.beginPath()
  ctx.arc(
    window.innerWidth / 2 + x,
    window.innerHeight / 2 - y,
    r,
    0,
    Math.PI * 2
  )
  ctx.fill()
}

const applyChangesAt = (level) => {
  const layer = {
    obstacles: level.obstacles.map(f => f(0)),
    player: level.player,
    time: 0
  }
  return (player, time) => {
    layer.time = time
    layer.player = player(time)

    for (let i = 0; i < level.obstacles.length; i++) {
      layer.obstacles[i] = (level.obstacles[i](time))
    }
    return layer
  }
}

// Recreate mesh with optimized ARRAY_TYPE
const optimizeMesh = (mesh) => {
  return mesh.map(p => ARRAY_TYPE.from(p))
}

const buildGameTree = (level) => {
  const activeObstacles = level.obstacles.map(f => {
    const ob = JSON.parse(JSON.stringify(f(0)))
    ob.meshes = ob.meshes.map(optimizeMesh)
    return ob
  })
  const matrix = createMat2D()
  const balls = [
    "#0066ff",
    "red"
  ].map((color) => ({
    pos: [0, 0],
    radius: 10,
    color: color
  }))
  const player = {
    pos: new ARRAY_TYPE([0, 0]),
    radius: 100,
    balls: balls
  }
  const layer = {
    time: 0,
    player: player,
    obstacles: activeObstacles
  }
  return (gameState) => {
    const transform = gameState.player.transform
    for (let i = 0; i < balls.length; i++) {
      const side = i * 2 - 1
      balls[i].pos[0] = Math.floor(Math.cos(transform.rotation) * gameState.player.radius * side + transform.translation[0])
      balls[i].pos[1] = Math.floor(Math.sin(transform.rotation) * gameState.player.radius * side + transform.translation[1])
      balls[i].radius = gameState.player.ballsRadius
    }

    for (let i = 0; i < gameState.obstacles.length; i++) {
      const transform = gameState.obstacles[i].transform
      initTransformMat2D(matrix, transform.translation[0], transform.translation[1], transform.rotation, transform.scale[0], transform.scale[1])
      for (let j = 0; j < gameState.obstacles[i].meshes.length; j++) {
        for (let z = 0; z < gameState.obstacles[i].meshes[j].length; z++) {
          transformMat2D(activeObstacles[i].meshes[j][z], gameState.obstacles[i].meshes[j][z], matrix)
        }
      }
    }
    layer.time = gameState.time
    return layer
  }
}

const clear = (ctx) => {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
}
const drawPlayer = (ctx, player) => {
  for (let i = 0; i < player.balls.length; i++) {
    ctx.fillStyle = player.balls[i].color
    drawCirc(ctx, player.balls[i].pos[0], player.balls[i].pos[1], player.balls[i].radius)
  }
}
const bpmToMs = (bpm) => (60 / bpm) * 1000
const drawObstacles = (ctx, obstacles) => {
  ctx.fillStyle = "white"
  for (let i = 0; i < obstacles.length; i++) {
    if (obstacles[i].opacity !== 1) {
      ctx.fillStyle = `rgba(255,255,255,${obstacles[i].opacity})`
    }
    for (let j = 0; j < obstacles[i].meshes.length; j++) {
      drawPoly(ctx, obstacles[i].meshes[j])
    }
  }
}
const renderGameTree = (renderTargets, drawBackground, tree) => {
  drawBackground(renderTargets.background, tree.time, window)
  clear(renderTargets.playerObstacles)
  drawPlayer(renderTargets.playerObstacles, tree.player)
  drawObstacles(
    renderTargets.playerObstacles,
    tree.obstacles,
    tree.time
  )
}

function at(n) {
  // ToInteger() abstract op
  n = Math.trunc(n) || 0
  // Allow negative indexing from the end
  if (n < 0) n += this.length
  // OOB access is guaranteed to return undefined
  if (n < 0 || n >= this.length) return undefined
  // Otherwise, this is just normal property access
  return this[n]
}

// Other TypedArray constructors omitted for brevity.
for (let C of [Array, String, Uint8Array]) {
  Object.defineProperty(C.prototype, "at", {
    value: at,
    writable: true,
    enumerable: false,
    configurable: true
  })
}
const toUnitVector = (v) => {
  const mag = Math.sqrt(v[0] * v[0] + v[1] * v[1])
  v[0] /= mag
  v[1] /= mag
}
const toNormalVector = (v) => {
  let tmp = v[0]
  v[0] = -v[1]
  v[1] = tmp
}
const checkOverlap = (mesh, ball, axis) => {
  let maxP = -Infinity
  let minP = Infinity
  for (let i = 0; i < mesh.length; i++) {
    const proj = axis[0] * mesh[i][0] + axis[1] * mesh[i][1]
    if (proj > maxP) maxP = proj
    if (proj < minP) minP = proj
  }

  const ballProj = axis[0] * ball.pos[0] + axis[1] * ball.pos[1]

  const overlap = ballProj + ball.radius > minP && ballProj - ball.radius < maxP
  return overlap
}
// SAT Algorithm
const checkCollisionAxis = [0, 0]
const checkCollision = (mesh, ball) => {
  for (let i = 0; i < mesh.length; i++) {
    // Check edge projections
    subVec2D(checkCollisionAxis, mesh.at(i - 1), mesh.at(i))
    toUnitVector(checkCollisionAxis)
    toNormalVector(checkCollisionAxis)

    if (!checkOverlap(mesh, ball, checkCollisionAxis)) {
      return false
    }

    // Check vertex-ballCenter projection
    subVec2D(checkCollisionAxis, mesh.at(i), ball.pos)
    toUnitVector(checkCollisionAxis)

    if (!checkOverlap(mesh, ball, checkCollisionAxis)) {
      return false
    }
  }

  return true
}
const checkCollisionsSAT = ({ obstacles, player }) => {
  for (let i = 0; i < obstacles.length; i++) {
    for (let j = 0; j < obstacles[i].meshes.length; j++) {
      for (let z = 0; z < player.balls.length; z++) {
        if (checkCollision(obstacles[i].meshes[j], player.balls[z])) {
          return true
        }
      }
    }
  }
  return null
}

function easeInOutQuart(t) {
  const t1 = t - 1
  return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * t1 * t1 * t1 * t1
}
const timeUpdateForward = (fromGameTime, fromGlobalTime) => (globalTime) =>
  fromGameTime + globalTime - fromGlobalTime
const resetTime = 2000
const timeUpdateBackward = (fromGameTime, fromGlobalTime) => (globalTime) =>
  fromGameTime -
  fromGameTime *
  easeInOutQuart((globalTime - fromGlobalTime) / resetTime) *
  1.2

const playerChangesMap = {
  [-1]: changeRotation(PLAYER_SPEED * 1),
  [1]: changeRotation(PLAYER_SPEED * -1),
  [0]: (player, time) => player,
}
const playerActionsToChanges = level => {
  const copy = JSON.parse(JSON.stringify(level.player))
  let player = (player) => player
  let playerChanges = []
  return (events) => {
    playerChanges.length = 0
    let time = events[events.length-1]?.time || 0
    for (let i = events.length-1; i >= 0; i--) {
      const duration = time != events[i].time ? time - events[i].time : undefined
      const start = events[i].time
      const rotSide = events[i].eventType == "press" ? events[i].side : 0
      time = start
      playerChanges.push(changeLimitedTime(start, duration)(playerChangesMap[rotSide]))
    }
    const changePlayer = composeChanges(...playerChanges)
    return (time) => {
      // reset player
      copy.transform.rotation = level.player.transform.rotation
      changePlayer(copy, time)
      return copy
    }
  }}

const randomArrayEl = arr => arr[Math.floor(Math.random() * arr.length)]

const setupEventListeners = (gameElement, sendPlayerAction, setTimeUpdate) => {
  document.getElementById("timeSlider").max = 30000
  document.getElementById("timeSlider").addEventListener("change", e => {
    e.preventDefault()
    document.getElementById("timeNumber").value = e.target.value
    setTimeUpdate(time => e.target.value)
  })
  gameElement.addEventListener("contextmenu", (e) => e.preventDefault());

  [
    { down: "mousedown", up: "mouseup", getSide: (e) => e.clientX > window.innerWidth / 2 ? 1 : -1 },
    {
      down: "touchstart",
      up: "touchend",
      getSide: (e) => e.touches[0].clientX > window.innerWidth / 2 ? 1 : -1
    }
  ].forEach(({ down, up, getSide }) => {
    gameElement.addEventListener(down, (e) => {
      const side = getSide(e)
      sendPlayerAction({ eventType: "press", side })
      gameElement.addEventListener(
        up,
        () => {
          const side = getSide(e)
          sendPlayerAction({ eventType: "lift", side })
        },
        { once: true }
      )
    })
  })
}
const main = () => {
  const gameElement = document.getElementById("game")
  const renderTargets = setupCanvas(gameElement)
  let gameTime = 0
  let timeUpdate = timeUpdateForward(0, 0)
  let level = Object.values(levels)[0]
  let background = Object.values(backgrounds)[0]

  let playerActions = []
  const playerActionsToChangesForLevel = playerActionsToChanges(level)
  let player = playerActionsToChangesForLevel(0)
  setupEventListeners(gameElement, (playerAction) => {
    playerActions.push({ ...playerAction, time: gameTime })
    player = playerActionsToChangesForLevel(playerActions)
  }, timeFunction => {
    timeUpdate = timeFunction
  })

  let checkCollisions = checkCollisionsSAT
  document.getElementById("toggleCollisions").addEventListener("change", (e) => {
    checkCollisions = e.target.checked
      ? checkCollisionsSAT
      : (...args) => (checkCollisionsSAT(...args), null)
  })

  let lastRealTime = 0
  let gameTree

  const buildGameTreeForLevel = buildGameTree(level)
  const applyChangesAtForLevel = applyChangesAt(level)
  const loop = (time) => {
    while (lastRealTime <= time) {
      lastRealTime += STEP_SIZE
      gameTime = timeUpdate(lastRealTime)
      const gameState = applyChangesAtForLevel(player, gameTime)
      gameTree = buildGameTreeForLevel(gameState)
      const collision = checkCollisions(gameTree)
      if (collision) {
        timeUpdate = timeUpdateBackward(gameTime - STEP_SIZE, lastRealTime)
      } else if (gameTime <= 0) {
        playerActions = []
        player = playerActionsToChangesForLevel(playerActions)
        timeUpdate = timeUpdateForward(gameTime, lastRealTime)
      }
    }
    renderGameTree(renderTargets, background, gameTree)
    window.requestAnimationFrame(loop)
  }
  loop(0, 0)
}
main()