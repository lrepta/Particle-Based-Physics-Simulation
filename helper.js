function randInt(min, max) {
  //The maximum is inclusive and the minimum is inclusive
 return Math.floor(Math.random() * (max - min + 1) + min);
}

function randFloat(min, max) {
  //The maximum is inclusive and the minimum is inclusive
 return (Math.random() * (max - min + 1)) + min;
}