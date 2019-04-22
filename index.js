var WIDTH = 480;
var HEIGHT = 854;
var EMPTY_LEVEL = {
  obstacles: [],
  text: 'Loading'
}
var DEFAULT_SPEED = 1 / 1000;
var CANVAS = $("CANVAS");
var CTX = CANVAS.getContext("2d");
var r = Math.random;
var LEVEL_QUANTITY = 20;


var deaths = 0;
var scaleY = 1;
var time;
var paused = false;
var lastTime;
var restarting = false;
var last_level = Infinity;
var obstacle_offset = 0;
var random_quantity = 10;
var speed = 1;
var currentLevel;
var animation = {
  speed: DEFAULT_SPEED,
  progress: 0,
  values: {
    time: 0,
    rotation: 0
  }
}
var player;
var background;



function $(query) {
  return document.querySelector(query);
}
function handleLevelClick(e) {
  var value = e.target.innerText;
  toggleMenu();
  loadLevel(parseInt(e.target.innerText, 10));
}
function renderLevelList() {
  for (let i = 0; i < LEVEL_QUANTITY; i++) {
    var el = document.createElement('span');
    el.innerText = i
    $('.levels').append(el);
    el.addEventListener('click', handleLevelClick)
  }
}
function resize() {
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;
  scaleY = CANVAS.height / HEIGHT;
  scaleYX = window.innerWidth / WIDTH;
  obstacle_offset = WIDTH / 2 * scaleYX / scaleY - WIDTH / 2
}
function ease(v) {
  return 0.5 * (1 - Math.cos(v * Math.PI));
}
function circle(x, y, r) {
  CTX.beginPath();
  CTX.arc(x * scaleY, y * scaleY, r * scaleY, 0, Math.PI * 2, false);
}
function rect(x, y, w, h) {
  CTX.fillRect(x * scaleY, y * scaleY, w * scaleY, h * scaleY);
}
function translate(x, y) {
  CTX.translate(x * scaleY, y * scaleY)
}

function generateRandomLevel(opt) {
  var quantity = opt.quantity || 10;
  var created = 0;
  var y = 0, x = 0;
  var level = {
    finish: 0,
    ballsRadius: opt.ballsRadius || r() * (20 - 10) + 10,
    spaceRadius: opt.spaceRadius || r() * (130 - 100) + 100,
    speed: opt.speed || r() * opt.difficulty / 5 + 1,
    text: opt.text || "Random level",
    obstacles: [],
  };
  while (created < quantity) {
    var size = 100;
    var shouldRotate = r() < 0.5 ? true : false
    var sinSpeed, sinMovement, rotation, rotationSpeed, invisibleAt, invisibleThreshold, from
    switch (opt.difficulty) {
      case 7:
        invisibleAt = r() * (854 - 500) + 500;
        invisibleThreshold = r() * (200 - 100) + 100
      case 6:
        from = {
          x: r() > 0.5 ? r() * (854 - 500) + 200 : 0,
          y: r() > 0.5 ? r() * (400 - 500) + 200 : 0
        }
      case 5:
        sinMovement = r() < 0.5 ? 20 : undefined;
        sinSpeed = r() / 2;
      case 4:
        rotationSpeed = shouldRotate ? r() / 1000 : undefined;
      case 3:
        rotation = r();
      case 2:
      case 1:
        sy = (level.spaceRadius * 2 + level.ballsRadius * 2) / 1000;
    }
    y -= level.spaceRadius * 2 + level.ballsRadius * 2;
    var size;
    var position = r();
    var position_string;

    if (position > 0 && position < 3 / 7) {
      position_string = 'left';
      size = 200;
      x = 40;
    } else if (position > 3 / 7 && position < 4 / 7) {
      position_string = 'center';
      size = r() * (level.spaceRadius) + level.spaceRadius / 2;
      x = WIDTH / 2 - size / 2;
    } else if (position > 4 / 7 && position < 1) {
      position_string = 'right'
      size = 200;
      x = 480 - size - 40;
    }

    if (opt.difficulty == 2 && r() > 0.9) {
      size -= level.ballsRadius * 2;
      y -= level.spaceRadius * 2 + level.ballsRadius * 2;
      level.obstacles.push({
        x: 480 - size - 40,
        y: y,
        w: size,
        h: 40,
        sy: sy,
      })
      level.obstacles.push({
        x: 40,
        y: y,
        w: size,
        h: 40,
        sy: sy,
      })
      y -= level.spaceRadius * 2 + level.ballsRadius * 2;
    } else if (opt.difficulty == 2 && r() > 0.5 && (position_string != 'center')) {
      y -= level.spaceRadius * 2 + level.ballsRadius * 2;
      level.obstacles.push({
        x: x,
        y: y,
        w: size,
        h: 40,
        sy: sy,
      })
      level.obstacles.push({
        x: 480 - x - size + 80,
        y: y + level.spaceRadius + level.ballsRadius,
        w: 80,
        h: 40,
        sy: sy,
      })
    } else {
      level.obstacles.push({
        x: x,
        y: y,
        w: size,
        h: 40,
        sy: sy,
        rotationSpeed: rotationSpeed,
        rotation: rotation,
        sinMovement: sinMovement,
        sinSpeed: sinSpeed,
        from: from,
        invisibleAt: invisibleAt,
        invisibleThreshold

      })
    }

    created++
  }
  level.playerY = HEIGHT - level.spaceRadius - level.ballsRadius - 5;
  var lastObstacle = level.obstacles[level.obstacles.length - 1];
  level.finish = (lastObstacle.y - 854 - lastObstacle.h - lastObstacle.w) / -0.2;
  var result = JSON.stringify(level);
  console.log('generated level', result);
  return result;
}

class Obstacle extends SAT.Box {
  constructor({ 
    x, 
    y, 
    w, 
    h, 
    sx = 0,
    sy = 0,
    rotation = 0,
    sinSpeed = 0,
    sinMovement = 0,
    rotationSpeed = 0,
    invisibleAt = -1,
    invisibleThreshold = 1,
    from 
  }) {
    super(new SAT.Vector(x, y), w, h);
    this.startX = x;
    this.startY = y;
    this.sx = sx;
    this.sy = sy;
    this.sinSpeed = sinSpeed * Math.PI;
    this.sinMovement = sinMovement * Math.PI;
    this.startRotation = rotation * Math.PI;
    this.rotation = rotation * Math.PI;
    this.rotationSpeed = rotationSpeed * Math.PI;
    this.opacity = 1;
    this.invisibleAt = invisibleAt;
    this.from = {
      x: from ? from.x : 0,
      y: from ? from.y : 0
    }
  }
  update() {
    // invisibilty
    if (this.invisibleAt > 0) {
      // example:
      // it should be invisible at half of the screen,
      // so this.invisibleAt should be HEIGHT/2
      let calculatedOpacity = (this.invisibleAt - this.pos.y) / 100;
      this.opacity = calculatedOpacity < 1 ? calculatedOpacity : 1;
    }

    // x axis movement
    if (this.sinSpeed > 0) {
      const sin = Math.sin(time / 1000 * Math.PI * this.sinSpeed)
      this.pos.x = this.startX + Math.sign(sin) * Math.pow(Math.abs(sin), 0.7) * this.sinMovement;
    }
    this.pos.x = this.startX + obstacle_offset;

    // rotation
    if (this.rotationSpeed > 0 || this.rotation > 0) {
      this.rotation = this.rotationSpeed * time + this.startRotation
    }

    // y axis movement
    this.pos.y = this.startY + this.sy * time;
    if (this.from) {
      this.pos.y += this.from.y - (this.from.y * Math.min((this.pos.y / (HEIGHT / 3)), 1));
    }
  }
  getPoly() {
    const poly = this.toPolygon();
    poly.setOffset(new SAT.Vector(this.w / 2, this.h / 2));
    poly.translate(-this.w / 2, -this.h / 2);
    poly.rotate(this.rotation);
    return poly;
  }
  draw(time, timeDiff) {
    CTX.save();
    translate(this.pos.x + this.w / 2, this.pos.y + this.h / 2);
    CTX.rotate(this.rotation);
    const scaleY = Math.sin(time / 100 * 0.6) / 15 + 1;
    CTX.scale(scaleY, scaleY);
    CTX.fillStyle = `rgba(255,255,255,${this.opacity})`;
    rect(-this.w / 2, -this.h / 2, this.w, this.h);
    CTX.restore();
  }
}

function restart(isTransitioning, speed) {
  if (isTransitioning) {
    deaths = 0;
  } else {
    deaths++;
  }
  $('#deaths').innerText = deaths;
  transitioning = isTransitioning;
  restarting = true;
  animation.speed = speed || DEFAULT_SPEED;
  animation.values.time = time;
  animation.values.rotation = player.rotation;
  animation.progress = 0;
  paused = false;
}

class Background {
  constructor() {
    this.width = 200;
    this.additionalScale = 2;
  }
  draw(time, timeDiff) {
    CTX.fillStyle = 'rgba(255,255,255,0.05)';
    var quantityX = window.innerWidth / this.width;
    var quantityY = window.innerHeight / this.width;
    for (let y = 0; y < quantityY; y++) {
      for (let x = 0; x < quantityX; x++) {
        CTX.save();
        translate(-window.innerWidth*this.additionalScale+window.innerWidth + x * this.width*scaleYX * this.additionalScale+ time/20,-window.innerHeight*this.additionalScale+window.innerHeight + y * this.width*scaleYX * this.additionalScale+time/20);
        var finalScale;

        if (y % 2 == 0 && x % 2 == 0 || y % 2 != 0 && x % 2 != 0) {
          CTX.rotate(time / 2000);
          finalScale = Math.sin(time / 1000)/2+1.0;
        } else {
          CTX.rotate(-time / 2000);
          finalScale = Math.cos(time / 1000)/2+1.0;
        }
        rect(0, 0, this.width*finalScale, this.width*finalScale);
        CTX.restore();
      }
    }
  }
}


class Ball extends SAT.Circle {
  constructor(x, y, r) {
    super(new SAT.Vector(x, y), r);
  }
  set color(v) {
    this._color = v;
    this.grd = CTX.createLinearGradient(0, 0, 0, window.innerHeight);
    this.grd.addColorStop(0, this._color);
    this.grd.addColorStop(0.5, this._color);
    this.grd.addColorStop(1, 'rgba(0,0,0,0.0)');
  }
  set x(v) {
    this.pos.x = v;
  }
  set y(v) {
    this.pos.y = v;
  }
  colliding(ob) {
    const poly = ob.getPoly();
    //for (let point of poly.calcPoints) {
    //  CTX.fillStyle = 'red'
    //  CTX.fillRect(point.x+poly.pos.x,point.y+poly.pos.y, 10,10);
    //}
    //CTX.fillRect(this.pos.x-20, this.pos.y-20, 40,40)
    let res = new SAT.Response;
    if (SAT.testPolygonCircle(poly, this, res)) {
      return true
    }
  }
  draw() {
    CTX.fillStyle = this.grd;
    rect(this.pos.x - this.r, this.pos.y, this.r * 2, this.pos.y + 500);

    CTX.fillStyle = this._color;
    circle(this.pos.x, this.pos.y, this.r);
    CTX.fill();
  }
}

class Player {
  constructor(ballsRadius, spaceRadius) {
    this.x = WIDTH / 2;
    this.ball1 = new Ball(0, 0, ballsRadius);
    this.ball1.color = 'rgb(10,80,255)';
    this.ball2 = new Ball(0, 0, ballsRadius);
    this.ball2.color = 'rgb(255,20,20)';
    this.spaceRadius = spaceRadius;
    this.y = HEIGHT - this.spaceRadius - this.ballsRadius - 5;
    this.rotationSpeed = Math.PI / 1000;
    this.rotation = 0;
    this.left = 0;
    this.right = 0;
  }
  setDirectionState(direction, state) {
    if (direction) {
      this.right = state;
    } else {
      this.left = state;
    }
  }
  set ballsRadius(r) {
    this.ball1.r = r;
    this.ball2.r = r;
  }
  get ballsRadius() {
    return this.ball1.r;
  }
  colliding(ob) {
    return this.ball1.colliding(ob) || this.ball2.colliding(ob)
  }
  draw(time, timeDiff) {
    if (player.right == true) {
      this.rotation += this.rotationSpeed * timeDiff;
    } else if (player.left == true) {
      this.rotation -= this.rotationSpeed * timeDiff;
    }

    let offsetX = Math.cos(this.rotation) * this.spaceRadius;
    let offsetY = Math.sin(this.rotation) * this.spaceRadius;

    this.ball1.x = offsetX + this.x + obstacle_offset;
    this.ball1.y = offsetY + this.y;


    this.ball2.x = -offsetX + this.x + obstacle_offset;
    this.ball2.y = -offsetY + this.y;

    CTX.strokeStyle = 'rgba(255,255,255,0.3)';
    CTX.lineWidth = 2 * scaleY;
    circle(this.x + obstacle_offset, this.y, this.spaceRadius);
    CTX.stroke();

    this.ball1.draw();
    this.ball2.draw();


  }
}





function parseLevel(obj) {
  obj = JSON.parse(obj)
  for (i = 0; i < obj.obstacles.length; i++) {
    obstacle_offset = WIDTH / 2 * scaleYX / scaleY - WIDTH / 2
    obj.obstacles[i] = new Obstacle(obj.obstacles[i]);
  }
  obj.initialized = true;
  return obj
}
function loadGeneratedLevel(options) {
  levelNumber = 0;
  currentLevel = parseLevel(generateRandomLevel(options));
  setupLevel();
  restart(true);
}
function loadLevel(n) {
  restart(true, 1 / 10000);
  currentLevel = EMPTY_LEVEL;
  if (n > last_level) {
    return
  }
  levelNumber = n;
  console.log('loading level', n)
  req = new XMLHttpRequest();
  req.addEventListener('load', function () {
    if (req.status != 200) {
      last_level = n - 1;
      console.error("level", n, "doesn't exist");
      currentLevel.text = "can't load current level";
      return;
    }
    console.log('loaded')
    currentLevel = parseLevel(req.responseText);
    setupLevel();
    restart(true);
  })
  req.open('GET', 'level' + n + '.json');
  req.send();
}
function setupLevel() {
  speed = currentLevel.speed || 1;
  if (currentLevel.playerY) {
    player.y = currentLevel.playerY;
  }
  if (currentLevel.ballsRadius) {
    player.ballsRadius = currentLevel.ballsRadius;
  }
  if (currentLevel.spaceRadius) {
    player.spaceRadius = currentLevel.spaceRadius;
  }
}
function nextLevel() {
  loadLevel(levelNumber + 1)
}

function drawAll(abstime) {
  requestAnimationFrame(drawAll);
  timeDiff = (abstime - lastTime) * speed;
  lastTime = abstime;

  if (paused) {
    return;
  }
  //clear + motion blur
  CTX.fillStyle = 'rgb(0,0,0,0.4)';
  CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);

  background.draw(time, timeDiff);
  player.draw(time, timeDiff)

  if (restarting) {
    // progress reverse animation
    animation.progress += animation.speed * timeDiff;
    time = animation.values.time - animation.values.time * ease(animation.progress);
    player.rotation = animation.values.rotation - animation.values.rotation * ease(animation.progress);
    if (animation.progress > 1) {
      restarting = false;
      transitioning = false;
      time += timeDiff;
    }
    // if it is also transitioning to next level
    if (transitioning) {
      CTX.fillStyle = `rgba(0,0,0,${Math.min(time / 100, 1)})`;
      rect(0, 0, window.innerWidth / scaleY, window.innerHeight / scaleY);
      CTX.font = `${50 * scaleY}px Arial`;
      CTX.textAlign = 'center';
      CTX.fillStyle = `rgba(255,255,255,${time / 100})`;
      CTX.fillText(levelNumber, window.innerWidth / 2, window.innerHeight / 2);
    }
  } else {
    time += timeDiff
  }
  // draw obstacles, and check collisions
  for (let ob of currentLevel.obstacles) {
    ob.update();
    if (!transitioning && ob.pos.y > -ob.h - ob.w && ob.pos.y - ob.h - ob.w < HEIGHT) {
      ob.draw(time, timeDiff);
      if (ob.pos.y > (player.y - player.spaceRadius - player.ballsRadius)) {
        //same as before,but also checks collisions
        if (!restarting && player.colliding(ob)) {
          restart();
          break
        }
      }

    }

  }
    if (!restarting && time > currentLevel.finish) {
      nextLevel()
    }
}
function toggleMenu() {
  paused = paused ? false : true;
  $('.container').classList.toggle("active");
  console.log('toggled menu');
}

function init() {
  console.log('Game created by: ranfdev');
  time = 3000;
  lastTime = performance.now();
  restarting = false;
  currentLevel = EMPTY_LEVEL;
  $(".container").classList.toggle('active');
  player = new Player(17, 120);
  background = new Background(window.innerWidth / (9 * 2), window.innerHeight / (16 * 2));
  resize();
  CANVAS.addEventListener('mousedown', function (e) { 
    e.preventDefault(); 
    player.setDirectionState(e.clientX > window.innerWidth/2, true);
  });
  CANVAS.addEventListener('touchstart', function (e) {
    e.preventDefault();
    for (var i = 0; i < e.changedTouches.length; i++) {
      player.setDirectionState(e.changedTouches[i].clientX > window.innerWidth / 2, true)
    }
  }
    , { passive: false })
  CANVAS.addEventListener('touchend', function (e) {
    e.preventDefault();
    for (var i = 0; i < e.changedTouches.length; i++) {
      player.setDirectionState(e.changedTouches[i].clientX > window.innerWidth / 2, false)
    }
  }, { passive: false })

  addEventListener('keydown', function (e) {
    player.setDirectionState(e.key == 'ArrowRight', true);
  });
  CANVAS.addEventListener('mouseup', function (e) {
    e.preventDefault();
    player.setDirectionState(e.clientX > window.innerWidth/2, false);
  });
  addEventListener('keyup', function (e) { 
    player.setDirectionState(e.key == 'ArrowRight', false);
  });
  addEventListener('resize', resize)
  addEventListener('focus', () => { })

  renderLevelList();
  requestAnimationFrame(drawAll);
}
init();
