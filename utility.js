/* Utility functions */

var Utility = {
  
  /* Quantise a value to the nearest multiple of the specified divisor (ie, (85,10) would quantise 85 to the nearest 1/10 of 85 (8.5)) */
  quantiseValue: function(value, divisor) {
    return Math.round(value/divisor) * divisor;
  },
  
  canvasElement: null,
  
  getCanvasContext: function(width, height, backgroundColour) {
    // Procedurally generate a texture from a canvas element
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    var ctx = canvas.getContext('2d');
  
    ctx.fillStyle = "#"+backgroundColour.toString(16);
    ctx.fillRect(0, 0, 256, 256);
    
    var texture = new THREE.Texture(canvas, new THREE.UVMapping(), THREE.RepeatWrapping, THREE.RepeatWrapping);
    texture.repeat.x = width/canvas.width;
    texture.repeat.y = height/canvas.height;
    texture.needsUpdate = true;
    
    return texture;
  }
};