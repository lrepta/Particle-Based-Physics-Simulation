const size = 400;

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
    gameImagedata32[i] = 0;
    // saveGameImagedata32[i] = 0;
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

function mainLoop(now) {
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

          // INEFFICIENT, REWRITE
          if (drawingWith == 0) {
            arr2d[mx + j][my+ i].setEmpty();
          } else if (arr2d[mx + j][my + i].getID() == 0 || drawingWith == 0) {
            arr2d[mx + j][my+ i].setID(drawingWith);
            // arr2d[mx + j][my+ i].setEmpty();
            arr2d[mx + j][my + i].setUpdated(false);
            if (drawingWith == -1) {
              arr2d[mx + j][my + i].setLifeTime(flameLife + randInt(-15, 0));
            } else if (drawingWith == -2) {
              arr2d[mx + j][my + i].setLifeTime(smokeLife + randInt(-15, 0));
            }
          }
          
          
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
        var c;
        
        // const particle = arr2d[x][y];
        // const particleId = particle.getID();
        // gameImagedata32[x + size*y] = BACKGROUND;
        // // ++numParticles;
        gameImagedata32[x + size*y] = arr2d[x][y].col;
        // switch(particleId) {
        //   case 1: // Sand
        //   //  c = particle.color;
        //     // pixelBuffer.pixels[x + 200*y] = particle.col & 0x000000ff;
        //     // pixelBuffer.pixels[2*(x + 200*y)] = particle.col & 0x000000ff;
        //     // pixelBuffer.pixels[3*(x + 200*y)] = particle.col & 0x000000ff;
        //     // pixelBuffer.pixels[4*(x + 200*y)] = particle.col & 0x000000ff;
        //     // pixelBuffer.pixels[x + 200*y + 1] = (particle.col & 0x0000ff00) >>> 8;
        //     // pixelBuffer.pixels[x + 200*y + 2] = (particle.col & 0x00ff0000) >>> 16;
        //     // pixelBuffer.pixels[x + 200*y + 3] = 0xff;
        //     numParticles++;
        //     gameImagedata32[x + size*y] = particle.col;
        //     break;
        //   case 2: // Water
        //     // c = color(20, 20, 150);
        //   //  c = particle.color;


        //     // pixelBuffer.pixels[x + 200*y] = particle.col;
        //     numParticles++;
        //     gameImagedata32[x + size*y] = particle.col;
        //     break;
        //   case 3: // Wood
        //     // c = color(70, 35, 0);
        //   //  c = particle.color;


        //     // pixelBuffer.pixels[x + 200*y] = particle.col;
        //     numParticles++;
        //     gameImagedata32[x + size*y] = particle.col;
        //     break;
        //   case -1: // Fire
        //     // lifeLeft = particle.getLifeTime();
        //     // lifeLeft = lifeLeft/2;
        //     // c = particle.color;
        //     // c.setRed(254+lifeLeft);
        //     // c.setGreen(110+lifeLeft);
        //     particle.updateColor();
        //   //  c = particle.color;
        //     // Fire particles get more red as they cool
        //     // (yellow -> orange -> red as life left decreases)
        //     // c = color(254+lifeLeft, 110+lifeLeft, 0);


        //     // pixelBuffer.pixels[x + 200*y] = particle.col;
        //     numParticles++;
        //     gameImagedata32[x + size*y] = particle.col;
        //     break;
        //   case -2: // Smoke
        //     particle.updateColor();
        //   //  c = particle.color;
        //     // lifeLeft = -particle.getLifeTime();
        //     // lifeLeft = lifeLeft/2;
        //     // c = particle.color;
        //     // c.setRed(120+lifeLeft);
        //     // c.setGreen(120+lifeLeft);
        //     // c.setBlue(120+lifeLeft);
        //     // Smoke gets lighter the closer it is to dissipating
        //     // (lifeLeft is negative)
        //     // c = color(120+lifeLeft, 120+lifeLeft, 120+lifeLeft);


        //     // pixelBuffer.pixels[4*(x + 200*y)] = particle.col;
        //     numParticles++;
        //     gameImagedata32[x + size*y] = particle.col;
        //     break;
        // }

        arr2d[x][y].setUpdated(false);
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

const noOp = function(x,y){};
const offset = 2;
let functionsLeft = new Array();
functionsLeft.push(updateSmoke, updateFire, noOp, updateSand, updateWater, noOp);

let functionsRight = new Array();
functionsRight.push(updateSmokeRight, updateFireRight, noOp, updateSandRight, updateWaterRight, noOp);


const functions = new Array(functionsLeft, functionsRight);

// Graphics Settings:

/* Graphics settings determine both the side of the
   underlying 2d array, as well as the lifetimes
   of transient particles, like fire and smoke. */

// Low 100x100
// Medium 140x140
// High 180x180
// Ultra 200x200

// Large performance increase
// p5.disableFriendlyErrors = true; // disables FES


let colorTable = {};
let colorIndex = 0;


function getColor(id) {
  let color;
  color = colors[colorIndex + (id-1)*(flameLife+1)];
  // switch(id) {
  //     case 1: // sand
  //       color = colorTable.sand[colorIndex];
  //       break;
  //     case 2: // water
  //       color = colorTable.water[colorIndex];
  //       break;
  //     case 3: // wood
  //       color = colorTable.wood[colorIndex];
  //       break;
  //     case -1: // fire
  //       color = colorTable.fire[colorIndex];
  //       break;
  //     case -2: // smoke
  //       color = colorTable.wood[colorIndex];
  //       break;
  //     default:
  //       break;
  // }
  colorIndex++;
  colorIndex = colorIndex * (colorIndex < flameLife);
  
  return color;
}

let colors;

function generateColors() {
  // colorTable.sand = [];
  // colorTable.water = [];
  // colorTable.wood = [];
  // colorTable.fire = [];
  // colorTable.smoke = [];

  const numParticles = 5;
  colors = new Int32Array(5 * (flameLife+1));

  const a = 0xff000000;

  for (let i = 0; i < flameLife+1; i++) {
    // abgr
    // colorTable.sand.push()
    // colorTable

    // sand
    colors[i + 0*(flameLife+1)] = a + (0+randInt(0,5) << 16) + ((120+randInt(-10, 0)) << 8) + (170+randInt(-10, 40));
    // water
    colors[i + 1*(flameLife+1)] = a + (150+randInt(-5,15) << 16) + ((20+randInt(-5, 5)) << 8) + (20+randInt(-5, 5));
    // wood
    colors[i + 2*(flameLife+1)] = a + (0+randInt(0,10) << 16) + ((35+randInt(-5, 5)) << 8) + (70+randInt(-5, 5));
    // fire
    colors[i + 3*(flameLife+1)] = a + (0 << 16) + (i.map(0,flameLife,60,255) << 8) + (i.map(0,flameLife,200,255));
    const smokeVal = i.map(0,flameLife,0,120);
    colors[i + 4*(flameLife+1)] = a + ((220-smokeVal) << 16) + ((220-smokeVal) << 8) + ((220-smokeVal));

    // colorTable.sand.push(color(170 + (randInt(-10, 40), 120 + randInt(-10, 0), 0 + randInt(0, 5)));
    // colorTable.water.push(color(20 + randInt(-5,5), 20 + randInt(-5,5), 150 + randInt(-5,15)));
    // colorTable.wood.push(color(70 + randInt(-5,5), 35 + randInt(-5,5), 0 + randInt(0,10)));
    // colorTable.fire.push(color(i.map(0, flameLife, 200, 255), i.map(0, flameLife, 60, 255), 0));
    // let smokeVal = i.map(0, flameLife, 0, 120);
    // colorTable.smoke.push(color(220-smokeVal, 220-smokeVal, 220-smokeVal));
  }
}

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

function swap(first, second) {
  [first.id, second.id] = [second.id, first.id];
  // [first.color, second.color] = [second.color, first.color];
  [first.lifeTime, second.lifeTime] = [second.lifeTime, first.lifeTime];
  first.hasUpdated = second.hasUpdated = true;
  first.col = first.col ^ second.col;
  second.col = first.col ^ second.col;
  first.col = first.col ^ second.col;
}


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

function updateSand(xPos, yPos) {
  const center = arr2d[xPos][yPos];
  if (center.hasUpdated == true || yPos == arrHeight - 1) {
    return;
  }
  const down = arr2d[xPos][yPos + 1];
  const downLeft = arr2d[xPos - 1]?.[yPos + 1] ?? 0;
  const downRight = arr2d[xPos + 1]?.[yPos + 1] ?? 0;

// Down, through empty space, fire, or smoke
  if (down.getID() <= 0) {
    // down.setID(-2);
    swap(center, down);

  // Down through water
  } else if (down.getID() == 2 && !down.hasUpdated) {
    swap(center, down);

  // Down-Left
  } else if (downLeft && downLeft.getID() == 0) {
    swap(center, downLeft);

  // Down-Right
  } else if (downRight && downRight.getID() == 0) {
    swap(center, downRight);
  }
}

function updateSandRight(xPos, yPos) {
  const center = arr2d[xPos][yPos];
  if (center.hasUpdated || yPos == arrHeight - 1) {
    return;
  }
  const down = arr2d[xPos][yPos + 1];
  const downLeft = arr2d[xPos - 1]?.[yPos + 1] ?? 0;
  const downRight = arr2d[xPos + 1]?.[yPos + 1] ?? 0;

// Down, through empty space, fire, or smoke
  if (down.getID() <= 0) {
    // down.setID(-2);
    swap(center, down);

  // Down through water
  } else if (down.getID() == 2 && !down.hasUpdated) {
    swap(center, down);

  // Down-Right
  } else if (downRight && downRight.getID() == 0) {
    swap(center, downRight);

  // Down-Left
  } else if (downLeft && downLeft.getID() == 0) {
    swap(center, downLeft);
  }
}

function updateWater(xPos, yPos) {
  const center = arr2d[xPos][yPos];
  if (center.hasUpdated == true) {
    return;
  }
  
  const down = arr2d[xPos]?.[yPos + 1] ?? 0;
  const downLeft = arr2d[xPos - 1]?.[yPos + 1] ?? 0;
  const downRight = arr2d[xPos + 1]?.[yPos + 1] ?? 0;
  const left = arr2d[xPos - 1]?.[yPos] ?? 0;
  const right = arr2d[xPos + 1]?.[yPos] ?? 0;

  // Down, through empty space, fire, or smoke
  if (down && down.getID() <= 0) {
    if (down.getID() == -1) {
      down.setID(-2);
      down.setLifeTime(smokeLife/3);
    }
    swap(center, down);
    
  // Down-Left
  } else if (downLeft && downLeft.getID() == 0) {
    swap(center, downLeft);

  // Down-Right
  } else if (downRight && downRight.getID() == 0) {
    swap(center, downRight);

  // Left
  } else if (left && left.getID() <= 0) {
    if (left.getID() == -1) {
      left.setID(-2);
      left.setLifeTime(smokeLife/3);
    }
    swap(center, left);

  // Right
  } else if (right && right.getID() == 0) {
    if (right.getID() == -1) {
      right.setID(-2);
      right.setLifeTime(smokeLife/3);
    }
    swap(center, right);
  }
}

function updateWaterRight(xPos, yPos) {
  const center = arr2d[xPos][yPos];
  if (center.hasUpdated == true) {
    return;
  }

  const down = arr2d[xPos]?.[yPos + 1] ?? 0;
  const downLeft = arr2d[xPos - 1]?.[yPos + 1] ?? 0;
  const downRight = arr2d[xPos + 1]?.[yPos + 1] ?? 0;
  const left = arr2d[xPos - 1]?.[yPos] ?? 0;
  const right = arr2d[xPos + 1]?.[yPos] ?? 0;

  // Down, through empty space, fire, or smoke
  if (down && down.getID() <= 0) {
    if (down.getID() == -1) {
      down.setID(-2);
      down.setLifeTime(smokeLife/3);
    }
    swap(center, down);

  // Down-Right
  } else if (downRight && downRight.getID() < 0) {
    swap(center, downRight);

  // Down-Left
  } else if (downLeft && downLeft.getID() == 0) {
    swap(center, downLeft);

  // Right
  } else if (right && right.getID() == 0) {
    if (right.getID() == -1) {
      right.setID(-2);
      right.setLifeTime(smokeLife/3);
    }
    swap(center, right);

  // Left
  } else if (left && left.getID() == 0) {
    if (left.getID() == -1) {
      left.setID(-2);
      left.setLifeTime(smokeLife/3);
    }
    swap(center, left);
  }
}

function updateFire(xPos, yPos) {
  const particle = arr2d[xPos][yPos];
  // const bottomBoundary = (yPos != arrHeight-1) * 2;
  // const topBoundary = (yPos != 0) * -1;
  // const leftBoundary = (xPos != 0) * -1;
  // const rightBoundary = ()

  if (particle.hasUpdated == true) {
    return;
  }
  
  particle.incrementTime();
  particle.col = colors[particle.lifeTime + ((particle.id*-1)+2)*(flameLife+1)];
  
  // Fire hasn't spread to any new particle in its lifetime, exstinguishes
  if (particle.getLifeTime() < 0) {
    particle.setEmpty();
    return;
  }
  
  let particlesBurnt = 0;
  let smokeProduced = 0;
  // Burn any flammable particles around the fire particle
  for (let i = -1; i < 2; i++) {
    for(let j = -1; j < 2; j++) {
      // randomSpread = Math.floor(random(0, 15));
      // if (randomSpread != 14) {
      //   continue;
      // }
      if (xPos + i > -1 && xPos + i < arrWidth &&
          yPos + j > -1 && yPos + j < arrHeight &&
          particlesBurnt < 3) {
        
        if (arr2d[xPos+i][yPos + j].getID() == 3 &&
            (flammabilityMatrix[i+1][j+1] > 0.225) && arr2d[xPos][yPos].getLifeTime() % flammabilityTime == 0) {
          arr2d[xPos+i][yPos + j].setID(-1);
          arr2d[xPos+i][yPos + j].setLifeTime(flameLife);
          arr2d[xPos+i][yPos + j].setUpdated(true);

          // arr2d[xPos][yPos].setEmpty();
          // // Replace the former fire particle with smoke particle
          // arr2d[xPos][yPos].setID(-2);
          // arr2d[xPos][yPos].setLifeTime(240);
          // arr2d[xPos][yPos].setUpdated(true);
          particlesBurnt++;
          // Break here if I want it to only spread to 1 new particle
        } else if (arr2d[xPos+i][yPos + j].getID() == 0 &&
                   smokeProduced < 4) {
            if (particle.getLifeTime() % 24 == 0 ||
            particle.getLifeTime() % 30 == 0) {
              arr2d[xPos+i][yPos + j].setEmpty();
              arr2d[xPos+i][yPos + j].setID(-2);
              arr2d[xPos+i][yPos + j].setUpdated(true);
              // Shorter lifetime smoke for not consuming particle
              arr2d[xPos+i][yPos + j].setLifeTime(smokeLife-20);
              smokeProduced++;
            }
        }
      }
    }
  }
  
  // Fire only falls Down
  if (yPos != arrHeight - 1 && arr2d[xPos][yPos + 1].getID() == 0) {
    swap(particle, arr2d[xPos][yPos + 1]);

  // Fire can fall through smoke
  } else if (yPos != arrHeight - 1 && arr2d[xPos][yPos + 1].getID() == -2) {
    swap(particle, arr2d[xPos][yPos + 1]);

  // If fire lands on water, exstinguish and create steam (smoke)
  } else if (yPos != arrHeight - 1 && arr2d[xPos][yPos + 1].getID() == 2) {
    particle.setEmpty();
    particle.setID(-2);
    particle.setLifeTime(smokeLife/3);
  }
}

function updateFireRight(xPos, yPos) {
  const particle = arr2d[xPos][yPos];
  
  if (particle.hasUpdated == true) {
    return;
  }
  
  particle.incrementTime();
  particle.col = colors[particle.lifeTime + ((particle.id*-1)+2)*(flameLife+1)];
  
  // Fire hasn't spread to any new particle in it's lifetime, exstinguishes
  if (particle.getLifeTime() < 0) {
    particle.setEmpty();
    return;
  }
  
  let particlesBurnt = 0;
  let smokeProduced = 0;
  // Burn any flammable particles around the fire particle
  for (let i = 1; i > -2; i--) {
    for(let j = 1; j > -2; j--) {
      if (xPos + i > -1 && xPos + i < arrWidth &&
          yPos + j > -1 && yPos + j < arrHeight &&
          particlesBurnt < 3) {
        
        // randomSpread = Math.floor(random(0, 15));
        // if (randomSpread != 14) {
        //   continue;
        // }
        
        if (arr2d[xPos+i][yPos + j].getID() == 3 &&
            (flammabilityMatrix[i+1][j+1] > 0.225) && particle.getLifeTime() % flammabilityTime == 0) {
          arr2d[xPos+i][yPos + j].setID(-1);
          arr2d[xPos+i][yPos + j].setLifeTime(flameLife);
          arr2d[xPos+i][yPos + j].setUpdated(true);

          // arr2d[xPos][yPos].setEmpty();
          // // Replace the former fire particle with smoke particle
          // arr2d[xPos][yPos].setID(-2);
          // arr2d[xPos][yPos].setLifeTime(240);
          // arr2d[xPos][yPos].setUpdated(true);
          particlesBurnt++;
          // Break here if I want it to only spread to 1 new particle
        } else if (arr2d[xPos+i][yPos + j].getID() == 0 &&
                   smokeProduced < 4) {
            if (particle.getLifeTime() % 24 == 0 ||
            particle.getLifeTime() % 30 == 0) {
              arr2d[xPos+i][yPos + j].setEmpty();
              arr2d[xPos+i][yPos + j].setID(-2);
              arr2d[xPos+i][yPos + j].setUpdated(true);
              // Shorter lifetime smoke for not consuming particle
              arr2d[xPos+i][yPos + j].setLifeTime(smokeLife-20);
              smokeProduced++;
            }
        }
      }
    }
  }
  
  // Fire only falls Down
  if (yPos != arrHeight - 1 && arr2d[xPos][yPos + 1].getID() == 0) {
    swap(particle, arr2d[xPos][yPos + 1]);

  // Fire can fall through smoke
  } else if (yPos != arrHeight - 1 && arr2d[xPos][yPos + 1].getID() == -2) {
    swap(particle, arr2d[xPos][yPos + 1]);

  // If fire lands on water, exstinguish and create steam (smoke)
  } else if (yPos != arrHeight - 1 && arr2d[xPos][yPos + 1].getID() == 2) {
    particle.setEmpty();
    particle.setID(-2);
    particle.setLifeTime(smokeLife/3);
  }
}

function updateSmoke(xPos, yPos) {
  const particle = arr2d[xPos][yPos];

  if (particle.hasUpdated == true) {
    return;
  }
  
  particle.incrementTime();
  particle.col = colors[particle.lifeTime + ((particle.id*-1)+2)*(flameLife+1)];
  
  // If smoke is around for more than it's lifetime, it dissipates
  if (particle.getLifeTime() < 0) {
    particle.setEmpty();
    return;
  }
  if (yPos == 0) {
    arr2d[xPos][yPos].setUpdated(true);
    return;
  }

  // Up
  if (arr2d[xPos][yPos - 1].getID() == 0) {
    swap(arr2d[xPos][yPos], arr2d[xPos][yPos - 1]);

  // Up-Left
  } else if (xPos != 0 && arr2d[xPos - 1][yPos - 1].getID() == 0) {
    swap(arr2d[xPos][yPos], arr2d[xPos - 1][yPos - 1]);

  // Up-Right
  } else if (xPos != arrWidth - 1 && arr2d[xPos + 1][yPos - 1].getID() == 0) {
    swap(arr2d[xPos][yPos], arr2d[xPos + 1][yPos - 1]);

  // Left
  } else if (xPos != 0 && arr2d[xPos - 1][yPos].getID() == 0) {
    swap(arr2d[xPos][yPos], arr2d[xPos - 1][yPos]);

  // Right
  } else if (xPos != arrWidth - 1 && arr2d[xPos + 1][yPos].getID() == 0) {
    swap(arr2d[xPos][yPos], arr2d[xPos + 1][yPos]);
  }
}

function updateSmokeRight(xPos, yPos) {
  const particle = arr2d[xPos][yPos];

  if (arr2d[xPos][yPos].hasUpdated == true) {
    return;
  }
  
  arr2d[xPos][yPos].incrementTime();
  particle.col = colors[particle.lifeTime + ((particle.id*-1)+2)*(flameLife+1)];
  
  // If smoke is around for more than it's lifetime, it dissipates
  if (arr2d[xPos][yPos].getLifeTime() < 0) {
    arr2d[xPos][yPos].setEmpty();
    return;
  }
  if (yPos == 0) {
    arr2d[xPos][yPos].setUpdated(true);
    return;
  }

  // Up
  if (arr2d[xPos][yPos - 1].getID() == 0) {
    swap(arr2d[xPos][yPos], arr2d[xPos][yPos - 1]);

  // Up-Right
  } else if (xPos != arrWidth - 1 && arr2d[xPos + 1][yPos - 1].getID() == 0) {
    swap(arr2d[xPos][yPos], arr2d[xPos + 1][yPos - 1]);

  // Up-left
  } else if (xPos != 0 && arr2d[xPos - 1][yPos - 1].getID() == 0) {
    swap(arr2d[xPos][yPos], arr2d[xPos - 1][yPos - 1]);

  // Right
  } else if (xPos != arrWidth - 1 && arr2d[xPos + 1][yPos].getID() == 0) {
    swap(arr2d[xPos][yPos], arr2d[xPos + 1][yPos]);

  // Left
  } else if (xPos != 0 && arr2d[xPos - 1][yPos].getID() == 0) {
    swap(arr2d[xPos][yPos], arr2d[xPos - 1][yPos]);
  }
}

function updateArr2d() {
  // print("Entered")
  
  let particle = arr2d[0][0];
  // console.log(particle);
  // console.log(functions[direction][particle.id+offset]);

  for (let y = (arrHeight - 1); y >= 0; --y) {
    // print("y loop")
    for (let x = 0; x < arrWidth; ++x) {
      particle = arr2d[x][y];
      // if (arr2d[x][y].getID()) {
      //   print("sand")
      // }
      // print("x loop")
      if (particle.hasUpdated) {
        continue;
      }
      // let currPixelID = particle.getID();
      // print("CurrPixelID is")
      
      functions[direction][particle.id+offset](x,y);
      // console.log(functions[direction]);
      // console.log(functions[direction][particle.id+offset]);
      // if (direction) {
      //   switch(currPixelID) {
      //     case -2:
      //       updateSmoke(x, y);
      //       break;
      //     case -1:
      //       updateFire(x, y);
      //       break;
      //     case 1:
      //       updateSand(x, y);
      //       break;
      //     case 2:
      //       updateWater(x, y);
      //       break;
      //     case 0:
      //       break;
      //       // Do nothing for empty space;
      //   }
      // } else {
      //   switch(currPixelID) {
      //     case -2:
      //       updateSmokeRight(x, y);
      //       break;
      //     case -1:
      //       updateFireRight(x, y);
      //       break;
      //     case 1:
      //       updateSandRight(x, y);
      //       break;
      //     case 2:
      //       updateWaterRight(x, y);
      //       break;
      //     case 0:
      //       break;
      //       // Do nothing for empty space;
      //   }
      // }
      
    }
  }
  // makePixelBuffer();
}

function updateArr2dRight() {
  // print("Entered")
  let particle = arr2d[0][0];
  for (let y = (arrHeight - 1); y >= 0; --y) {
    // print("y loop")
    for (let x = arrWidth-1; x >= 0; --x) {
      particle = arr2d[x][y];

      if (particle.hasUpdated) {
        continue;
      }
      // let currPixelID = arr2d[x][y].getID();

      functions[direction][particle.id+offset](x,y);
      
      // if (direction) {
      //   switch(currPixelID) {
      //     case -2:
      //       updateSmoke(x, y);
      //       break;
      //     case -1:
      //       updateFire(x, y);
      //       break;
      //     case 1:
      //       updateSand(x, y);
      //       break;
      //     case 2:
      //       updateWater(x, y);
      //       break;
      //     case 0:
      //       break;
      //   }
      // } else {
      //   switch(currPixelID) {
      //     case -2:
      //       updateSmokeRight(x, y);
      //       break;
      //     case -1:
      //       updateFireRight(x, y);
      //       break;
      //     case 1:
      //       updateSandRight(x, y);
      //       break;
      //     case 2:
      //       updateWaterRight(x, y);
      //       break;
      //     case 0:
      //       break;
      //   }
      // }
      
    }
  }
}

let direction = 0;
let brushSize = 2;
let drawingWith = 1;
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

// function draw() {
//   background(220);
//   strokeWeight(5);
//   line(arrWidth + 3, 0, arrWidth + 3, arrHeight)
//   // if (mouseIsPressed) {
//   //   if (mouseX < arrWidth && mouseX > 0 &&
//   //       mouseY < arrHeight && mouseY > 0) {
//   //     for (let i = -brushSize; i < brushSize; i++) {
//   //       if (mouseY + i > arrHeight - 1 || mouseY + i < 0) {
//   //         continue;
//   //       }
//   //       for (let j = -brushSize; j < brushSize; j++) {
//   //         if (mouseX + j > arrWidth - 1 || mouseX + j < 0) {
//   //           continue;
//   //         }
//   //         if(drawingWith != 3 && drawingWith != 0) {
//   //           let randomSpread = randInt(0, 6);
//   //           if (randomSpread != 5) {
//   //             continue;
//   //           }
//   //         }
          
//   //         if (arr2d[mouseX + j][mouseY + i].getID() == 0 ||
//   //            drawingWith == 0) {
//   //           arr2d[mouseX + j][mouseY+ i].setID(drawingWith);
//   //           arr2d[mouseX + j][mouseY + i].setUpdated(false);
//   //           if (drawingWith == -1) {
//   //             arr2d[mouseX + j][mouseY + i].setLifeTime(flameLife + randInt(-15, 0));
//   //           } else if (drawingWith == -2) {
//   //             arr2d[mouseX + j][mouseY + i].setLifeTime(smokeLife + randInt(-15, 0));
//   //           }
//   //         }
//   //       }
//   //     }
//   //   }
//   // }
  

//   // pixelBuffer.updatePixels();
//   // console.log(pixelBuffer)

//   noSmooth();
//   // image(pixelBuffer, 0, 0, arrWidth, arrHeight);

  
//   textSize(UItextSize);
//   text("Framerate:" + round(frameRate()) + " fps", 1.1*arrWidth, arrHeight/10);
//   text("Particle #:" + numParticles, 1.1*arrWidth, arrHeight/5);
//   // textSize(14);
//   text("S: Sand", 1.1*arrWidth, height-7*UItextSize);
//   text("W: Water", 1.1*arrWidth, height-6*UItextSize);
//   text("F: Fire", 1.1*arrWidth, height-5*UItextSize);
//   text("M: Smoke", 1.1*arrWidth, height-4*UItextSize);
//   text("D: Wood", 1.1*arrWidth, height-3*UItextSize);
//   text("E: Erase", 1.1*arrWidth, height-2*UItextSize);
//   // textSize(11);
//   text("P: Increase Brush Size", 1.1*arrWidth, height-1*UItextSize);
//   text("L: Decrease Brush Size", 1.1*arrWidth, height-1);
//   // print(evenFrame);
  
  
//   textSize(UItextSize - 1);
//   text("Graphics\n Setting:", width*0.87, arrHeight*0.08);
//   textSize(UItextSize);
//   // push();
//   // Low button
//   fill(255)
//   strokeWeight(2)
//   if (graphicsSetting == 0) {
//     fill('cyan');
//   } else if (mouseX < (width) && mouseX > (width*0.87) ) {
//     if (mouseY < (arrHeight*0.40) && mouseY > (arrHeight*0.20)) {
//       fill('cyan');
//     }
//   }
//   rect(width*0.87, arrHeight*0.20, arrWidth*0.33, arrHeight*0.20);
//   // Medium button
//   fill(255)
//   if (graphicsSetting == 1) {
//     fill('cyan');
//   } else if (mouseX < (width) && mouseX > (width*0.87) ) {
//     if (mouseY < (arrHeight*0.60) && mouseY > (arrHeight*0.40)) {
//       fill('cyan');
//     }
//   }
//   rect(width*0.87, arrHeight*0.40, arrWidth*0.33, arrHeight*0.20);
//   // High button
//   fill(255)
//   if (graphicsSetting == 2) {
//     fill('cyan');
//   } else if (mouseX < (width) && mouseX > (width*0.87) ) {
//     if (mouseY < (arrHeight*0.80) && mouseY > (arrHeight*0.60)) {
//       fill('cyan');
//     }
//   }
//   rect(width*0.87, arrHeight*0.60, arrWidth*0.33, arrHeight*0.20);
//   // Ultra button
//   fill(255)
//   if (graphicsSetting == 3) {
//     fill('cyan');
//   } else if (mouseX < (width) && mouseX > (width*0.87) ) {
//     if (mouseY < (arrHeight) && mouseY > (arrHeight*0.80)) {
//       fill('cyan');
//     }
//   }
//   rect(width*0.87, arrHeight*0.80, arrWidth*0.33, arrHeight*0.20);
//   fill(0)
//   // pop();
  
//   text("Low", width*0.91, arrHeight*0.30);
//   text("Medium", width*0.885, arrHeight*0.50);
//   text("High", width*0.91, arrHeight*0.70);
//   text("Ultra", width*0.91, arrHeight*0.90);
// }

// function mouseClicked() {
//   if (mouseX < (width) && mouseX > (width*0.87) &&
//       mouseY < (arrHeight*0.40) && mouseY > (arrHeight*0.20) ) {
//     graphicsSetting = 0;
//     loadGraphicsSetting(graphicsSetting);
//     createCanvas(2.5*arrWidth, arrHeight);
//     loadGraphicsSetting(graphicsSetting);
//     buildArray();
//     pixelBuffer = createImage(arrWidth, arrHeight);

//     background(220);
//   }
//   else if (mouseX < (width) && mouseX > (width*0.87) &&
//       mouseY < (arrHeight*0.60) && mouseY > (arrHeight*0.40) ) {
//     graphicsSetting = 1;
//     loadGraphicsSetting(graphicsSetting);
//     createCanvas(2.5*arrWidth, arrHeight);
//     loadGraphicsSetting(graphicsSetting);
//     buildArray();
//     pixelBuffer = createImage(arrWidth, arrHeight);

//     background(220);
//   }
//   else if (mouseX < (width) && mouseX > (width*0.87) &&
//       mouseY < (arrHeight*0.80) && mouseY > (arrHeight*0.60) ) {
//     graphicsSetting = 2;
//     loadGraphicsSetting(graphicsSetting);
//     createCanvas(2.5*arrWidth, arrHeight);
//     loadGraphicsSetting(graphicsSetting);
//     buildArray();
//     pixelBuffer = createImage(arrWidth, arrHeight);

//     background(220);
//   }
//   else if (mouseX < (width) && mouseX > (width*0.87) &&
//       mouseY < (arrHeight) && mouseY > (arrHeight*0.80) ) {
//     graphicsSetting = 3;
//     loadGraphicsSetting(graphicsSetting);
//     createCanvas(2.5*arrWidth, arrHeight);
//     loadGraphicsSetting(graphicsSetting);
//     buildArray();
//     pixelBuffer = createImage(arrWidth, arrHeight);

//     background(220);
//   }
  
//   // resize(500, 500);
// }

// function keyTyped() {
//   if (key === 'w') {
//     drawingWith = 2;
//   } else if (key === 's') {
//     drawingWith = 1;
//   } else if (key === 'd') {
//     drawingWith = 3;
//   } else if (key === 'm') {
//     drawingWith = -2;
//   } else if (key === 'f') {
//     drawingWith = -1;
//   } else if (key === 'p') {
//     if (brushSize < Math.min(arrWidth, arrHeight)) {
//       brushSize++;
//     }
//   } else if (key === 'l') {
//     if (brushSize > 1) {
//       brushSize--;
//     }
//   } else if (key === 'e') {
//     drawingWith = 0;
//   }
// }

var drawing = false;
