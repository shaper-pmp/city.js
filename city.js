City = {
  
  scene: null,
  
  /* City dimensions, in blocks */
  width_blocks: 0,
  depth_blocks: 0,
  height_blocks: 1,
  
  /* Element dimensions */
  road_width: 25,
  block: {
    width: 110,
    height: 196,
    depth: 110
  },
  
  /* Calculated dimensions */
  width: 0,
  depth: 0,
  
  /* Buildings array */
  buildings: [],
  
  init: function(scene, width, depth) {
    
    this.scene = scene;
    
    this.width_blocks = width;
    this.depth_blocks = depth;
    
    this.width = (this.width_blocks * this.block.width) + ((this.width_blocks-1) * this.road_width);
    this.depth = (this.depth_blocks * this.block.depth) + ((this.depth_blocks-1) * this.road_width);
    
    this.buildings = [];
    
    for(var x=0; x<this.width_blocks; x++) {
      this.buildings.push(new Array(z));
      for(var z=0;z<this.depth_blocks; z++) {
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
    var newbuilding = new Building(this.scene, this.block.width, this.block.depth, this.block.height);
    //console.log(newbuilding);
    return newbuilding;
  }
}

function Building(scene, max_width, max_depth, max_height) {
  
  this.scene = scene;
  this.pavement_width = 5;
  this.min_part_width = 0.6;
  this.min_part_height = 0.5;
  this.min_part_depth = 0.6;
  
  var greyscaleval = Math.round(Math.random() * 0x3f) + 60;
  var colour = (greyscaleval * 0x100) + greyscaleval;
  colour = (colour * 0x100) + greyscaleval;
  
  this.parts = [];
  this.partMeshes = [];
  
  this.avail_width = max_width-(this.pavement_width*2); // Width/depth minus space for pavement
  this.avail_depth = max_depth-(this.pavement_width*2);
  
  var numparts = Math.round(Math.random() * 2)+1;
  for(var i=0; i<numparts; i++) {
    
    w = Math.round((Math.random() * (this.avail_width*this.min_part_width))+(this.avail_width*(1-this.min_part_width)));
    h = Math.round((Math.random() * (max_height*this.min_part_height))+(max_height*(1-this.min_part_height)));
    d = Math.round((Math.random() * (this.avail_depth*this.min_part_depth))+(this.avail_depth*(1-this.min_part_depth)));
    
    // Block width is 110, pavement width is 5, so available width is 100 (block_width-(pavement_width*2))
    // Texture repeats horizontally every 10px, and vertically every 7px
    // So, to get textures to line up clamp values to nearest 1/10th of the available width and 1/7th of available height
  
    w = Math.round(w/10) * 10;
    h = Math.round(h/7) * 7;
    d = Math.round(d/10) * 10;
    
    remaining_x = this.avail_width-w;
    remaining_z = this.avail_depth-d;
    //offset_x = 
    x = Math.round((Math.random() * remaining_x) - (remaining_x/2));
    z = Math.round((Math.random() * remaining_z) - (remaining_z/2));
    
    x = (x > 0 ? Math.floor(x/10) : Math.ceil(x/10)) * 10;  // Don't Math.round() because that may end up rounding *up*, which (if the building is already near the max offset) can increase offset even further so it overlaps the pavement
    z = (z > 0 ? Math.floor(z/10) : Math.ceil(z/10)) * 10;
    
    var part = {
      width: w,
      height: h,
      depth: d,
      x: x,
      y: h/2,
      z: z
    };
    
    this.parts.push(part);
  }
  
  for(var i=0; i<this.parts.length; i++) {
    part = this.parts[i];
    
    var geometry = new THREE.CubeGeometry(part.width, part.height, part.depth);
    geometry.faceVertexUvs[0][5] = [new THREE.Vector2(1, 1), new THREE.Vector2(1, 0), new THREE.Vector2(0, 0), new THREE.Vector2(0, 1)];
    geometry.faceVertexUvs[0][3] = [new THREE.Vector2(1, 1), new THREE.Vector2(1, 0), new THREE.Vector2(0, 0), new THREE.Vector2(0, 1)];
    geometry.faceVertexUvs[0][1] = [new THREE.Vector2(1, 1), new THREE.Vector2(1, 0), new THREE.Vector2(0, 0), new THREE.Vector2(0, 1)];

    var mesh = new THREE.Mesh(geometry);

    mesh.translateX(part.x);
    mesh.translateZ(part.z);
    mesh.translateY(part.y);
    
    this.partMeshes.push(mesh);
  }
  
  this.colour = colour;
}

Building.prototype.getBuildingMesh = function () {
  var combined = new THREE.Geometry();
  
  var materials = [];
  
  for(var i=0; i<this.partMeshes.length; i++) {
    mesh = this.partMeshes[i];
    
    THREE.GeometryUtils.merge( combined, mesh );
  }

  //console.log(combined.vertices);
  
  for(var i=0; i<combined.faces.length; i++) {
    var face = combined.faces[i];
    
    //console.log("Face #"+i);
    //console.log(face);
    var face_width = 0;
    var face_height = 0;
    
    // Vertical surfaces (walls)
    if(Math.abs(face.normal.x) == 1) {
      face_width = Math.abs(combined.vertices[face.a].z - combined.vertices[face.c].z);
    }
    if(Math.abs(face.normal.z) == 1) {
      face_width = Math.abs(combined.vertices[face.a].x - combined.vertices[face.c].x);
    }
    if(Math.abs(face.normal.x) == 1 || Math.abs(face.normal.z) == 1) {
      face_height = Math.abs(combined.vertices[face.a].y - combined.vertices[face.c].y);
      var texture = this.getWallTexture(face_width, face_height);
      materials.push(new THREE.MeshLambertMaterial( { color: this.colour, map:texture } ));
    
    }
    
    // Horizontal surfaces (roof)
    if(Math.abs(face.normal.y) == 1) {
      face_width = Math.abs(combined.vertices[face.a].x - combined.vertices[face.c].x);
      face_height = Math.abs(combined.vertices[face.a].z - combined.vertices[face.c].z);
      var texture = this.getRoofTexture(face_width, face_height);
      materials.push(new THREE.MeshPhongMaterial( { color: this.colour, map:texture } ));
    
    }
   
    //console.log("Pushing texture for face %i @ %ix%i:", i, face_width, face_height);
    //console.log(texture);
    face.materialIndex = i; /* And make sure we set the face to use the appropriate materialIndex (merged geometries apparently maintain their original materiaIndex, so without this step all of the building parts' faces only point at the first six textures!) */
  }
  
  var finalmesh = new THREE.Mesh( combined, new THREE.MeshFaceMaterial(materials));
  return finalmesh;
};

Building.prototype.getGroundMesh = function () {
  var ground_texture = this.getConcreteTexture(City.block.width, City.block.depth, 0x808080);
  var mesh = new THREE.Mesh(
    new THREE.CubeGeometry(City.block.width, 2, City.block.depth),
    new THREE.MeshPhongMaterial( { color: 0x808080, wireframe: false, map:ground_texture } )
  );
  mesh.receiveShadow = true;
  return mesh;
}


Building.prototype.getWallTexture = function (width, height) {
  width = width || 256;
  height = height || 256;
  
  // Procedurally generate a texture from a canvas element
  var concrete_texture = this.getConcreteTexture(width, height, this.colour);
  var canvas = concrete_texture.image;
  
  var ctx = canvas.getContext('2d');

  //ctx.fillStyle = "#ffd000";
/*  for(var i=0; i<width; i=i+5) {
    for(var j=0; j<height; j=j+10) {
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
  }*/

  for(var i=0; i<width; i=i+10) {
    for(var j=0; j<height; j=j+7) {
      ctx.fillStyle = "#"+(this.colour+0x0f0f0f).toString(16);
      ctx.fillRect(i, j+1, 3, 4);
      ctx.fillRect(i+5, j+1, 3, 4);
      ctx.fillStyle = "#"+(this.colour-0x0f0f0f).toString(16);
      ctx.fillRect(i+1, j+2, 3, 4);
      ctx.fillRect(i+6, j+2, 3, 4);
      if(Math.round(Math.random() * 4) == 1) {
          ctx.fillStyle = "#ffd000";
      }
      else {
        ctx.fillStyle = "#"+(this.colour-0x1f1f1f).toString(16);
      }
      ctx.fillRect(i+1, j+2, 2, 3);
      ctx.fillRect(i+6, j+2, 2, 3);
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
  return this.getConcreteTexture(width, height, this.colour);
};

Building.prototype.getConcreteTexture = function (width, height, colour) {
  width = width || 128;
  height = height || 128;
  colour = colour || this.colour;
  
  // Procedurally generate a texture from a canvas element
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = "#"+colour.toString(16);
  ctx.fillRect(0, 0, 128, 128);
  
  var basegreyscale = parseInt(colour.toString(16).substr(0,2), 16);
  
  for(var i=0; i<canvas.width; i++) {
    for(var j=0; j<canvas.height; j++) {
      alpha = 0.1;
    
      var greyscaleval = Math.round(Math.random() * (0x7f/20)) + basegreyscale;
      colour = (greyscaleval * 0x100) + greyscaleval;
      colour = (colour * 0x100) + greyscaleval;
    
      ctx.fillStyle = "#"+colour.toString(16);
      ctx.fillRect(i, j, 1, 1, alpha);
    }
  }
  
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