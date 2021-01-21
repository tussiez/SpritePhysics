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
  v.addScaledVector(vec,distance);
  Player.setLinearVelocity(v);
 // Player.position.addScaledVector(vec,distance);
 // Player.__dirtyPosition = true;
	};

	this.moveRight = function ( distance ) {

		vec.setFromMatrixColumn( camera.matrix, 0 );

	//	camera.position.addScaledVector( vec, distance );
  Player.position.addScaledVector(vec,distance);
  Player.__dirtyPosition = true;
	};

	this.lock = function () {

		this.domElement.requestPointerLock();

	};

	this.unlock = function () {

	document.exitPointerLock();

	};

};
