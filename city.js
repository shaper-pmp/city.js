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
  var greyscaleval = Math.round(Math.random() * 0x3f) + 60;
  var colour = (greyscaleval * 0x100) + greyscaleval;
  colour = (colour * 0x100) + greyscaleval;
  
  this.parts = [];
  
  var numparts = Math.round(Math.random() * 2)+1;
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
  
  var materials = [];
  
  //console.log("Numparts: %i", this.parts.length);
  for(var i=0; i<this.parts.length; i++) {
    part = this.parts[i];
    
    var geometry = new THREE.CubeGeometry(part.width, part.height, part.depth);
    //console.log(geometry.faceVertexUvs[0]);
    geometry.faceVertexUvs[0][5] = [new THREE.Vector2(1, 1), new THREE.Vector2(1, 0), new THREE.Vector2(0, 0), new THREE.Vector2(0, 1)];
    geometry.faceVertexUvs[0][3] = [new THREE.Vector2(1, 1), new THREE.Vector2(1, 0), new THREE.Vector2(0, 0), new THREE.Vector2(0, 1)];
    geometry.faceVertexUvs[0][1] = [new THREE.Vector2(1, 1), new THREE.Vector2(1, 0), new THREE.Vector2(0, 0), new THREE.Vector2(0, 1)];

    //console.log(geometry);
    
    var mesh = new THREE.Mesh(geometry);

    mesh.translateX(part.x);
    mesh.translateZ(part.z);
    mesh.translateY(part.y);
    
    THREE.GeometryUtils.merge( combined, mesh );
  }

  //console.log(combined.vertices);
  
  for(var i=0; i<combined.faces.length; i++) {
    var face = combined.faces[i];
    
    //console.log("Face #"+i);
    //console.log(face);
    var face_width = 0;
    var face_height = 0;
    
    if(Math.abs(face.normal.x) == 1) {
      face_width = Math.abs(combined.vertices[face.a].z - combined.vertices[face.c].z);
    }
    if(Math.abs(face.normal.z) == 1) {
      face_width = Math.abs(combined.vertices[face.a].x - combined.vertices[face.c].x);
    }
    if(Math.abs(face.normal.x) == 1 || Math.abs(face.normal.z) == 1) {
      face_height = Math.abs(combined.vertices[face.a].y - combined.vertices[face.c].y);
      var texture = this.getWallTexture(face_width, face_height);
    }
    
    if(Math.abs(face.normal.y) == 1) {
      face_width = Math.abs(combined.vertices[face.a].x - combined.vertices[face.c].x);
      face_height = Math.abs(combined.vertices[face.a].z - combined.vertices[face.c].z);
      var texture = this.getRoofTexture(face_width, face_height);
    }
   
    //console.log("Pushing texture for face %i @ %ix%i:", i, face_width, face_height);
    //console.log(texture);
    materials.push(new THREE.MeshLambertMaterial( { color: this.colour, map:texture } ));
  }
  
  var finalmesh = new THREE.Mesh( combined, new THREE.MeshFaceMaterial(materials));
  return finalmesh;
};


Building.prototype.getWallTexture = function (width, height) {
  width = width || 256;
  height = height || 256;
  
  // Procedurally generate a texture from a canvas element
  var canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = "#"+this.colour.toString(16);
  ctx.fillRect(0, 0, 256, 256);

  //ctx.fillStyle = "#ffd000";
  for(var i=0; i<256; i=i+5) {
    for(var j=0; j<256; j=j+10) {
      ctx.fillStyle = "#"+(this.colour-0x0f0f0f).toString(16);
      ctx.fillRect(i-1, j-1, 3, 4);
      ctx.fillStyle = "#"+(this.colour+0x0f0f0f).toString(16);
      ctx.fillRect(i+1, j+1, 2, 3);
      if(Math.round(Math.random() * 4) == 1) {
          ctx.fillStyle = "#ffd000";
      }
      else {
        ctx.fillStyle = "#"+(this.colour-0x1f1f1f).toString(16);
      }
      ctx.fillRect(i, j, 2, 3);
    }
  }
  
  var texture = new THREE.Texture(canvas, new THREE.UVMapping(), THREE.RepeatWrapping, THREE.RepeatWrapping);
  texture.repeat.x = width/canvas.width; /* Need to find a way to make the texture tile as if it has a fixed size, rather than stretched/scaled to a multiple of each dimension of the object */
  texture.repeat.y = height/canvas.height;
  //console.log("     = texture scaling factor: %ix%i = %ix%i", texture.repeat.x, texture.repeat.y, texture.repeat.x*canvas.width, texture.repeat.y*canvas.height);
  texture.needsUpdate = true;
  return texture;
};

Building.prototype.getRoofTexture = function (width, height) {
  width = width || 256;
  height = height || 256;
  
  // Procedurally generate a texture from a canvas element
  var canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = "#"+this.colour.toString(16);
  ctx.fillRect(0, 0, 256, 256);

  var texture = new THREE.Texture(canvas, new THREE.UVMapping(), THREE.RepeatWrapping, THREE.RepeatWrapping);
  texture.repeat.x = width/canvas.width; /* Need to find a way to make the texture tile as if it has a fixed size, rather than stretched/scaled to a multiple of each dimension of the object */
  texture.repeat.y = height/canvas.height;
  //console.log("     = texture scaling factor: %ix%i = %ix%i", texture.repeat.x, texture.repeat.y, texture.repeat.x*canvas.width, texture.repeat.y*canvas.height);
  texture.needsUpdate = true;
  return texture;
};

Building.prototype.getDemoTexture = function (width, height) {
  width = width || 256;
  height = height || 256;
  
  // Procedurally generate a texture from a canvas element
  var canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = "#"+this.colour.toString(16);
  ctx.fillRect(0, 0, 256, 256);

  ctx.lineWidth = 1;
  ctx.strokeStyle = "#ff0000";
  ctx.beginPath();
  var xunit = canvas.width/10;
  var yunit = canvas.height/10;
  for(var i=0; i<10; i++) {
    ctx.moveTo(xunit*i, 0);
    ctx.lineTo(xunit*i, 256);
    ctx.moveTo(0, yunit*i);
    ctx.lineTo(256, yunit*i);
  }
  ctx.stroke();

  var texture = new THREE.Texture(canvas, new THREE.UVMapping(), THREE.RepeatWrapping, THREE.RepeatWrapping);
  texture.repeat.x = width/canvas.width; /* Need to find a way to make the texture tile as if it has a fixed size, rather than stretched/scaled to a multiple of each dimension of the object */
  texture.repeat.y = height/canvas.height;
  //console.log("     = texture scaling factor: %ix%i = %ix%i", texture.repeat.x, texture.repeat.y, texture.repeat.x*canvas.width, texture.repeat.y*canvas.height);
  texture.needsUpdate = true;
  return texture;
};