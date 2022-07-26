const brushSizeSlider = document.getElementById("brushSize");

window.updateBrushSize = function() {
  brushSize = parseInt(brushSizeSlider.value);
}

window.updateMouseDrawing = function() {


  //   function getMousePos(evt) {
  //     var rect = onscreenCanvas.getBoundingClientRect();
  //     return {
  //         x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
  //         y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
  //     };
  // }
  
    // let canvas = document.getElementById("glcanvas");
  
    // window.width = onscreenCanvas.clientWidth;
    // window.height = onscreenCanvas.clientHeight;
    // let moved = false;
    drawing = false;
    let mouseDownListener = (e) => {
        // moved = true;
        // const rect = onscreenCanvas.getBoundingClientRect();
        // const x = (e.clientX - rect.left) / (rect.right - rect.left) * onscreenCanvas.width;
        // const y = (e.clientY - rect.top) / (rect.bottom - rect.top) * onscreenCanvas.height;
  
        drawing = true;
        mx = e.clientX;
        my = e.clientY;
    }
    onscreenCanvas.addEventListener("mousedown", mouseDownListener);
    let mouseMoveListener = (e) => {
        if(drawing) {
          // const rect = onscreenCanvas.getBoundingClientRect();
          mx = e.clientX;
          my = e.clientY;
          // mx = (e.clientX - rect.left) / (rect.right - rect.left) * onscreenCanvas.width;
          // mx = map(0, )
          // my = (e.clientY - rect.top) / (rect.bottom - rect.top) * onscreenCanvas.height;
            // currRotate += 360 * e.movementX/onscreenCanvas.clientWidth;
            // // Bind rotation to 0-360
            // // Supports rotating infinitely in any direction,
            // // as the degrees get reset when reaching 360 or 0
            // if (currRotate > 360) {
            //     currRotate = 0;
            // } else if (currRotate < 0) {
            //     currRotate = 360;
            // }
  
            // currZoom += -200 * e.movementY/onscreenCanvas.clientHeight;
            // // bind zoom from 1 to 100
            // currZoom = Math.max(1, currZoom);
            // currZoom = Math.min(100, currZoom);
        }
    }
    onscreenCanvas.addEventListener("mousemove", mouseMoveListener);
    
    let mouseUpListener = (e) => {
        drawing = false;
    }
    onscreenCanvas.addEventListener("mouseup", mouseUpListener);
  }


function generateElementButtons() {
  const elementTable = document.getElementById("elementTable");

  const elems = ["Smoke", "Fire", "Erase", "Sand", "Water", "Wood"];
  const ids = [18, 17, 16, 15, 14, 13];

  const row = elementTable.insertRow(0);
  for (let i = 0; i < 6; ++i) {
    const cell = row.insertCell(i);

    const elemButton = document.createElement("input")
    cell.appendChild(elemButton);
    elemButton.type = "button";
    elemButton.className = "elementMenuButton";

    elemButton.value = elems[i];

    elemButton.addEventListener("click", ()=>{drawingWith = ids[i]; console.log(drawingWith)});
  }
}

generateElementButtons();