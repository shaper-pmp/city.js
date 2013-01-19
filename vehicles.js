function Helicopter(scene) {
  
  this.scene = scene;
  
  this.route = [
/*    new THREE.Vector3(200, 250, 200),
    new THREE.Vector3(-200, 250, 200),
    new THREE.Vector3(-200, 250, -200),
    new THREE.Vector3(200, 250, -200)*/

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
  this.destination = 1;
  this.prev_destination = 0;
  this.position = new THREE.Vector3(this.route[this.prev_destination].x, this.route[this.prev_destination].y, this.route[this.prev_destination].z);
  this.dimensions = new THREE.Vector3(5, 5, 5);
  this.colour = 0xff0000;
  
  this.speed = 10;
  
  this.geometry = new THREE.CubeGeometry(this.dimensions.x, this.dimensions.y, this.dimensions.z);
  this.mesh = new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial({ color: this.colour }));
  this.mesh.translateX(this.position.x);
  this.mesh.translateY(this.position.y);
  this.mesh.translateZ(this.position.z);
  this.scene.add(this.mesh);
  
  /* Add fake object for spotlight to point at */
  this.spotlighttarget = new THREE.CubeGeometry(1, 1, 1);
  this.fakemesh = new THREE.Mesh(this.spotlighttarget, new THREE.MeshLambertMaterial({ color: 0x00ff00, opacity: 0.1 }));
  this.fakemesh.translateX(this.position.x);
  this.fakemesh.translateY(this.position.y-10);
  this.fakemesh.translateZ(this.position.z);
  this.scene.add(this.fakemesh);

  this.spotLight = new THREE.SpotLight(0xf0f0ff);
  this.spotLight.position.set(this.position.x, this.position.y, this.position.z);
  this.spotLight.intensity = 10;
  this.spotLight.distance = 500;
  this.spotLight.target = this.fakemesh;
  this.spotLight.castShadow = true;
  //this.spotLight.shadowCameraVisible = true;
  this.scene.add(this.spotLight);
  
  this.ambientLight = new THREE.SpotLight(0xf0f0ff);
  this.ambientLight.position.set(this.position.x, this.position.y+5, this.position.z);
  this.ambientLight.intensity = 1;
  this.ambientLight.distance = 250;
  this.scene.add(this.ambientLight);
  
  
  /* Convert rough route control points to a nice, smooth spline curve */
  var spline = new THREE.Spline( this.route );
  spline.points.push(spline.points[0].clone());
  //console.log(spline);
  
  var material = new THREE.LineBasicMaterial( { color: 0x00ff00, opacity: 1, linewidth: 3 } );
  var splineGeometry = new THREE.Geometry();
  var numdesiredpoints = this.route.length*10;
  for (i = 0; i < numdesiredpoints; i++)
  {
    var position = spline.getPoint((1/numdesiredpoints)*i);
    splineGeometry.vertices[ i ] = new THREE.Vector3( position.x, position.y, position.z );
  }
  var line = new THREE.Line( splineGeometry,  material );
  
  this.route = line.geometry.vertices;
  //console.log(line);
  //scene.add( line );
}

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
    this.prev_destination = this.destination;
    this.destination = (this.destination + 1) % this.route.length;
    move = diff.clone();
    //console.log("Retargeting to destination %i", this.destination);
  }

  this.position.add(move);
    //console.log("New pos: ", this.position);
    
  this.mesh.translateX(move.x);
  this.mesh.translateY(move.y);
  this.mesh.translateZ(move.z);

  this.fakemesh.translateX(move.x);
  this.fakemesh.translateY(move.y-10);
  this.fakemesh.translateZ(move.z);
    
  this.spotLight.position.set(this.position.x, this.position.y, this.position.z);
  this.ambientLight.position.set(this.position.x, this.position.y+5, this.position.z);
  
};