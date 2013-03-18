City = {
  
  scene: null,
  
  /* City dimensions, in blocks */
  width_blocks: 0,
  depth_blocks: 0,
  height_blocks: 1,
  
  /* Element dimensions */
  road_width: 25,
  road_colour: 0x202020,
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
        
        var building = this.randomBuilding(); // Create new random building
        this.buildings[x][z] = building;      // Push building into the City building array
        
        var blockoffset = this.blockOffsetByIndex(x, z);
        
        var centrepoint = {
          x: blockoffset.x - (this.width/2),
          z: blockoffset.z - (this.depth/2)
        };
        
        /* Building */
        building_mesh = building.getBuildingMesh();
        building_mesh.translateX(centrepoint.x);
        building_mesh.translateZ(centrepoint.z);
        scene.add(building_mesh);
        
        /* Ground */
        ground_mesh = building.getGroundMesh();
        ground_mesh.translateX(centrepoint.x);
        ground_mesh.translateZ(centrepoint.z);
        scene.add(ground_mesh);
        
        /* Roads */
        if(x < this.width_blocks-1) {
          var road_texture = this.getRoadTexture(this.road_width, this.block.width+(this.road_width*2), this.road_colour);
          mesh = new THREE.Mesh(
            new THREE.CubeGeometry(this.road_width, 1, this.block.width+(this.road_width*2)),
            new THREE.MeshPhongMaterial( { color: this.road_colour, wireframe: false, map: road_texture } )
          );
          mesh.translateX(centrepoint.x + (this.block.width/2) + (this.road_width/2));
          mesh.translateZ(centrepoint.z);
          mesh.translateY(-0.5);
          mesh.receiveShadow = true;
          scene.add( mesh );
        }
        if(z < this.depth_blocks-1) {
          var road_texture = this.getRoadTexture(this.block.depth+(this.road_width*2), this.road_width, this.road_colour);
          mesh = new THREE.Mesh(
            new THREE.CubeGeometry(this.block.depth+(this.road_width*2), 1, this.road_width),
            new THREE.MeshPhongMaterial( { color: this.road_colour, wireframe: false, map: road_texture } )
          );
          mesh.translateX(centrepoint.x);
          mesh.translateZ(centrepoint.z + (this.block.depth/2) + (this.road_width/2));
          mesh.translateY(-0.5);
          mesh.receiveShadow = true;
          scene.add( mesh );
        }
        
        /* Streetlights */
        
        var streetlights = [];
        
        if(z != 0 || x != 0) {
          streetlights.push([
            new THREE.Vector3(blockoffset.x - (this.block.width/2) - (this.width/2), 0, blockoffset.z - (this.block.depth/2) - (this.depth/2)),
            new THREE.Vector3(0, -Math.PI/4, 0)
          ]);
        }
        if(z != 0) {
          streetlights.push([
            new THREE.Vector3(blockoffset.x - (this.width/2), 0, blockoffset.z - (this.block.depth/2) - (this.depth/2)),
            new THREE.Vector3(0, -Math.PI/2, 0)
          ]);
        }
        if(z != 0 || x != this.width_blocks-1) {
          streetlights.push([
            new THREE.Vector3(blockoffset.x + (this.block.width/2) - (this.width/2), 0, blockoffset.z - (this.block.depth/2) - (this.depth/2)),
            new THREE.Vector3(0, -Math.PI*3/4, 0)
          ]);
        }
        
        if(x != 0) {
          streetlights.push([
            new THREE.Vector3(blockoffset.x - (this.block.width/2) - (this.width/2), 0, blockoffset.z - (this.depth/2)),
            new THREE.Vector3(0, 0, 0)
          ]);
        }
        if(x != this.width_blocks-1) {
          streetlights.push([
            new THREE.Vector3(blockoffset.x + (this.block.width/2) - (this.width/2), 0, blockoffset.z - (this.depth/2)),
            new THREE.Vector3(0, Math.PI, 0)
          ]);
        }
          
        if(z != this.depth_blocks-1 || x != 0) {
          streetlights.push([
            new THREE.Vector3(blockoffset.x - (this.block.width/2) - (this.width/2), 0, blockoffset.z + (this.block.depth/2) - (this.depth/2)),
            new THREE.Vector3(0, Math.PI/4, 0)
          ]);
        }
        if(z != this.depth_blocks-1) {
          streetlights.push([
            new THREE.Vector3(blockoffset.x - (this.width/2), 0, blockoffset.z + (this.block.depth/2) - (this.depth/2)),
            new THREE.Vector3(0, Math.PI/2, 0)
          ]);
        }
        if(z != this.depth_blocks-1 || x != this.width_blocks-1) {
          streetlights.push([
            new THREE.Vector3(blockoffset.x + (this.block.width/2) - (this.width/2), 0, blockoffset.z + (this.block.depth/2) - (this.depth/2)),
            new THREE.Vector3(0, Math.PI*3/4, 0)
          ]);
        }
        
        for(var i=0; i<streetlights.length; i++) {
          placeholder = this.getStreetlightMesh(
            streetlights[i][0],
            streetlights[i][1]
          );
          scene.add(placeholder);
        }
        
        if(x > 0 && z > 0) {
          /*var fake_streetlamp = new THREE.PointLight( 0xffd000, 1, 60);
          fake_streetlamp.position.set(blockoffset.x - (this.block.width/2) - (this.road_width/2) - (this.width/2), 5, blockoffset.z - (this.block.depth/2) - (this.road_width/2) - (this.depth/2));
          scene.add(fake_streetlamp);*/
          
          /*placeholder = new THREE.Mesh(new THREE.CubeGeometry(2, 2, 2), new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: false }));
          placeholder.translateX(blockoffset.x - (this.block.width/2) - (this.road_width/2) - (this.width/2));
          placeholder.translateY(10);
          placeholder.translateZ(blockoffset.z - (this.block.depth/2) - (this.road_width/2) - (this.depth/2));
          scene.add(placeholder);*/
  
        }
        
  
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
    return newbuilding;
  },

  getStreetlightMesh: function (position, rotation) {
    var light = new THREE.Mesh(new THREE.CubeGeometry(2, 0.5, 1), new THREE.MeshBasicMaterial( { color: 0xffd000, wireframe: false }));
    light.translateY(10);

    var stand_top = new THREE.Mesh(new THREE.CubeGeometry(4, 0.5, 1), new THREE.MeshLambertMaterial( { color: 0x404040, wireframe: false }));
    stand_top.translateX(1);
    stand_top.translateY(10.5);

    var stand_body = new THREE.Mesh(new THREE.CubeGeometry(0.5, 10.5, 0.5), new THREE.MeshLambertMaterial( { color: 0x404040, wireframe: false }));
    stand_body.translateX(2.75);
    stand_body.translateY(5.25);
    
    var streetlight = new THREE.Object3D();
    streetlight.add(light);
    streetlight.add(stand_top);
    streetlight.add(stand_body);
    
    if(position) {
      streetlight.translateX(position.x);
      streetlight.translateY(position.y)
      streetlight.translateZ(position.z);
    }
    if(rotation) {
      streetlight.rotation.setX(rotation.x).setY(rotation.y).setZ(rotation.z);
    }
    return streetlight;
  },
  
  getRoadTexture: function(width, depth, colour) {
    var texture = Utility.getCanvasTexture(width, depth, colour);
    var canvas = texture.image;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = "#ffffff";
    dashlength = 5;
    dashspace = 5;
    if(width >= depth) {
      //ctx.fillRect(0, (depth/2)-1, width, 2, 1);
      for(i=0; i<=width; i+=dashlength+dashspace) { // Dashed lines along road
        ctx.fillRect(i, (depth/2)-1, dashlength, 2, 1);
      }
    }
    if(width <= depth) {
      //ctx.fillRect((width/2)-1, 0, 2, depth, 1);
      for(i=0; i<=depth; i+=dashlength+dashspace) { // Dashed lines along road
        ctx.fillRect((width/2)-1, i, 2, dashlength, 1);
      }
    }
    
    ctx.fillStyle = "#"+colour.toString(16);
    ctx.strokeStyle = '#ffffff';
    ctx.fillRect(0, 0, this.road_width, this.road_width, 1);
    
    //ctx.moveTo();
    
    //ctx.strokeRect(0, 0, this.road_width, this.road_width, 1);
    
    ctx.fillRect(width-this.road_width, depth-this.road_width, this.road_width, this.road_width, 1);
    
    //ctx.strokeRect(width-this.road_width, depth-this.road_width, this.road_width, this.road_width, 1);
    
    return texture;
  }
};


function Building(scene, max_width, max_depth, max_height) {
  
  this.scene = scene;
  this.pavement_width = 5;
  this.min_part_width = 0.6;
  this.min_part_height = 0.5;
  this.min_part_depth = 0.6;
  
  var greyscaleval = Math.round(Math.random() * 0x3f) + 60;
  var colour = (greyscaleval * 0x10000) + (greyscaleval * 0x100) + greyscaleval;

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
  
    w = Utility.quantiseValue(w, 10);
    h = Utility.quantiseValue(h, 7);
    d = Utility.quantiseValue(d, 10);
    
    remaining_x = this.avail_width-w;
    remaining_z = this.avail_depth-d;
    
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
    
    // Correct rear face UVs so that textures wrap correctly
    var geometry = new THREE.CubeGeometry(part.width, part.height, part.depth);
    var reversedUVs = [new THREE.Vector2(1, 1), new THREE.Vector2(1, 0), new THREE.Vector2(0, 0), new THREE.Vector2(0, 1)];
    geometry.faceVertexUvs[0][5] = reversedUVs;
    geometry.faceVertexUvs[0][3] = reversedUVs;
    geometry.faceVertexUvs[0][1] = reversedUVs;

    var mesh = new THREE.Mesh(geometry);

    mesh.translateX(part.x);
    mesh.translateZ(part.z);
    mesh.translateY(part.y);
    
    this.partMeshes.push(mesh);
  }
  
  this.colour = colour;
};

Building.prototype = {
  getBuildingMesh: function () {
    var combined = new THREE.Geometry();
    
    for(var i=0; i<this.partMeshes.length; i++) {
      mesh = this.partMeshes[i];
      
      THREE.GeometryUtils.merge( combined, mesh );
    }
    
    combined = this.resolveIntersectingFaces(combined);
    combined.receiveShadow = true;
    return this.textureBuilding(combined);
  },
  
  resolveIntersectingFaces: function (combined) {
    
    for(var i=0; i<combined.faces.length; i++) {    // Compare every face
      var f1 = combined.faces[i];
      for(var j=i+1; j<combined.faces.length; j++) {  // to every other face
        var f2 = combined.faces[j];
        if(f1.normal.x == f2.normal.x && f1.normal.y == f2.normal.y && f1.normal.z == f2.normal.z) {  // Find faces on the same sides of different parts (N/E/W/S/top/bottom)
          for(var d=0; d<3; d++) {
            var dim = ['x', 'y', 'z'][d];
            if(Math.abs(f1.normal[dim]) == 1 && combined.vertices[f1.a][dim] == combined.vertices[f2.a][dim]) { // Check they're in the same plane
              if(dim == 'x') {
                var otherdim = 'z';
              }
              else if(dim == 'z') {
                var otherdim = 'x';
              }
              var f1_dim_vals = [combined.vertices[f1.a][otherdim], combined.vertices[f1.b][otherdim], combined.vertices[f1.c][otherdim], combined.vertices[f1.d][otherdim]];
              var f2_dim_vals = [combined.vertices[f2.a][otherdim], combined.vertices[f2.b][otherdim], combined.vertices[f2.c][otherdim], combined.vertices[f2.d][otherdim]];
              var f1_max = Math.max.apply(null, f1_dim_vals);
              var f1_min = Math.min.apply(null, f1_dim_vals);
              var f2_max = Math.max.apply(null, f2_dim_vals);
              var f2_min = Math.min.apply(null, f2_dim_vals);
              
              //console.log("Candidate overlap faces ("+dim+"):", f1_dim_vals, f2_dim_vals);
              //console.log("Edges ("+otherdim+"):", f1_min, f1_max, f2_min, f2_max);
              
              if((f1_max >= f2_min && f2_max >= f1_min) || (f2_max >= f1_min && f1_max >= f2_min)) {  // Find overlap
                //console.log("Overlap found!", dim ,f1, f2);
                
                if(dim == 'x' || dim == 'z') {  // Vertical faces are overlapping (walls)
                  var f1_height = Math.max.apply(null, [combined.vertices[f1.a].y, combined.vertices[f1.b].y, combined.vertices[f1.c].y, combined.vertices[f1.d].y]);
                  var f2_height = Math.max.apply(null, [combined.vertices[f2.a].y, combined.vertices[f2.b].y, combined.vertices[f2.c].y, combined.vertices[f2.d].y]);
                  if(f1_min <= f2_min && f1_max >= f2_max)  { // f2 is inside f1
                    if(f1_height >= f2_height) { // f2 is completely inside f1, so just delete the whole face f2
                      combined.faces.splice(j,1);
                      j--;
                    }
                    else {  // f2 poking through f1's top
                      combined = this.moveFaceEdgeTo(combined, j, 'y', 0, f1_height);
                    }
                  }
                  else if(f2_min <= f1_min && f2_max >= f1_max)  { // f1 is inside f2
                    if(f2_height >= f1_height) { // f1 is completely inside f2, so just delete the whole face f1
                      combined.faces.splice(i,1);
                      i--;
                    }
                    else {  // f1 poking through f2's top
                      combined = this.moveFaceEdgeTo(combined, i, 'y', 0, f2_height);
                    }
                  }
                  else {  // side overlap
                    if(f1_max >= f2_max && f1_min >= f2_min) {  // f1 is on the right
                      if(f1_height >= f2_height) {  // f1 is taller
                        combined = this.moveFaceEdgeTo(combined, j, otherdim, f2_max, f1_min);
                      }
                      else {  // f2 is taller
                        combined = this.moveFaceEdgeTo(combined, i, otherdim, f1_min, f2_max);
                      }
                    }
                    else if(f1_max <= f2_max && f1_min <= f2_min) { // f2 is on the right
                      if(f1_height >= f2_height) {  // f1 is taller
                        combined = this.moveFaceEdgeTo(combined, j, otherdim, f2_min, f1_max);
                      }
                      else {  // f2 is taller
                        combined = this.moveFaceEdgeTo(combined, i, otherdim, f1_max, f2_min);
                      }
                    }
                  }
                }
                else {  // Horizontal faces overlapping (floor/ceiling)
                  
                }
              }
            }
          }
        }
      }
    }
    
    return combined;
  },
  
  textureBuilding: function (combined) {
    
    var materials = [];
    
    for(var i=0; i<combined.faces.length; i++) {
      var face = combined.faces[i];
      
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
        materials.push(new THREE.MeshLambertMaterial( { color: this.colour, map:this.getWallTexture(face_width, face_height) } ));
      }
      
      // Horizontal surfaces (roof)
      if(Math.abs(face.normal.y) == 1) {
        face_width = Math.abs(combined.vertices[face.a].x - combined.vertices[face.c].x);
        face_height = Math.abs(combined.vertices[face.a].z - combined.vertices[face.c].z);
        materials.push(new THREE.MeshPhongMaterial( { color: this.colour, map:this.getRoofTexture(face_width, face_height) } ));
      }
     
      face.materialIndex = i; /* And make sure we set the face to use the appropriate materialIndex (merged geometries apparently maintain their original materiaIndex, so without this step all of the building parts' faces only point at the first six textures!) */
    }
    
    var finalmesh = new THREE.Mesh( combined, new THREE.MeshFaceMaterial(materials));
    return finalmesh;
  },

  moveFaceEdgeTo: function (mesh, faceindex, dim, source, target) {
    var face = mesh.faces[faceindex];
    var vertex_labels = ['a','b','c','d'];
    
    for(var v=0; v<vertex_labels.length; v++) {
      var vertex_label = vertex_labels[v];
      var vertex = mesh.vertices[face[vertex_label]];
      if(vertex[dim] == source) {
        var newvertex = new THREE.Vector3(vertex.x,vertex.y,vertex.z);
        newvertex[dim] = target;
        var newindex = mesh.vertices.push(newvertex)-1;
        face[vertex_label] = newindex;
      }
    }
    
    return mesh;
  },

  getGroundMesh: function () {
    var ground_texture = this.getConcreteTexture(City.block.width, City.block.depth, 0x808080);
    var mesh = new THREE.Mesh(
      new THREE.CubeGeometry(City.block.width, 2, City.block.depth),
      new THREE.MeshPhongMaterial( { color: 0x808080, wireframe: false, map:ground_texture } )
    );
    mesh.receiveShadow = true;
    return mesh;
  },

  getWallTexture: function (width, height) {
    width = width || 256;
    height = height || 256;
    
    // Procedurally generate a texture from a canvas element
    var texture = this.getConcreteTexture(width, height, this.colour);
    var canvas = texture.image;
    var ctx = canvas.getContext('2d');
  
    for(var i=0; i<width; i=i+10) {
      for(var j=0; j<height; j=j+7) {
        ctx.fillStyle = "#"+(this.colour-0x0f0f0f).toString(16);
        ctx.fillRect(i, j+1, 3, 4);
        ctx.fillRect(i+5, j+1, 3, 4);
        ctx.fillStyle = "#"+(this.colour+0x0f0f0f).toString(16);
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
    
    return texture;
  },

  getRoofTexture: function (width, height) {
    return this.getConcreteTexture(width, height, this.colour);
  },

  getConcreteTexture: function (width, height, colour) {
    width = width || 128;
    height = height || 128;
    colour = colour || this.colour;
    
    // Procedurally generate a texture from a canvas element
    var texture = Utility.getCanvasTexture(width, height, colour);
    var canvas = texture.image;
    var ctx = canvas.getContext('2d');
    
    var basegreyscale = parseInt(colour.toString(16).substr(0,2), 16);
    
    for(var i=0; i<canvas.width; i++) {
      for(var j=0; j<canvas.height; j++) {
        alpha = 0.1;
        var greyscaleval = Math.round(Math.random() * (0x7f/20)) + basegreyscale;
        colour = (greyscaleval * 0x10000) + (greyscaleval * 0x100) + greyscaleval;
        ctx.fillStyle = "#"+colour.toString(16);
        ctx.fillRect(i, j, 1, 1, alpha);
      }
    }
    
    return texture;
  },

  getDemoTexture: function (width, height) {
    width = width || 256;
    height = height || 256;
  
    // Procedurally generate a texture from a canvas element
    var texture = Utility.getCanvasTexture(width, height, this.colour);
    var canvas = texture.image;
    var ctx = canvas.getContext('2d');
    
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
    
    return texture;
  }
}