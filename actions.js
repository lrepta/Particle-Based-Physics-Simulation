const noOp = function(x,y){};
const offset = 2;
let functionsLeft = new Array();
functionsLeft.push(updateSmoke, updateFire, noOp, updateSand, updateWater, noOp);

let functionsRight = new Array();
functionsRight.push(updateSmokeRight, updateFireRight, noOp, updateSandRight, updateWaterRight, noOp);


const functions = new Array(functionsLeft, functionsRight);


let colorTable = {};
let colorIndex = 0;


function getColor(id) {
  let color;
  color = colors[colorIndex + (id-1)*(flameLife+1)];
  colorIndex++;
  colorIndex = colorIndex * (colorIndex < flameLife);
  
  return color;
}

let colors;

function generateColors() {
  const numParticles = 5;
  colors = new Int32Array(5 * (flameLife+1));

  const a = 0xff000000;

  for (let i = 0; i < flameLife+1; i++) {
    // abgr

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

function getUpdated(index) { 
  // get the hasUpdated bit, then right shift it over 21 to get 0 or 1
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

// Two's-complement representation of -1 using 5 bits
const _FIRE = 0x0000001F; // = 31 or -1
const _SMOKE = 0x0000001E; // = 30 or -2
const _BACKGROUND = 0x00000000; // = 0
const _SAND = 0x00000001; // ? = 1
const _WATER = 0x00000002; // ? = 2
const _WOOD = 0x00000003; // ? = 3

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
  pixelView[index] &= 0x00000000;
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
  if (downId <= 0) {
    // down.setID(-2);
    swap(index, downIndex);
    return;
  }

  // Down through water
  if (downId == 2 && !getUpdated(downIndex)) {
    swap(index, downIndex);
    return;
  }

  // Down-Left
  if (xPos > 0 && getID(downIndex-1) == 0) {
    swap(index, downIndex-1);
    return;
  }

  // Down-Right
  if (xPos < arrHeight-1 && getID(downIndex+1) == 0) {
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
  if (downId <= 0) {
    // down.setID(-2);
    swap(index, downIndex);
    return;
  }

  // Down through water
  if (downId == 2 && !getUpdated(downIndex)) {
    swap(index, downIndex);
    return;
  }

  // Down-Right
  if (xPos < arrHeight-1 && getID(downIndex+1) == 0) {
    swap(index, downIndex+1);
    return;
  }

  // Down-Left
  if (xPos > 0 && getID(downIndex-1) == 0) {
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
    if (downId <= 0) {
      if (downId == -1) {
        setID(-2, downIndex);
        setLifeTime(smokeLife>>1, downIndex);
      }
      swap(index, downIndex);
      return;
    }
    // Down-Left
    if (xPos > 0 && getID(downIndex-1) == 0) {
      swap(index, downIndex-1);
      return;
    }
    // Down-Right
    if (xPos < arrWidth-1 && getID(downIndex+1) == 0) {
      swap(index, downIndex+1);
      return
    }
  }
    
  
  // Left 
  if (xPos > 0 && (leftId=getID(index-1)) <= 0) {
    if (leftId == -1) {
      setID(-2, index-1);
      setLifeTime(smokeLife/3, index-1);
    }
    swap(index, index-1);
    return;
  }
  // Right
  if (xPos < arrWidth-1 && (rightId=getID(index+1)) <= 0) {
    if (rightId == -1) {
      setID(-2, index+1);
      setLifeTime(smokeLife/3, index+1);
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
    if (downId <= 0) {
      if (downId == -1) {
        setID(-2, downIndex);
        setLifeTime(smokeLife>>1, downIndex);
      }
      swap(index, downIndex);
      return;
    }
    // Down-Right
    if (xPos < arrWidth-1 && getID(downIndex+1) == 0) {
      swap(index, downIndex+1);
      return
    }
    // Down-Left
    if (xPos > 0 && getID(downIndex-1) == 0) {
      swap(index, downIndex-1);
      return;
    }
  }
    
  
  // Right
  if (xPos < arrWidth-1 && (rightId=getID(index+1)) <= 0) {
    if (rightId == -1) {
      setID(-2, index+1);
      setLifeTime(smokeLife/3, index+1);
    }
    swap(index, index+1);
    return;
  }
  // Left 
  if (xPos > 0 && (leftId=getID(index-1)) <= 0) {
    if (leftId == -1) {
      setID(-2, index-1);
      setLifeTime(smokeLife/3, index-1);
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
  gameImagedata32[index] = colors[(particleLife=getLifeTime(index)) + ((getID(index)*-1)+2)*(flameLife+1)];
  
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
        
        if (getID(surroundingIndex) == 3 &&
            (flammabilityMatrix[i+1][j+1] > 0.225) && particleLife % flammabilityTime == 0) {
          setID(-1, surroundingIndex);
          setLifeTime(flameLife, surroundingIndex);
          setUpdated(index);

          // arr2d[xPos][yPos].setEmpty();
          // // Replace the former fire particle with smoke particle
          // arr2d[xPos][yPos].setID(-2);
          // arr2d[xPos][yPos].setLifeTime(240);
          // arr2d[xPos][yPos].setUpdated(true);
          ++particlesBurnt;
          // Break here if I want it to only spread to 1 new particle
        } else if (getID(surroundingIndex) == 0 && smokeProduced < 4) {
          if (particleLife % 24 == 0 || particleLife % 30 == 0) {
            setEmpty(surroundingIndex);
            setID(-2, surroundingIndex);
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
    if ((downId=getID(downIndex=index+arrHeight)) == 0) {
      swap(index, downIndex);
      return;
    }
    // Fire can fall through smoke
    if (downId == -2) {
      swap(index, downIndex);
      return;
    // If fire lands on water, exstinguish and create steam (smoke)
    } else if (downId == 2) {
      setEmpty(index);
      setID(-2, index);
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
  gameImagedata32[index] = colors[(particleLife=getLifeTime(index)) + ((getID(index)*-1)+2)*(flameLife+1)];
  
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
        
        if (getID(surroundingIndex) == 3 &&
            (flammabilityMatrix[i+1][j+1] > 0.225) && particleLife % flammabilityTime == 0) {
          setID(-1, surroundingIndex);
          setLifeTime(flameLife, surroundingIndex);
          setUpdated(index);

          // arr2d[xPos][yPos].setEmpty();
          // // Replace the former fire particle with smoke particle
          // arr2d[xPos][yPos].setID(-2);
          // arr2d[xPos][yPos].setLifeTime(240);
          // arr2d[xPos][yPos].setUpdated(true);
          ++particlesBurnt;
          // Break here if I want it to only spread to 1 new particle
        } else if (getID(surroundingIndex) == 0 && smokeProduced < 4) {
          if (particleLife % 24 == 0 || particleLife % 30 == 0) {
            setEmpty(surroundingIndex);
            setID(-2, surroundingIndex);
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
    if ((downId=getID(downIndex=index+arrHeight)) == 0) {
      swap(index, downIndex);
      return;
    }
    // Fire can fall through smoke
    if (downId == -2) {
      swap(index, downIndex);
      return;
    // If fire lands on water, exstinguish and create steam (smoke)
    } else if (downId == 2) {
      setEmpty(index);
      setID(-2, index);
      setLifeTime(smokeLife>>1, index);
    }
  }
}

let upIndex = 0;
let upLeftIndex = 0;
let upRightIndex = 0;

function updateSmoke(xPos, yPos) {
  index = xPos + yPos*arrHeight;

  if (yPos == 0 || hasUpdated(index)) {
    return;
  }
  
  incrementTime(index)
  gameImagedata32[index] = colors[(particleLife=getLifeTime(index)) + ((getID(index)*-1)+2)*(flameLife+1)];
  
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
  if (getID((upIndex=index-arrHeight)) == 0) {
    swap(index, upIndex);
    return;
  }
  // Up-Left
  if (xPos != 0 && getID(upIndex-1) == 0) {
    swap(index, upIndex-1);
    return;
  }
  // Up-Right
  if (xPos != arrWidth - 1 && getID(upIndex+1) == 0) {
    swap(index, upIndex+1);
    return;
  }
  // Left
  if (xPos != 0 && getID(index-1) == 0) {
    swap(index, index-1);
    return;
  }
  // Right
  if (xPos != arrWidth - 1 && getID(index+1) == 0) {
    swap(index, index+1);
    return;
  }
}

function updateSmokeRight(xPos, yPos) {
  index = xPos + yPos*arrHeight;

  if (yPos == 0 || hasUpdated(index)) {
    return;
  }
  
  incrementTime(index)
  gameImagedata32[index] = colors[(particleLife=getLifeTime(index)) + ((getID(index)*-1)+2)*(flameLife+1)];
  
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
  if (getID((upIndex=index-arrHeight)) == 0) {
    swap(index, upIndex);
    return;
  }
  // Up-Right
  if (xPos != arrWidth - 1 && getID(upIndex+1) == 0) {
    swap(index, upIndex+1);
    return;
  }
  // Up-Left
  if (xPos != 0 && getID(upIndex-1) == 0) {
    swap(index, upIndex-1);
    return;
  }
  // Right
  if (xPos != arrWidth - 1 && getID(index+1) == 0) {
    swap(index, index+1);
    return;
  }
  // Left
  if (xPos != 0 && getID(index-1) == 0) {
    swap(index, index-1);
    return;
  }
}