function randInt(min, max) {
  //The maximum is inclusive and the minimum is inclusive
 return Math.floor(Math.random() * (max - min + 1) + min);
}

function randFloat(min, max) {
  //The maximum is inclusive and the minimum is inclusive
 return (Math.random() * (max - min + 1)) + min;
}

Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}