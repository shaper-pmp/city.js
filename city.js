City = {
  
  /* City dimensions, in blocks */
  width_blocks: 0,
  depth_blocks: 0,
  height_blocks: 1,
  
  /* Element dimensions */
  road_width: 25,
  block: {
    width: 100,
    height: 200,
    depth: 100
  },
  
  /* Calculated dimensions */
  width: 0,
  depth: 0,
  
  /* Buildings array */
  buildings: [],
  
  init: function(width, depth) {
    this.width_blocks = width;
    this.depth_blocks = depth;
    
    this.width = (this.width_blocks * this.block.width) + ((this.width_blocks-1) * this.road_width);
    this.depth = (this.depth_blocks * this.block.depth) + ((this.depth_blocks-1) * this.road_width);
    
    this.buildings = [];
    
    for(var x=0; x<this.width; x++) {
      this.buildings.push(new Array(z));
      for(var z=0;z<this.depth; z++) {
        this.buildings[x][z] = this.randomBuilding();
      }
    }
  },
  
  blockOffsetByIndex: function(x, z) {
    return {
      x: (x * this.block.width) + (x * this.road_width) + (this.block.width/2),
      z: (z * this.block.depth) + (z * this.road_width) + (this.block.depth/2),
      y: 0
    };
  },

  randomBuilding: function() {
    var newbuilding = new Building(this.block.width, this.block.depth, this.block.height);
    //console.log(newbuilding);
    return newbuilding;
  }
}

function Building(max_width, max_depth, max_height) {
  var greyscaleval = Math.round(Math.random() * 0x7f) + 40;
  var colour = (greyscaleval * 0x100) + greyscaleval;
  colour = (colour * 0x100) + greyscaleval;
  
  this.parts = [];
  
  var numparts = Math.round(Math.random() * 2)+1;
  //console.log(numparts);
  for(var i=0; i<numparts; i++) {
    w = Math.round((Math.random() * (max_width*0.6))+(max_width*0.4))-10;
    h = Math.round((Math.random() * (max_height*0.5))+(max_height*0.5));
    d = Math.round((Math.random() * (max_depth*0.6))+(max_depth*0.4))-10;
    
    x = Math.round((Math.random() * (max_width-10-w)) - ((max_width-10-w)/2));
    z = Math.round((Math.random() * (max_width-10-d)) - ((max_width-10-d)/2));
    
    this.parts.push({
      width: w,
      height: h,
      depth: d,
      x: x,
      y: h/2,
      z: z
    });
  }
  
  this.colour = colour;
  
  /*var combinedmesh = this.getMesh();
  combinedmesh.geometry.computeBoundingBox();
  //console.log(combinedmesh.geometry.boundingBox);
  this.width = combinedmesh.geometry.boundingBox.max.x;
  this.height = combinedmesh.geometry.boundingBox.max.y;
  this.depth = combinedmesh.geometry.boundingBox.max.z;*/
}

Building.prototype.getMesh = function () {
  var combined = new THREE.Geometry();
  
  for(var i=0; i<this.parts.length; i++) {
    geometry = new THREE.CubeGeometry(this.parts[i].width, this.parts[i].height, this.parts[i].depth);
    mesh = new THREE.Mesh(geometry);
    mesh.translateX(this.parts[i].x);
    mesh.translateZ(this.parts[i].z);
    mesh.translateY(this.parts[i].y);
    
    THREE.GeometryUtils.merge( combined, mesh );
  }
  
  var texture = this.getTexture();
  var material = new THREE.MeshLambertMaterial( { map:texture } );
  
  finalmesh = new THREE.Mesh( combined, material);
  return finalmesh;
};


Building.prototype.getTexture = function () {
  // Procedurally generate a texture from a canvas element
  var canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = "#"+this.colour.toString(16);
  ctx.fillRect(0, 0, 128, 128);

  ctx.lineWidth = 1;
  ctx.strokeStyle = "#ff0000";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(128, 128);
  ctx.moveTo(0, 128);
  ctx.lineTo(128, 0);
  ctx.stroke();

  var texture = new THREE.Texture(canvas, new THREE.UVMapping(), THREE.RepeatWrapping, THREE.RepeatWrapping);
  texture.repeat.x = 2; /* Need to find a way to make the texture tile as if it has a fixed size, rather than stretched/scaled to a multiple of each dimension of the object */
  texture.repeat.y = 2;
  texture.needsUpdate = true;
  return texture;
};