const noOp = function(x,y){};
const offset = 3;
let functionsLeft = new Array();
functionsLeft.push(noOp, updateWater, updateSand, noOp, updateFire, updateSmoke);

let functionsRight = new Array();
functionsRight.push(noOp, updateWaterRight, updateSandRight, noOp, updateFireRight, updateSmokeRight);


const functions = new Array(functionsLeft, functionsRight);


let colorTable = {};
let colorIndex = 0;


function getColor(id) {
  let color;
  color = colors[colorIndex + ((id-(id>_BACKGROUND))-_BACKGROUND+offset)*(flameLife+1)];
  ++colorIndex;
  colorIndex = colorIndex * (colorIndex < flameLife);
  
  return color;
}

let colors;

const _HSL_SAND = [40, 65, 60];
function vary_color(hsl) {
  let [h, s, l] = hsl;

  s = Math.max(s + randInt(-20, 0), 0);
  l = Math.min(Math.max(s + randInt(-10, 10), 0), 100);

  return HSL_to_RGB(h, s, l);
}

function HSL_to_RGB(h, s, l) {
  // let [h, s, l] = hsl;
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    // return [255 * f(0), 255 * f(8), 255 * f(4)];
  return ( Math.round((255 * f(4)) << 16) +  (Math.round((255 * f(8))) << 8) + (Math.round((255 * f(0)))));
}

// console.log(HSL_to_RGB(40, 65, 60));
// console.log(0x00000000 + HSL_to_RGB(_HSL_SAND));

function generateColors() {
  const numParticles = 5;
  colors = new Int32Array(5 * (flameLife+1));

  const a = 0xff000000;

  for (let i = 0; i < flameLife+1; i++) {
    // abgr

    // wood
    colors[i + 0*(flameLife+1)] = a + (0+randInt(0,10) << 16) + ((35+randInt(-5, 5)) << 8) + (70+randInt(-5, 5));
    // water
    colors[i + 1*(flameLife+1)] = a + (150+randInt(-5,15) << 16) + ((20+randInt(-5, 5)) << 8) + (20+randInt(-5, 5));
    // sand
    // colors[i + 2*(flameLife+1)] = a + (89+randInt(0,5) << 16) + ((177+randInt(-10, 0)) << 8) + (220+randInt(-10, 20));
    colors[i + 2*(flameLife+1)] = a + vary_color(_HSL_SAND);
    
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

function getUpdated(index) { 
  // get the getUpdated bit, then right shift it over 21 to get 0 or 1
  // let updated = pixelView[index];
  return pixelView[index] & 0x00000020 //) >>> 21);
  // return 0;
}
// function setUpdated(status, index) {
//   // zero out the 5 id bits, then replace them with the 1 21-left-shifted status bit
//   pixelView[index] &= 0xFFDFFFFF; //FFEFFFFF; // 0b11111111111011111111111111111111
//   pixelView[index] |= (status << 21);
// }

function setUpdated(index) {
  pixelView[index] |= 0x00000020;
}
function setNotUpdated(index) {
  pixelView[index] &= 0xFFFFFFDF;
}

const _SMOKE = 0x00000012; // = 18
const _FIRE = 0x00000011; // = 17
const _BACKGROUND = 0x00000010; // = 16
const _SAND = 0x0000000F; // ? = 15
const _WATER = 0x0000000E; // ? = 14
const _WOOD = 0x0000000D; // ? = 13

// const _PID = 

function getID(index) {
  // get the 5 id bits, then right shift them over 16 to get the correct value
  return (pixelView[index] & 0x0000001F) //>> 16); 
}

function setID(newId, index) {
  // zero out the 5 id bits, then replace them with the 5 16-left-shifted newId bits
  pixelView[index] &= 0x00000000; //0xFFE0FFFF // 0b11111111111000001111111111111111
  pixelView[index] |= newId;
  // pixelView[index] |= newId;
  // set the color of the corresponding newId
  gameImagedata32[index] = getColor(newId);
}

function getLifeTime(index) {
  return (pixelView[index] >> 6);
}

function setLifeTime(time, index) {
  pixelView[index] &= 0xFFFF003F;
  pixelView[index] |= (time << 6);
}

function incrementTime(index) {
  const lifeTime = (pixelView[index] >> 6) - 1;
  pixelView[index] &= 0xFFFF003F;
  pixelView[index] |= (lifeTime << 6);
}

function setEmpty(index) {
  pixelView[index] = _BACKGROUND;
  gameImagedata32[index] = BACKGROUND;
}

function swap(index1, index2) {
  pixelView[index1] = pixelView[index1] ^ pixelView[index2];
  pixelView[index2] = pixelView[index1] ^ pixelView[index2];
  pixelView[index1] = pixelView[index1] ^ pixelView[index2];

  gameImagedata32[index1] = gameImagedata32[index1] ^ gameImagedata32[index2];
  gameImagedata32[index2] = gameImagedata32[index1] ^ gameImagedata32[index2];
  gameImagedata32[index1] = gameImagedata32[index1] ^ gameImagedata32[index2];
  // [pixelView[index1], pixelView[index2]] = [pixelView[index2], pixelView[index1]];
  // [gameImagedata32[index1], gameImagedata32[index2]] = [gameImagedata32[index2], gameImagedata32[index1]];

  setUpdated(index1);
  setUpdated(index2);
}


let index = 0;
let downIndex = 0;
let downId = 0;
let downLeftId = 0;
let downRightId = 0;
let leftId = 0;
let rightId = 0;

function updateSand(xPos, yPos) {
  index = xPos + yPos*arrHeight;

  if (getUpdated(index) || yPos == arrHeight - 1) {
    return;
  }

  downIndex = index + arrHeight;
  downId = getID(downIndex);

  // Down, through empty space, fire, or smoke
  if (downId >= _BACKGROUND) {
    // down.setID(-2);
    swap(index, downIndex);
    return;
  }

  // Down through water
  if (downId == _WATER && !getUpdated(downIndex)) {
    swap(index, downIndex);
    return;
  }

  // Down-Left
  if (xPos > 0 && getID(downIndex-1) == _BACKGROUND) {
    swap(index, downIndex-1);
    return;
  }

  // Down-Right
  if (xPos < arrHeight-1 && getID(downIndex+1) == _BACKGROUND) {
    swap(index, downIndex+1);
    return;
  }
}

function updateSandRight(xPos, yPos) {
  index = xPos + yPos*arrHeight;

  if (getUpdated(index) || yPos == arrHeight - 1) {
    return;
  }

  downIndex = index + arrHeight;
  downId = getID(downIndex);

// Down, through empty space, fire, or smoke
  if (downId >= _BACKGROUND) {
    // down.setID(-2);
    swap(index, downIndex);
    return;
  }

  // Down through water
  if (downId == _WATER && !getUpdated(downIndex)) {
    swap(index, downIndex);
    return;
  }

  // Down-Right
  if (xPos < arrHeight-1 && getID(downIndex+1) == _BACKGROUND) {
    swap(index, downIndex+1);
    return;
  }

  // Down-Left
  if (xPos > 0 && getID(downIndex-1) == _BACKGROUND) {
    swap(index, downIndex-1);
    return;
  }
}

function updateWater(xPos, yPos) {
  index = xPos + yPos*arrHeight;

  if (getUpdated(index)) {
    return;
  }
  
  downIndex = index + arrHeight;
  downId = getID(downIndex);

  // Down, through empty space, fire, or smoke
  if (yPos < arrHeight-1) {
    if (downId >= _BACKGROUND) {
      if (downId == _FIRE) {
        setID(_SMOKE, downIndex);
        setLifeTime(smokeLife>>1, downIndex);
      }
      swap(index, downIndex);
      return;
    }
    // Down-Left
    if (xPos > 0 && getID(downIndex-1) == _BACKGROUND) {
      swap(index, downIndex-1);
      return;
    }
    // Down-Right
    if (xPos < arrWidth-1 && getID(downIndex+1) == _BACKGROUND) {
      swap(index, downIndex+1);
      return
    }
  }
    
  
  // Left 
  if (xPos > 0 && (leftId=getID(index-1)) >= _BACKGROUND) {
    if (leftId == -1) {
      setID(_SMOKE, index-1);
      setLifeTime(smokeLife>>1, index-1);
    }
    swap(index, index-1);
    return;
  }
  // Right
  if (xPos < arrWidth-1 && (rightId=getID(index+1)) >= _BACKGROUND) {
    if (rightId == _FIRE) {
      setID(_SMOKE, index+1);
      setLifeTime(smokeLife>>1, index+1);
    }
    swap(index, index+1);
    return;
  }
}

function updateWaterRight(xPos, yPos) {
  index = xPos + yPos*arrHeight;

  if (getUpdated(index)) {
    return;
  }
  
  downIndex = index + arrHeight;
  downId = getID(downIndex);

  // Down, through empty space, fire, or smoke
  if (yPos < arrHeight-1) {
    if (downId >= _BACKGROUND) {
      if (downId == _FIRE) {
        setID(_SMOKE, downIndex);
        setLifeTime(smokeLife>>1, downIndex);
      }
      swap(index, downIndex);
      return;
    }
    // Down-Right
    if (xPos < arrWidth-1 && getID(downIndex+1) == _BACKGROUND) {
      swap(index, downIndex+1);
      return
    }
    // Down-Left
    if (xPos > 0 && getID(downIndex-1) == _BACKGROUND) {
      swap(index, downIndex-1);
      return;
    }
  }
    
  
  // Right
  if (xPos < arrWidth-1 && (rightId=getID(index+1)) >= _BACKGROUND) {
    if (rightId == _FIRE) {
      setID(_SMOKE, index+1);
      setLifeTime(smokeLife>>1, index+1);
    }
    swap(index, index+1);
    return;
  }
  // Left 
  if (xPos > 0 && (leftId=getID(index-1)) >= _BACKGROUND) {
    if (leftId == _FIRE) {
      setID(_SMOKE, index-1);
      setLifeTime(smokeLife>>1, index-1);
    }
    swap(index, index-1);
    return;
  }
}

let particlesBurnt = 0;
let smokeProduced = 0;
let particleLife = 0;
let surroundingIndex = 0;

function updateFire(xPos, yPos) {
  index = xPos + yPos*arrHeight;

  if (getUpdated(index)) {
    return;
  }
  
  // downIndex = index + arrHeight;
  // downId = getID(downIndex);
  
  incrementTime(index);
  // gameImagedata32[index] = colors[(particleLife=getLifeTime(index)) + ((getID(index)*-1)+2)*(flameLife+1)];
  gameImagedata32[index] = colors[(particleLife=getLifeTime(index)) + (3)*(flameLife+1)];
  
  // Fire hasn't spread to any new particle in its lifetime, exstinguishes
  if (getLifeTime(index) == 0) {
    setEmpty(index);
    return;
  }
  
  particlesBurnt = 0;
  smokeProduced = 0;
  // Burn any flammable particles around the fire particle
  for (let j = -1; j < 2; ++j) {
    for(let i = -1; i < 2; ++i) {
      surroundingIndex = index + i + (arrHeight * j);
      // randomSpread = Math.floor(random(0, 15));
      // if (randomSpread != 14) {
      //   continue;
      // }
      if (xPos + i > -1 && xPos + i < arrWidth &&
          yPos + j > -1 && yPos + j < arrHeight &&
          particlesBurnt < 3) {
        
        if (getID(surroundingIndex) == _WOOD &&
            (flammabilityMatrix[i+1][j+1] > 0.225) && particleLife % flammabilityTime == 0) {
          setID(_FIRE, surroundingIndex);
          setLifeTime(flameLife, surroundingIndex);
          setUpdated(index);

          // arr2d[xPos][yPos].setEmpty();
          // // Replace the former fire particle with smoke particle
          // arr2d[xPos][yPos].setID(-2);
          // arr2d[xPos][yPos].setLifeTime(240);
          // arr2d[xPos][yPos].setUpdated(true);
          ++particlesBurnt;
          // Break here if I want it to only spread to 1 new particle
        } else if (getID(surroundingIndex) == _BACKGROUND && smokeProduced < 4) {
          if (particleLife % 24 == 0 || particleLife % 30 == 0) {
            setEmpty(surroundingIndex);
            setID(_SMOKE, surroundingIndex);
            setUpdated(surroundingIndex);
            // Shorter lifetime smoke for not consuming particle
            setLifeTime(smokeLife-20, surroundingIndex);
            ++smokeProduced;
          }
        }
      }
    }
  }
  
  // Fire only falls Down
  if (yPos != arrHeight - 1) {
    if ((downId=getID(downIndex=index+arrHeight)) == _BACKGROUND) {
      swap(index, downIndex);
      return;
    }
    // Fire can fall through smoke
    if (downId == _SMOKE) {
      swap(index, downIndex);
      return;
    // If fire lands on water, exstinguish and create steam (smoke)
    } else if (downId == _WATER) {
      setEmpty(index);
      setID(_SMOKE, index);
      setLifeTime(smokeLife>>1, index);
    }
  }
  
}

function updateFireRight(xPos, yPos) {
  index = xPos + yPos*arrHeight;

  if (getUpdated(index)) {
    return;
  }
  
  // downIndex = index + arrHeight;
  // downId = getID(downIndex);
  
  incrementTime(index);
  gameImagedata32[index] = colors[(particleLife=getLifeTime(index)) + (3)*(flameLife+1)];
  // gameImagedata32[index] = colors[(particleLife=getLifeTime(index)) + ((getID(index)*-1)+2)*(flameLife+1)];
  
  // Fire hasn't spread to any new particle in its lifetime, exstinguishes
  if (particleLife == 0) {
    setEmpty(index);
    return;
  }
  
  particlesBurnt = 0;
  smokeProduced = 0;
  // Burn any flammable particles around the fire particle
  for (let j = 1; j > -2; --j) {
    for(let i = 1; i > -2; --i) {
      surroundingIndex = index + i + (arrHeight * j);
      // randomSpread = Math.floor(random(0, 15));
      // if (randomSpread != 14) {
      //   continue;
      // }
      if (xPos + i > -1 && xPos + i < arrWidth &&
          yPos + j > -1 && yPos + j < arrHeight &&
          particlesBurnt < 3) {
        
        if (getID(surroundingIndex) == _WOOD &&
            (flammabilityMatrix[i+1][j+1] > 0.225) && particleLife % flammabilityTime == 0) {
          setID(_FIRE, surroundingIndex);
          setLifeTime(flameLife, surroundingIndex);
          setUpdated(index);

          // arr2d[xPos][yPos].setEmpty();
          // // Replace the former fire particle with smoke particle
          // arr2d[xPos][yPos].setID(-2);
          // arr2d[xPos][yPos].setLifeTime(240);
          // arr2d[xPos][yPos].setUpdated(true);
          ++particlesBurnt;
          // Break here if I want it to only spread to 1 new particle
        } else if (getID(surroundingIndex) == _BACKGROUND && smokeProduced < 4) {
          if (particleLife % 24 == 0 || particleLife % 30 == 0) {
            setEmpty(surroundingIndex);
            setID(_SMOKE, surroundingIndex);
            setUpdated(surroundingIndex);
            // Shorter lifetime smoke for not consuming particle
            setLifeTime(smokeLife-20, surroundingIndex);
            ++smokeProduced;
          }
        }
      }
    }
  }
  
  // Fire only falls Down
  if (yPos != arrHeight - 1) {
    if ((downId=getID(downIndex=index+arrHeight)) == _BACKGROUND) {
      swap(index, downIndex);
      return;
    }
    // Fire can fall through smoke
    if (downId == _SMOKE) {
      swap(index, downIndex);
      return;
    // If fire lands on water, exstinguish and create steam (smoke)
    } else if (downId == _WATER) {
      setEmpty(index);
      setID(_SMOKE, index);
      setLifeTime(smokeLife>>1, index);
    }
  }
}

let upIndex = 0;
let upLeftIndex = 0;
let upRightIndex = 0;

function updateSmoke(xPos, yPos) {
  index = xPos + yPos*arrHeight;

  if (yPos == 0 || getUpdated(index)) {
    return;
  }
  
  incrementTime(index)
  gameImagedata32[index] = colors[(particleLife=getLifeTime(index)) + (4)*(flameLife+1)];
  // gameImagedata32[index] = colors[(particleLife=getLifeTime(index)) + ((getID(index)*-1)+2)*(flameLife+1)];
  
  // If smoke is around for more than it's lifetime, it dissipates
  if (particleLife == 0) {
    setEmpty(index);
    return;
  }
  // if (yPos == 0) {
  //   // unecessary
  //   // setUpdated(index);
  //   return;
  // }

  // Up
  if (getID((upIndex=index-arrHeight)) == _BACKGROUND) {
    swap(index, upIndex);
    return;
  }
  // Up-Left
  if (xPos != 0 && getID(upIndex-1) == _BACKGROUND) {
    swap(index, upIndex-1);
    return;
  }
  // Up-Right
  if (xPos != arrWidth - 1 && getID(upIndex+1) == _BACKGROUND) {
    swap(index, upIndex+1);
    return;
  }
  // Left
  if (xPos != 0 && getID(index-1) == _BACKGROUND) {
    swap(index, index-1);
    return;
  }
  // Right
  if (xPos != arrWidth - 1 && getID(index+1) == _BACKGROUND) {
    swap(index, index+1);
    return;
  }
}

function updateSmokeRight(xPos, yPos) {
  index = xPos + yPos*arrHeight;

  if (yPos == 0 || getUpdated(index)) {
    return;
  }
  
  incrementTime(index)
  gameImagedata32[index] = colors[(particleLife=getLifeTime(index)) + (4)*(flameLife+1)];
  // gameImagedata32[index] = colors[(particleLife=getLifeTime(index)) + ((getID(index)*-1)+2)*(flameLife+1)];
  
  // If smoke is around for more than it's lifetime, it dissipates
  if (particleLife == 0) {
    setEmpty(index);
    return;
  }
  // if (yPos == 0) {
  //   // unecessary
  //   // setUpdated(index);
  //   return;
  // }

  // Up
  if (getID((upIndex=index-arrHeight)) == _BACKGROUND) {
    swap(index, upIndex);
    return;
  }
  // Up-Right
  if (xPos != arrWidth - 1 && getID(upIndex+1) == _BACKGROUND) {
    swap(index, upIndex+1);
    return;
  }
  // Up-Left
  if (xPos != 0 && getID(upIndex-1) == _BACKGROUND) {
    swap(index, upIndex-1);
    return;
  }
  // Right
  if (xPos != arrWidth - 1 && getID(index+1) == _BACKGROUND) {
    swap(index, index+1);
    return;
  }
  // Left
  if (xPos != 0 && getID(index-1) == _BACKGROUND) {
    swap(index, index-1);
    return;
  }
}