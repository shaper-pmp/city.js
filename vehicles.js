function Helicopter(scene, showPath, showSpotLightPointer) {
  
  showPath = showPath || false;
  showSpotLightPointer = showSpotLightPointer || false;
  
  this.scene = scene;
  
  this.route = [
    new THREE.Vector3(0, 210, 0),
    new THREE.Vector3(100, 250, 200),
    new THREE.Vector3(-50, 350, 300),
    new THREE.Vector3(-230, 210, -45),
    new THREE.Vector3(-180, 180, -60),
    new THREE.Vector3(160, 100, -70),
    new THREE.Vector3(170, 80, -80),
    new THREE.Vector3(160, 50, -350),
    new THREE.Vector3(-200, 200, -375)    
  ];
  this.routeGeometry = new THREE.Geometry();
  this.routeGeometry.vertices = this.route;
  this.routeMaterial = new THREE.LineBasicMaterial( { color: 0x00ff00, linewidth: 3 } );
  this.routeLine = new THREE.Line(this.routeGeometry, this.routeMaterial);
  this.splineInterpolateRoute(this.route, this.route.length*10);
  if(showPath) {
    this.scene.add(this.routeLine);
  }
  
  this.destination = 1;
  this.prev_destination = 0;
  this.position = new THREE.Vector3(this.route[this.prev_destination].x, this.route[this.prev_destination].y, this.route[this.prev_destination].z);
  this.dimensions = new THREE.Vector3(6, 6, 12);
  this.colour = 0x0000f0;
  
  this.speed = 10;
  
  this.model = new THREE.Object3D();
  this.spotLight = null;        // Pointer to spotlight (child of model) for convenience when targeting spotlight
  this.spotLightTarget = null;  // Invisible spotlight target object - always exactly 10 units below model, regardless of model's rotation (used as target to keep spotlight pointing directly downwards)
  
  this.init();
  this.spotLight.target = this.spotLightTarget;
  this.spotLightTarget.visible = showSpotLightPointer;
}

Helicopter.prototype.init = function () {

  /* Heli body*/
  var heli_body_material = new THREE.MeshPhongMaterial({ color: this.colour });
  var heli_body_geometry = new THREE.CubeGeometry(this.dimensions.x*2/3, this.dimensions.y, this.dimensions.z/3);
  this.heli_body_mesh = new THREE.Mesh(heli_body_geometry, heli_body_material);
  this.model.add(this.heli_body_mesh);
  
  var heli_tail_geometry = new THREE.CubeGeometry(this.dimensions.x/6, this.dimensions.y/2, this.dimensions.z*2/3);
  this.heli_tail_mesh = new THREE.Mesh(heli_tail_geometry, heli_body_material);
  this.heli_tail_mesh.translateY((this.dimensions.y/2)-(heli_tail_geometry.height/2));
  this.heli_tail_mesh.translateZ(-this.dimensions.z/2);
  this.model.add(this.heli_tail_mesh);
  
  var heli_tail_fin_shape = new THREE.Shape();
  var points = [
    new THREE.Vector2(0,0),
    new THREE.Vector2(this.dimensions.x*2/3,0),
    new THREE.Vector2(this.dimensions.x*2/3,this.dimensions.x*2/3)
  ];
  heli_tail_fin_shape = new THREE.Shape(points);
  
  var heli_tail_fin_geometry = new THREE.ExtrudeGeometry(heli_tail_fin_shape, {amount:1, material:heli_body_material, extrudeMaterial:0, bevelEnabled:false,  });
  
  this.heli_tail_fin_mesh = new THREE.Mesh(heli_tail_fin_geometry, heli_body_material);
  this.heli_tail_fin_mesh.rotation.y = Math.PI/2;
  this.heli_tail_fin_mesh.translateZ((-this.dimensions.z*2/3)+(this.dimensions.x*2/6));
  this.heli_tail_fin_mesh.translateX(-0.5);
  this.model.add(this.heli_tail_fin_mesh);

  /* Blades */
  var heli_blades_material = new THREE.MeshPhongMaterial({ color: 0x808080, transparent: true, opacity: 0.66, side: THREE.DoubleSide });
  var heli_blades_geometry = new THREE.CircleGeometry(this.dimensions.z*2/3);
  this.heli_blades_mesh = new THREE.Mesh(heli_blades_geometry, heli_blades_material);
  this.heli_blades_mesh.rotation.x = -Math.PI/2;
  this.heli_blades_mesh.translateY((this.dimensions.y/2)+1);
  this.model.add(this.heli_blades_mesh);
  
  var heli_tail_blades_geometry = new THREE.CircleGeometry(this.dimensions.z/6);
  this.heli_tail_blades_mesh = new THREE.Mesh(heli_tail_blades_geometry, heli_blades_material);
  this.heli_tail_blades_mesh.rotation.y = -Math.PI/2;
  this.heli_tail_blades_mesh.translateZ(-this.dimensions.z*4.5/6);
  this.heli_tail_blades_mesh.translateX((this.dimensions.x/6/2)+0.5);
  this.heli_tail_blades_mesh.translateY((this.dimensions.y/3));
  this.model.add(this.heli_tail_blades_mesh);
  

  /* Spotlight */
  this.spotLight = new THREE.SpotLight(0xf0f0ff);
  this.spotLight.translateY(-5);
  this.spotLight.intensity = 10;
  this.spotLight.distance = 500;
  this.spotLight.castShadow = true;
  //this.spotLight.shadowCameraVisible = true;
  this.model.add(this.spotLight);
  
  /* Ambient light above helicopter */
  var ambientLight = new THREE.SpotLight(0xf0f0ff);
  ambientLight.intensity = 1;
  ambientLight.distance = 250;
  this.model.add(ambientLight);
  
  /* Move model to its position */
  this.model.translateX(this.position.x);
  this.model.translateY(this.position.y);
  this.model.translateZ(this.position.z);

  /* Add model to scene */
  this.scene.add(this.model);
  

  /* Add fake object for spotlight to point at */
  var heli_spotlight_target_geometry = new THREE.CubeGeometry(1, 1, 1);
  this.spotLightTarget = new THREE.Mesh(heli_spotlight_target_geometry, new THREE.MeshPhongMaterial({ color: 0x00ff00 }));
  this.spotLightTarget.translateX(this.position.x);
  this.spotLightTarget.translateY(this.position.y-10);
  this.spotLightTarget.translateZ(this.position.z);
  this.scene.add(this.spotLightTarget);
};

/* Move the helicopter one step along its path to its next destination (route node) */
Helicopter.prototype.step = function() {
  //console.log("Destination: %i", this.destination, this.route[this.destination]);
  var from = this.route[this.prev_destination];
  var to = this.route[this.destination];

  //console.log("From (%i):", this.prev_destination, from);
  //console.log("To (%i):", this.destination, to);

  var diff = to.clone();
  diff.sub(this.position);
  //console.log("Diff: ", diff);
  
  var move = to.clone();
  move.sub(from);
  move.divideScalar(100/this.speed);
  //console.log("Move: ", move);  
  
  if(Math.abs(diff.x) <= Math.abs(move.x) && Math.abs(diff.z) <= Math.abs(move.z) && Math.abs(diff.y) <= Math.abs(move.y)) {
    move = diff.clone();  /* Just move the object the required remaining distance to exactly hit its previous destination, to make the maths easier */ 
    this.prev_destination = this.destination;
    this.destination = (this.destination + 1) % this.route.length;
    
    this.model.lookAt(this.route[this.destination]);
    //console.log("Retargeting to destination %i", this.destination);
    
  }

  this.position.add(move);
  this.model.position.add(move);
  this.spotLightTarget.position.add(move);
};

/* Convert a rough series of waypoints into a nice, smooth spline curve that passes through (or near) the same points */
Helicopter.prototype.splineInterpolateRoute = function(vertices, numdesiredpoints) {
  /* Convert rough route control points to a nice, smooth spline curve */
  var spline = new THREE.Spline(vertices);
  spline.points.push(spline.points[0].clone()); 
  
  this.routeGeometry = new THREE.Geometry();
  
  for (i = 0; i < numdesiredpoints; i++) {
    var position = spline.getPoint((1/numdesiredpoints)*i);
    this.routeGeometry.vertices[ i ] = new THREE.Vector3( position.x, position.y, position.z );
  }
  this.routeLine = new THREE.Line(this.routeGeometry, this.routeMaterial);
  
  this.route = this.routeLine.geometry.vertices;
}