//yes, I did use format document.




import { CSM } from 'https://threejs.org/examples/jsm/csm/CSM.js'
import { OBJLoader } from 'https://threejs.org/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'https://threejs.org/examples/jsm/loaders/MTLLoader.js'
Physijs.scripts.worker = '/physiworker.js'
Physijs.scripts.ammo = '/ammo.js'

//PointerLock
/*
var PointerLockControls = function (t, o) { void 0 === o && (console.warn('THREE.PointerLockControls: The second parameter "domElement" is now mandatory.'), o = document.body), this.domElement = o, this.isLocked = !1; var e = this; this.minPolarAngle = 0, this.maxPolarAngle = Math.PI; var n, i = new THREE.Euler(0, 0, 0, "YXZ"), r = Math.PI / 2, a = new THREE.Vector3; document.body.addEventListener("mousemove", (function (o) { var n = o.movementX || o.mozMovementX || o.webkitMovementX || 0, a = o.movementY || o.mozMovementY || o.webkitMovementY || 0; i.setFromQuaternion(t.quaternion), i.y -= .002 * n, i.x -= .002 * a, i.x = Math.max(r - e.maxPolarAngle, Math.min(r - e.minPolarAngle, i.x)), t.quaternion.setFromEuler(i) })), this.dispose = function () { this.disconnect() }, this.getObject = function () { return t }, this.getDirection = (n = new THREE.Vector3(0, 0, -1), function (o) { return o.copy(n).applyQuaternion(t.quaternion) }), this.moveForward = function (o) { a.setFromMatrixColumn(t.matrix, 0), a.crossVectors(t.up, a), Player.position.addScaledVector(a, o), Player.__dirtyPosition = !0 }, this.moveRight = function (o) { a.setFromMatrixColumn(t.matrix, 0), Player.position.addScaledVector(a, o), Player.__dirtyPosition = !0 }, this.lock = function () { this.domElement.requestPointerLock() }, this.unlock = function () { document.exitPointerLock() } };
*/
var PointerLockControls = function ( camera, domElement ) {

	this.domElement = domElement;
	this.isLocked = false;
  var scope = this;
	// Set to constrain the pitch of the camera
	// Range is 0 to Math.PI radians
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	var euler = new THREE.Euler( 0, 0, 0, 'YXZ' );

	var PI_2 = Math.PI / 2;

	var vec = new THREE.Vector3();
  
	function onMouseMove( event ) {

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		euler.setFromQuaternion( camera.quaternion );

		euler.y -= movementX * 0.002;
		euler.x -= movementY * 0.002;

		euler.x = Math.max( PI_2 - scope.maxPolarAngle, Math.min( PI_2 - scope.minPolarAngle, euler.x ) );

		camera.quaternion.setFromEuler( euler );


	}
  document.body.addEventListener('mousemove',onMouseMove);


	this.dispose = function () {

		this.disconnect();

	};

	this.getObject = function () { // retaining this method for backward compatibility

		return camera;

	};

	this.getDirection = function () {

		var direction = new THREE.Vector3( 0, 0, - 1 );

		return function ( v ) {

			return v.copy( direction ).applyQuaternion( camera.quaternion );

		};

	}();

	this.moveForward = function ( distance ) {

		// move forward parallel to the xz-plane
		// assumes camera.up is y-up

		vec.setFromMatrixColumn( camera.matrix, 0 );

		vec.crossVectors( camera.up, vec );

	//	camera.position.addScaledVector( vec, distance );
  var v = Player.getLinearVelocity();
  v.addScaledVector(vec,distance*10);
  v.clamp(new THREE.Vector3(-10,-100,-10),new THREE.Vector3(10,60,10))
  Player.setLinearVelocity(v);
 // Player.position.addScaledVector(vec,distance);
 // Player.__dirtyPosition = true;
	};

	this.moveRight = function ( distance ) {

		vec.setFromMatrixColumn( camera.matrix, 0 );

	//	camera.position.addScaledVector( vec, distance );
  var v = Player.getLinearVelocity();
  v.addScaledVector(vec,distance*10);
  v.clamp(new THREE.Vector3(-10,-100,-10),new THREE.Vector3(10,60,10))
  Player.setLinearVelocity(v);
	};

	this.lock = function () {

		this.domElement.requestPointerLock();

	};

	this.unlock = function () {

	document.exitPointerLock();

	};

};


var camera, scene, renderer, controls, backgroundTexture, groundPlane, pMaterial, particleCount = 1800, particleSystem, ambient, jumping = false, spriteCranberryLogo, particles, keys = [], Player, sound, canMove = true, csm, particleSystem2, spriteCranberryLogoGreen, spriteCranberryLogoYellow, background, car = {}, inCar = false,doneLoading = false;
function init() {
  sound = new Audio();
  sound.src = 'sounds.mp3';
  sound.loop = true;
  spriteCranberryLogoGreen = new THREE.TextureLoader().load('spritelogogreen.png');
  background = new
  THREE.TextureLoader().load('background.jpg');
  spriteCranberryLogoYellow = new THREE.TextureLoader().load('spritelogoyellow.png');
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
  var loader = new THREE.CubeTextureLoader();
  backgroundTexture = loader.load(['background.jpg', 'background.jpg', 'background.jpg', 'background.jpg', 'background.jpg', 'background.jpg']);
  scene = new Physijs.Scene;
  scene.addEventListener('update', function () {
    // the scene's physics have finished updating
    scene.simulate(undefined, 2)
  });
  scene.setGravity(new THREE.Vector3(0, -30, 0))
  window["scene"] = scene;
  scene.background = backgroundTexture;
  renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.zIndex = 1;
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0'
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  csm = new CSM({
    parent: scene,
    mode: 'practical',
    maxFar: camera.far,
    camera: camera,
    shadowMapSize: 2048,
    lightIntensity: .5,
    cascades:4,
    lightNear:50,
    lightFar:500,
    margin:100,
    fade:true,
    lightDirection: new THREE.Vector3(1, -1, -1).normalize()
  });
  spriteCranberryLogo = new THREE.TextureLoader().load('spritelogo.webp');
  ambient = new THREE.AmbientLight(0xffffff, .1);
  scene.add(ambient);
  createSnow();
  createHouse();
  createPlatform();
  createPlatform1();
  createPlatform2();
  loadChristmasTree();
  createBox();
  createThing()
  var groundMat = Physijs.createMaterial(
    new THREE.MeshPhongMaterial({ map: spriteCranberryLogo }, 0),
    .8,
    .2
  )
  groundPlane = new Physijs.BoxMesh(new THREE.PlaneGeometry(500, 500, 1), groundMat, 0);
  groundPlane.receiveShadow = true;
  groundPlane.material.side = THREE.DoubleSide;
  groundPlane.rotation.x = Math.PI * 3.5
  groundPlane.position.y -= 1;
  scene.add(groundPlane);
  csm.setupMaterial(groundPlane.material);
  /*
  var beverage = new Physijs.CylinderMesh(new THREE.CylinderGeometry(.5,.5,1.5,32),new THREE.MeshPhongMaterial({map:spriteCranberryLogo}));
  beverage.castShadow = true;
  beverage.receiveShadow = true;
  scene.add(beverage);
  
  csm.setupMaterial(beverage.material);
  */
  Player = new Physijs.BoxMesh(new THREE.BoxGeometry(1, 2, 1), Physijs.createMaterial(new THREE.MeshBasicMaterial({ opacity: 0, transparent: true }),1,0));
  scene.add(Player);
  scene.add(camera);
  Player.position.set(3, 0, 3);
  Player.__dirtyPosition = true;
  spawnCranberryCar();
  controls = new PointerLockControls(camera, document.body);
  render();
}
function createHouse() {
  var obj = new Physijs.CylinderMesh(new THREE.CylinderGeometry(5, 5, 20, 32), new THREE.MeshPhongMaterial({ map: spriteCranberryLogo }), 0);
  obj.castShadow = true;
  obj.receiveShadow = true;
  obj.position.set(20, 5, 20);
  obj.__dirtyPosition = true;
  scene.add(obj);
}
function createBox() {
  var obj = new Physijs.BoxMesh(new THREE.BoxGeometry(3, 3, 3, 3), new THREE.MeshPhongMaterial({ map: spriteCranberryLogoYellow }), 0);
  obj.castShadow = true;
  obj.receiveShadow = true;
  obj.position.set(40, 0, 20);
  obj.__dirtyPosition = true;
  scene.add(obj);
}
function loadChristmasTree(){
  var mtlloader = new MTLLoader();
  var url = '12150_Christmas_Tree_V2_L2.mtl';
  mtlloader.load(url,function(materials){
    materials.preload();
  var loader = new OBJLoader();
  loader.setMaterials( materials );

  loader.load('12150_Christmas_Tree_V2_L2.obj',function(obj){
    /*
    for(var i = 0;i<obj.children.length;i++){
      obj.children[i].castShadow = true;
      obj.children[i].receiveShadow = true;
    }
    */
    //Super expensive to do shadows on tree :/
    obj.position.set(8,-1,8);
    obj.rotation.set(-Math.PI/2,0,0);
    obj.scale.set(.1,.1,.1);
    obj.castShadow = true;
    obj.receiveShadow = true;
    var ob = new Physijs.CylinderMesh(new THREE.CylinderGeometry(1,7,20,32), new THREE.MeshBasicMaterial({transparent:true,opacity:0}),0);
    ob.position.set(8,0,8)
    scene.add(ob);
    scene.add(obj);
    document.getElementById("overlay").style.display = 'none';
    doneLoading = true;
  },function(xhr){
    var percent = xhr.loaded/xhr.total*100;
    document.getElementById('loader').style.width = percent+'%';
  });
  });
}
function createPlatform() {
  var obj = new Physijs.CylinderMesh(new THREE.CylinderGeometry(5, 5, 12, 32), new THREE.MeshPhongMaterial({ map: spriteCranberryLogoGreen }), 0);
  obj.castShadow = true;
  obj.receiveShadow = true;
  obj.position.set(20, 4, -20);
  obj.__dirtyPosition = true;
  scene.add(obj);
}
function createPlatform1() {
  var obj = new Physijs.CylinderMesh(new THREE.CylinderGeometry(5, 5, 15, 32), new THREE.MeshPhongMaterial({ map: spriteCranberryLogo }), 0);
  obj.castShadow = true;
  obj.receiveShadow = true;
  obj.position.set(-20, 6, 20);
  obj.__dirtyPosition = true;
  scene.add(obj);
}
function createThing() {
  var obj = new Physijs.BoxMesh(new THREE.BoxGeometry(0, 10, 10, 0), new THREE.MeshPhongMaterial({ map: background}), 0);
  obj.castShadow = true;
  obj.receiveShadow = true;
  obj.position.set(-40, 4, 20);
  obj.__dirtyPosition = true;
  scene.add(obj);
}
function createPlatform2() {
  var obj = new Physijs.CylinderMesh(new THREE.CylinderGeometry(5, 5, 5, 32), new THREE.MeshPhongMaterial({ map: spriteCranberryLogo }), 0);
  obj.castShadow = true;
  obj.receiveShadow = true;
  obj.position.set(-20, 1, -20);
  obj.__dirtyPosition = true;
  scene.add(obj);
}

function spawnCranberryCar() {
  var car_material, wheel_material, wheel_geometry;
  // Car
  car_material = Physijs.createMaterial(
    new THREE.MeshPhongMaterial({ map: spriteCranberryLogo }),
    .8, // high friction
    .2 // low restitution
  );

  wheel_material = Physijs.createMaterial(
    new THREE.MeshPhongMaterial({ map: spriteCranberryLogoGreen }),
    .8, // high friction
    .5 // medium restitution
  );
  wheel_geometry = new THREE.CylinderGeometry(.5, .5, .5, 20, 32);

  car.body = new Physijs.BoxMesh(
    new THREE.CubeGeometry(3, 2, 2),
    car_material,
    1000
  );
  car.body.position.set(0,2.5,0);
  car.body.receiveShadow = car.body.castShadow = true;
  scene.add(car.body);

  car.wheel_fl = new Physijs.CylinderMesh(
    wheel_geometry,
    wheel_material,
    500
  );
  car.wheel_fl.rotation.x = Math.PI / 2;
  car.wheel_fl.position.set(-1.5, 1.5, 1.5);
  car.wheel_fl.receiveShadow = car.wheel_fl.castShadow = true;
  scene.add(car.wheel_fl);
  car.wheel_fl_constraint = new Physijs.DOFConstraint(
    car.wheel_fl, car.body, new THREE.Vector3(-1.5, 1.5, 1.5)
  );
  scene.addConstraint(car.wheel_fl_constraint);
  car.wheel_fl_constraint.setAngularLowerLimit({ x: 0, y: -Math.PI / 8, z: 1 });
  car.wheel_fl_constraint.setAngularUpperLimit({ x: 0, y: Math.PI / 8, z: 0 });

  car.wheel_fr = new Physijs.CylinderMesh(
    wheel_geometry,
    wheel_material,
    500
  );
  car.wheel_fr.rotation.x = Math.PI / 2;
  car.wheel_fr.position.set(-1.5, 1.5, -1.5);
  
  car.wheel_fr.receiveShadow = car.wheel_fr.castShadow = true;
  scene.add(car.wheel_fr);
  car.wheel_fr_constraint = new Physijs.DOFConstraint(
    car.wheel_fr, car.body, new THREE.Vector3(-1.5, 1.5, -1.5)
  );
  scene.addConstraint(car.wheel_fr_constraint);
  car.wheel_fr_constraint.setAngularLowerLimit({ x: 0, y: -Math.PI / 8, z: 1 });
  car.wheel_fr_constraint.setAngularUpperLimit({ x: 0, y: Math.PI / 8, z: 0 });

  car.wheel_bl = new Physijs.CylinderMesh(
    wheel_geometry,
    wheel_material,
    500
  );
  car.wheel_bl.rotation.x = Math.PI / 2;
  car.wheel_bl.position.set(1.5, 1.5, 1.5);
  car.wheel_bl.receiveShadow = car.wheel_bl.castShadow = true;
  scene.add(car.wheel_bl);
  car.wheel_bl_constraint = new Physijs.DOFConstraint(
    car.wheel_bl, car.body, new THREE.Vector3(1.5, 1.5, 1.5)
  );
  scene.addConstraint(car.wheel_bl_constraint);
  car.wheel_bl_constraint.setAngularLowerLimit({ x: 0, y: 0, z: 0 });
  car.wheel_bl_constraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 });

  car.wheel_br = new Physijs.CylinderMesh(
    wheel_geometry,
    wheel_material,
    500
  );
  car.wheel_br.rotation.x = Math.PI / 2;
  car.wheel_br.position.set(1.5, 1.5, -1.5);
  car.wheel_br.receiveShadow = car.wheel_br.castShadow = true;
  scene.add(car.wheel_br);
  car.wheel_br_constraint = new Physijs.DOFConstraint(
    car.wheel_br, car.body, new THREE.Vector3(1.5, 1.5, -1.5)
  );
  scene.addConstraint(car.wheel_br_constraint);
  car.wheel_br_constraint.setAngularLowerLimit({ x: 0, y: 0, z: 0 });
  car.wheel_br_constraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 });
}
function createSnow() {
  particleCount = 1800,
    particles = new THREE.Geometry(),
    pMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      blending: THREE.AdditiveBlending,
      transparent: true,
      map: spriteCranberryLogo,
    });
  for (var p = 0; p < particleCount; p++) {
    var pX = Math.random() * 250 - 125,
      pY = Math.random() * 250,
      pZ = Math.random() * 250 - 125,
      particle = new THREE.Vector3(pX, pY, pZ);
    particles.vertices.push(particle);
  }
  particleSystem = new THREE.Points(
    particles,
    pMaterial
  );
  particleSystem.sortParticles = true;
  particleSystem.position.y = 200;
  scene.add(particleSystem);
  particleSystem2 = new THREE.Points(
    particles, pMaterial
  );
  scene.add(particleSystem2);
  particleSystem2.position.y = 100;
  particleSystem2.rotation.y = Math.PI / 2;
}
window["createBeverage"] = function (x, y, z) {
  var chance = Math.random();
  if (chance > .5) {
    var beverage = new Physijs.CylinderMesh(new THREE.CylinderGeometry(.5, .5, 1.5, 32), new THREE.MeshPhongMaterial({ map: spriteCranberryLogo }));
  } else if (chance > .4){
    var beverage = new Physijs.CylinderMesh(new THREE.CylinderGeometry(.5, .5, 1.5, 32), new THREE.MeshPhongMaterial({ map: spriteCranberryLogoYellow }));
  } else {
    var beverage = new Physijs.CylinderMesh(new THREE.CylinderGeometry(.5, .5, 1.5, 32), new THREE.MeshPhongMaterial({ map: spriteCranberryLogoGreen }));
  }
  scene.add(beverage);
  beverage.castShadow = true;
  beverage.receiveShadow = true;
  csm.setupMaterial(beverage.material);
  beverage.position.set(x, y, z);
  beverage.__dirtyPosition = true;
}
function render() {
  requestAnimationFrame(render);
  if(doneLoading==true){
  particleSystem.position.y -= .1;
  if (particleSystem.position.y < -100) {
    particleSystem.position.y = 100;
  }
  particleSystem2.position.y -= .2;
  if (particleSystem2.position.y < -100) {
    particleSystem2.position.y = 100;
  }
  if (car != undefined) {

    if (keys['w']) {
      if (canMove == true) {
        controls.moveForward(.1);
      } else {

        car.wheel_bl_constraint.configureAngularMotor(2, 1, 0, 40, 2000);
        car.wheel_br_constraint.configureAngularMotor(2, 1, 0, 40, 2000);
        car.wheel_bl_constraint.enableAngularMotor(2);
        car.wheel_br_constraint.enableAngularMotor(2);
      }
    } else {
      if (keys['s'] == false||keys['s']==undefined) {
        car.wheel_bl_constraint.disableAngularMotor(2);
        car.wheel_br_constraint.disableAngularMotor(2);
      }
    }
    if (keys['a']) {
      if (canMove == true) {
        controls.moveRight(-.1);
      } else {
        car.wheel_fl_constraint.disableAngularMotor(1);
        car.wheel_fr_constraint.disableAngularMotor(1);
        car.wheel_fl_constraint.configureAngularMotor(1, -Math.PI / 8, Math.PI / 8, 3, 200);
        car.wheel_fr_constraint.configureAngularMotor(1, -Math.PI / 8, Math.PI / 8, 3, 200);
        car.wheel_fl_constraint.enableAngularMotor(1);
        car.wheel_fr_constraint.enableAngularMotor(1);
      }
    } else {
      
      if (keys['d'] == false) {

        car.wheel_fl_constraint.disableAngularMotor(1);
        car.wheel_fr_constraint.disableAngularMotor(1);

      }
    }
    if (keys['s']) {
      if (canMove == true) {
        controls.moveForward(-.1);
      } else {
        car.wheel_bl_constraint.configureAngularMotor(2, 1, 0, -20, 2000);
        car.wheel_br_constraint.configureAngularMotor(2, 1, 0, -20, 2000);
        car.wheel_bl_constraint.enableAngularMotor(2);
        car.wheel_br_constraint.enableAngularMotor(2);
      }
    }
    if (keys['d']) {
      if (canMove == true) {
        controls.moveRight(.1);
      } else {
        car.wheel_fl_constraint.disableAngularMotor(1);
        car.wheel_fr_constraint.disableAngularMotor(1);
        car.wheel_fl_constraint.configureAngularMotor(1, -Math.PI / 8, Math.PI / 8, -3, 200);
        car.wheel_fr_constraint.configureAngularMotor(1, -Math.PI / 8, Math.PI / 8, -3, 200);
        car.wheel_fl_constraint.enableAngularMotor(1);
        car.wheel_fr_constraint.enableAngularMotor(1);
      }
    } else {
      if (keys['a'] == false) {
        car.wheel_fl_constraint.disableAngularMotor(1);
        car.wheel_fr_constraint.disableAngularMotor(1);
      }
    }
    if (keys['q']) {
      if (inCar == false) {
        inCar = true;
        canMove = false;
      } else if (inCar == true) {
        Player.position.set(0, 12, 0);
        Player.__dirtyPosition = true;
        inCar = false;
        canMove = true;
      }
      keys['q']=false;
    }
    if (keys[' ']) {
      if (jumping == false) {
        jumping = true;
       // var currentVeloc = Player.getLinearVelocity();
        Player.applyCentralImpulse(new THREE.Vector3(0,50,0))
       // Player.setLinearVelocity(new THREE.Vector3(currentVeloc.x, 20, currentVeloc.z));
        setTimeout(function () {
       //   Player.setLinearVelocity(new THREE.Vector3(0, 0, 0));
     //  var currentVeloc = Player.getLinearVelocity();
       Player.applyCentralImpulse(new THREE.Vector3(0,0,0))
          jumping = false;
        }, 1000)
      }
    }


  }

  if (Player.position.y < -10) {
    Player.position.set(10, 10, 10);
    Player.__dirtyPosition = true;
  }
  if (inCar == true) {
    Player.position.set(car.body.position.x, car.body.position.y, car.body.position.z);
    Player.position.y += 2;
    Player.__dirtyPosition = true;
  }
  scene.simulate();

  camera.position.x = Player.position.x;
  camera.position.y = Player.position.y + 1;
  camera.position.z = Player.position.z;



  csm.update();
  renderer.render(scene, camera);
  }
}

init();
window.addEventListener('resize', function () {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
document.body.addEventListener('mouseup', function () {
  controls.lock();
  sound.play();
});
document.body.addEventListener('keydown', function (e) {
  keys[e.key] = true;

});
document.body.addEventListener('keyup', function (e) {
  keys[e.key] = false;
  if (e.key == 'e') {
    createBeverage(0, 10, 0);
  }
})


