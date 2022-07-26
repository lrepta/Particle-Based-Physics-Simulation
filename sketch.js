const size = 500;
let lastIndex = 159999;

/* Scaling due to device pixel ratio */
const onscreenPixelRatio = window.devicePixelRatio;
const onscreenScaledWidth = onscreenPixelRatio * size;
const onscreenScaledHeight = onscreenPixelRatio * size;

/* Onscreen canvas. Scaled based on pixel ratio. */
const onscreenCanvas = document.getElementById("mainCanvas");
onscreenCanvas.width = onscreenScaledWidth;
onscreenCanvas.height = onscreenScaledHeight;
onscreenCanvas.style.width = size + "px";
onscreenCanvas.style.height = size + "px";
const onscreenCtx = onscreenCanvas.getContext("2d", { alpha: false });

/*
 * Offscreen game canvas. Drawn at in-game resolution, then
 * scaled and transferred to the onscreen canvas.
 */
const gameCanvas = document.createElement("canvas");
gameCanvas.width = size;
gameCanvas.height = size;
const gameCtx = gameCanvas.getContext("2d");
const gameImagedata = gameCtx.createImageData(size, size);

const pixelData = new ArrayBuffer(4*size*size); // 32 bit for each particle
// bits 0-9 are lifetime
// bit 10 is hasUpdated
// bits 11-15 are id
// bits 16-31 unused for now
const pixelView = new Uint32Array(pixelData);
// alert(gameImagedata.)
const gameImagedata32 = new Uint32Array(gameImagedata.data.buffer);

function init() {
  var gameWrapper = document.getElementById("gameWrapper");
  // gameWrapper.style.height = size + "px";
  // gameWrapper.style.width = size + "px";

  /* setting FPS must occur before initMenu() */
  // setFPS(DEFAULT_FPS);

  // initCursors();
  // initElements();
  // initParticles();
  // initSpigots();
  // initMenu();

  /* Initialize imagedata */
  const len = gameImagedata32.length;
  for (var i = 0; i < len; ++i) {
    gameImagedata32[i] = BACKGROUND;
    
    // saveGameImagedata32[i] = 0;
  }

  for (var i = 0; i < pixelView.length; ++i) {
    pixelView[i] = _BACKGROUND;
  }

  /* Nice crisp pixels, regardless of pixel ratio */
  onscreenCtx.mozImageSmoothingEnabled = false;
  onscreenCtx.imageSmoothingEnabled = false;
  onscreenCtx.webkitImageSmoothingEnabled = false;
  onscreenCtx.msImageSmoothingEnabled = false;
  onscreenCtx.oImageSmoothingEnabled = false;
}

window.onload = function () {
  init();
  setup();
  window.updateMouseDrawing();
  mainLoop(0);
};

function drawCanvas() {
  gameCtx.putImageData(gameImagedata, 0, 0);

  /*
   * To make sure our game looks crisp, we need to handle
   * device pixel ratio. We do this by taking our offscreen
   * game canvas (at our ingame resolution), and then scaling
   * and transferring it to the displayed canvas.
   */
  gameCtx.scale(onscreenPixelRatio, onscreenPixelRatio);
  onscreenCtx.drawImage(
    gameCanvas,
    0,
    0,
    onscreenScaledWidth,
    onscreenScaledHeight
  );
}

var mx = 0;
var my = 0;

var numParticles = 0;

let start = performance.now();
let end = performance.now();
let drawCalls = 0;
const fpsCounter = document.getElementById("fpsCounter");
function calcFps() {
  end = performance.now();
  const fps = Math.floor((1000 * drawCalls) / (end-start));
  start = end;
  drawCalls = 0;
  fpsCounter.innerHTML = fps + " FPS";
}

window.setInterval(calcFps, 500);

function mainLoop(now) {
  ++drawCalls;
  window.requestAnimationFrame(mainLoop);
  numParticles = 0;

  if (drawing) {
    // console.log("hi");
    // console.log("x = " + mx + ", y = " + my);
    // const rect = onscreenCanvas.getBoundingClientRect();
    // const x = (e.clientX - rect.left) / (rect.right - rect.left) * onscreenCanvas.width;
    // const y = (e.clientY - rect.top) / (rect.bottom - rect.top) * onscreenCanvas.height;


    if (mx < arrWidth && mx > 0 &&
        my < arrHeight && my > 0) {
      for (let i = -brushSize; i < brushSize; i++) {
        if (my + i > arrHeight - 1 || my + i < 0) {
          continue;
        }
        for (let j = -brushSize; j < brushSize; j++) {
          if (mx + j > arrWidth - 1 || mx + j < 0) {
            continue;
          }
          if(drawingWith != 3 && drawingWith != 0) {
            let randomSpread = randInt(0, 6);
            if (randomSpread != 5) {
              continue;
            }
          }

          const index = mx+j + ((my+i)*arrHeight);

          // INEFFICIENT, REWRITE
          if (drawingWith == _BACKGROUND) {
            // arr2d[mx + j][my+ i].setEmpty();
            setEmpty(index);

          } else if (getID(index) == _BACKGROUND || drawingWith == _BACKGROUND) {
            
            // arr2d[mx + j][my+ i].setID(drawingWith, index);
            setID(drawingWith, index);
            setNotUpdated(index);
            // arr2d[mx + j][my + i].setUpdated(false);
            if (drawingWith == _FIRE) {
              setLifeTime(flameLife + randInt(-15, 0), index);
            } else if (drawingWith == _SMOKE) {
              setLifeTime(smokeLife + randInt(-15, 0), index);
            }
          }
          
          // else if (arr2d[mx + j][my + i].getID() == 0 || drawingWith == 0) {
          //   arr2d[mx + j][my+ i].setID(drawingWith);
          //   // arr2d[mx + j][my+ i].setEmpty();
          //   arr2d[mx + j][my + i].setUpdated(false);
          //   if (drawingWith == -1) {
          //     arr2d[mx + j][my + i].setLifeTime(flameLife + randInt(-15, 0));
          //   } else if (drawingWith == -2) {
          //     arr2d[mx + j][my + i].setLifeTime(smokeLife + randInt(-15, 0));
          //   }
          // }
          
          
        }
      }
    }
  }

  direction = randInt(0, 1);
  
  // Compute a flammability matrix that each fire particle uses,
  // because doing random spreads for each particle individually
  // caused far too large of a performance hit.
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (j == 0) {
        flammabilityMatrix[i][j] = randFloat(0.1, 2.0);
      } else if (j == 1) {
        flammabilityMatrix[i][j] = randFloat(0.1, 0.5);
      } else {
        flammabilityMatrix[i][j] = randFloat(0, 0.24);
      }
    }
  }
  flammabilityTime = 9 + randInt(0, 9);
  // print(flammabilityMatrix)
  // print(direction)
  if (evenFrame) {
    updateArr2d();
  } else {
    updateArr2dRight();
  }
  
  
  // pixelBuffer = createImage(arrWidth, arrHeight);
  // pixelBuffer = createImage(arrWidth, arrHeight);
  // pixelBuffer.loadPixels();
  // let d = pixelDensity();
  // const 

  // let numParticles = 0;
  for (var y = 0; y < arrHeight; ++y) {
      for (var x = 0; x < arrWidth; ++x) {
        // var c;
        
        // const particle = arr2d[x][y];
        // const particleId = particle.getID();
        // gameImagedata32[x + size*y] = BACKGROUND;
        // // ++numParticles;
// gameImagedata32[x + size*y] = arr2d[x][y].col;

        // arr2d[x][y].setUpdated(false);
        // if (getID(x+size*y) != 0 && evenFrame) {
        //   // console.log(getUpdated(x+size*y));
        //   console.log(pixelView[x + size*y]);
        //   setUpdated(false, x + size*y);
        //   console.log(pixelView[x+size*y])
        //   console.log();
        //   // console.log(getUpdated(x+size*y));
        // }
        setNotUpdated(x + size*y);
      }
  }

  /*
   * Always update the user stroke, regardless of whether
   * we're updating the gamestate. This results in smooth
   * drawing regardless of the current set FPS.
   */
  // updateUserStroke();

  // updateGame();

  drawCanvas();
  evenFrame = !evenFrame;
  // console.log(evenFrame);
}

var __next_elem_idx = 0;
function __inGameColor(r, g, b) {
  const alpha = 0xff000000;
  r = r & 0xfc;
  g = g & 0xfc;
  b = b & 0xfc;

  const r_idx = __next_elem_idx & 0b11;
  const g_idx = (__next_elem_idx & 0b1100) >>> 2;
  const b_idx = (__next_elem_idx & 0b110000) >>> 4;

  r += r_idx;
  g += g_idx;
  b += b_idx;

  __next_elem_idx++;

  return alpha + (b << 16) + (g << 8) + r;
}

/* Order here MUST match order in elements and elementActions arrays */
// const WALL = __inGameColor(127, 127, 127);
const SMOKE = __inGameColor(170, 170, 170);
const FIRE = __inGameColor(255, 0, 10);
const BACKGROUND = __inGameColor(0, 0, 0);
const SAND = __inGameColor(223, 193, 99);
const WATER = __inGameColor(0, 10, 255);
const WOOD = __inGameColor(70, 35, 0);


// Particle types are:
//  -2 -> Smoke
//  -1 -> Fire
//   0 -> Empty space
//   1 -> Sand
//   2 -> Water
//   3 -> Wood
class Pixel {

  // Only run at startup so conditional is fine?
  constructor(inputId, inputUpdate, particleLifeTime) {
    this.id = inputId;
    this.hasUpdated = inputUpdate;
    this.lifeTime = particleLifeTime;
    // this.color = getColor(inputId);
    
    this.col = BACKGROUND;
    if (inputId != 0) {
      this.col = getColor(inputId);
    }

    // pixelView[]
    
  }
  
  getUpdated() { return this.hasUpdated; }
  setUpdated(status) { this.hasUpdated = status; }
  
  getID() { return this.id; }
  setID(newID) { 
    this.id = newID;
    // this.color = getColor(newID);
    // console.log(this.color)
    // const [r, g, b, _] = this.color.levels;
    
    // console.log(this.color.levels)
    // this.col = 0xff000000 + (b << 16) + (g << 8) + r;
    this.col = getColor(this.id);
  }

  swap(other) {
    [this.id, other.id] = [other.id, this.id];
    // [this.color, other.color] = [other.color, this.color];
    [this.lifeTime, other.lifeTime] = [other.lifeTime, this.lifeTime];
    this.hasUpdated = other.hasUpdated = true;
    this.col = this.col ^ other.col;
    other.col = this.col ^ other.col;
    this.col = this.col ^ other.col;
  }

  updateColor() {
    // if (this.id < 0) {
    //   // NEEDS FIXING AND GENERALIZING
    //   this.col = colors[this.lifeTime + ((this.id*-1)+2)*(flameLife+1)];
    // }
    
    // if (this.id == -1) {
    //   this.col = colorTable.fire[this.lifeTime];

    //   // let r, g, b, a = this.color.values;
    //   // this.col = 0xff000000 + + (b << 16) + (g << 8) + r;
    //   // console.log(this.lifeTime)
    //   // console.log(flameLife)
    //   // console.log(this.color)

    //   // const [r, g, b, _] = this.color.levels;
    //   // this.col = 0xff000000 + (b << 16) + (g << 8) + r;
    // } else {
    //   this.col = colorTable.smoke[this.lifeTime];
    //   // let r, g, b, a = this.color.values;
    //   // this.col = 0xff000000 + + (b << 16) + (g << 8) + r;

    //   // const [r, g, b, _] = this.color.levels;
    //   // this.col = 0xff000000 + (b << 16) + (g << 8) + r;
    // }
    
  }
  
  getLifeTime() { return this.lifeTime; }
  setLifeTime(time) { this.lifeTime = time; }
  incrementTime() { this.lifeTime--; }
  
  setEmpty() {
    this.id = 0;
    this.hasUpdated = 0;
    this.lifeTime = 0;
    this.col = BACKGROUND;
  }
}

// function swap(first, second) {
//   [first.id, second.id] = [second.id, first.id];
//   // [first.color, second.color] = [second.color, first.color];
//   [first.lifeTime, second.lifeTime] = [second.lifeTime, first.lifeTime];
//   first.hasUpdated = second.hasUpdated = true;
//   first.col = first.col ^ second.col;
//   second.col = first.col ^ second.col;
//   first.col = first.col ^ second.col;
// }


let arr2d;
let arrWidth = 140;
let arrHeight = 140;

let graphicsSetting = 3; // Medium = 140x140
let flameLife = 160;
let smokeLife = 150;
let UItextSize = 11;

let evenFrame = true;

window.loadGraphicsSetting = function(level) {
  if (level == 0) {
    // Graphics setting = low
    arrWidth = 100;
    arrHeight = 100;
    flameLife = 120;
    smokeLife = 105;
    UItextSize = 9;
  } else if (level == 1) {
    // Graphics setting = medium
    arrWidth = 140;
    arrHeight = 140;
    flameLife = 160;
    smokeLife = 150;
    UItextSize = 11;
  } else if (level == 2) {
    // Graphics setting = High
    arrWidth = 180;
    arrHeight = 180;
    flameLife = 210;
    smokeLife = 190;
    UItextSize = 12;
  } else if (level == 3) {
    // Graphics setting = Ultra
    arrWidth = size;
    arrHeight = size;
    flameLife = 240;
    smokeLife = 210;
    UItextSize = 13;
  }
  // brushSize = 2;
  generateColors();
  buildArray();
}

let pixelBuffer;

function buildArray() {
  arr2d = new Array(arrWidth);

  for (let i = 0; i < arr2d.length; i++) {
    arr2d[i] = new Array(arrHeight);
  }
  
  for (let i = 0; i < arrWidth; i++) {
    for (let j = 0; j < arrHeight; j++) {
      arr2d[i][j] = new Pixel(0, false, 0);
    }
  }
}

function setup() {
  // createCanvas(2.5*arrWidth, arrHeight);
  loadGraphicsSetting(graphicsSetting);
  // generateColors();
  buildArray()
  // pixelBuffer = createImage(arrWidth, arrHeight);
  // pixelBuffer = createImage(arrWidth, arrHeight);
  // pixelBuffer.loadPixels();

  // background(220);
  // for (let i = 0; i < 50; i++) {
  //   arr2d[i][0].setID(1);
  // }
}

function updateArr2d() {
  let index = 0;

  for (let y = (arrHeight - 1); y >= 0; --y) {
    for (let x = 0; x < arrWidth; ++x) {
      // particle = arr2d[x][y];
      index = x + arrHeight*y;

      if (getUpdated(index)) {
        continue;
      }
      
      // console.log(getID(index)-_BACKGROUND+offset);
      functions[direction][getID(index)-_BACKGROUND+offset](x,y);
      
    }
  }
}

function updateArr2dRight() {
  let index = 0;
  for (let y = (arrHeight - 1); y >= 0; --y) {
    for (let x = arrWidth-1; x >= 0; --x) {
      index = x + arrHeight*y;

      if (getUpdated(index)) {
        continue;
      }
      
      functions[direction][getID(index)-_BACKGROUND+offset](x,y);
      
    }
  }
}

let direction = 0;
let brushSize = 2;
let drawingWith = _SAND;
// let numParticles = 0;

let flammabilityMatrix = new Array(3);
for(let i = 0; i < 3; i++) {
  flammabilityMatrix[i] = new Array(3);
}
// 1 0 1
// 1 0 0
// 0 1 0
// etc
let flammabilityTime;

var drawing = false;
