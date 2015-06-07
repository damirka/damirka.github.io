// this module requres ThreeJS library

Game.GraphicsModule = Game.Module.extend({
  init: function() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    this.camera.position.z = 20;
    this.camera.position.x = 0;
    this.camera.position.y = -50;
    this.camera.lookAt(new THREE.Vector3(0, 100, -150));

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.shadowMapEnabled = true;

    this.renderer.setSize(this.size.width, this.size.height);
    this.container.appendChild(this.renderer.domElement);

    this.wireframe = false;

    this.bindCameraMove();
    this.addClickEvent();
    this.addFog();
    this.addGroundTexture();
    // this.addCameraHelper();
  },
  addCameraHelper: function() {
    cameraHelper = new THREE.CameraHelper(this.camera);
    this.scene.add(cameraHelper);
  },
  addGroundTexture: function() {

    var texture = THREE.ImageUtils.loadTexture("sources/textures/grasslight-big.jpg");

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);

    var geometry = new THREE.PlaneBufferGeometry(this.mapSize.width + 10, this.mapSize.height + 10, 32);
    var material = new THREE.MeshBasicMaterial({
      color: 0x050505,
      side: THREE.DoubleSide,
      map: false//texture
    });
    var plane = new THREE.Mesh(geometry, material);
      plane.receiveShadow = true;

    this.plane = plane;
    this.scene.add(plane);
  },
  addGrid: function() {
    var size = 10;
    var step = 1;

    var gridHelper = new THREE.GridHelper(size, step);
    this.scene.add(gridHelper);
  },
  addFog: function() {
    this.scene.fog = new THREE.Fog(0xff0000, 10, 80);
    this.scene.fog.color.setHSL( 1, 1, 1 );
  },
  bindCameraMove: function() {

    var camera = this.camera;

    document.onkeypress = function(e) {
      if (e.keyCode === 119 || e.keyCode === 1094) camera.position.y += 2;
      if (e.keyCode === 115 || e.keyCode === 1099) camera.position.y -= 2;
      if (e.keyCode === 97 || e.keyCode === 1092) camera.position.x -= 2;
      if (e.keyCode === 100 || e.keyCode === 1074) camera.position.x += 2;
    };

    document.onwheel = function(e) {
      if (e.wheelDelta > 0) {
        if (camera.position.z - 2 > 0) camera.position.z -= 2;
      } else camera.position.z += 2;
    };

    return true;
  },
  addClickEvent: function() {
    var canvas = this.renderer.domElement;
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var camera = this.camera;

    canvas.onclick = function(e) {
      var vector = new THREE.Vector2();

      vector.x = (event.clientX / renderer.domElement.width) * 2 - 1;
      vector.y = -(event.clientY / renderer.domElement.height) * 2 + 1;

      var raycaster = new THREE.Raycaster();

      raycaster.setFromCamera(vector, this.camera);

      var intersects = raycaster.intersectObject(this.plane, false);
      // Change color if hit block
      if (intersects.length > 0) {
        var newCoords = this.transformCrossCoordinates(intersects[0].point);
        console.log(newCoords);
        if (
          Math.floor(newCoords.x) > 0 &&
          Math.floor(newCoords.x) < this.mapSize.width &&
          Math.floor(newCoords.y) > 0 &&
          Math.floor(newCoords.y) < this.mapSize.height)
          window.Adam.go(Math.floor(newCoords.x), Math.floor(newCoords.y));
      }
    }.bind(this);
  },
  render: function() {
    requestAnimationFrame(this.render.bind(this));
    renderer = this.renderer;
    renderer.render(this.scene, this.camera);
  },
  getRandomMaterial: function(color) {
    return new THREE.MeshPhongMaterial({
      color: color ?
        color : '#' + Math.floor(Math.random() * 16777215).toString(16),
      transparent:true,
      opacity: 1,
      wireframe: this.wireframe
    });
  },
  createCircle: function() {
    var curve = new THREE.EllipseCurve(
      0, 0, // ax, aY
      5, 5, // xRadius, yRadius
      0, 2 * Math.PI, // aStartAngle, aEndAngle
      false // aClockwise
    );

    var path = new THREE.Path(curve.getPoints(50));
    var geometry = path.createPointsGeometry(50);
    var material = new THREE.LineBasicMaterial({
      color: 0xff0000
    });

    // Create the final Object3d to add to the scene
    var ellipse = new THREE.Line(geometry, material);

    this.scene.add(ellipse);
  },
  createCube: function(options) {
    var
      geometry = new THREE.BoxGeometry(1, 1, 1),
      material = this.getRandomMaterial(options.color || false),
      cube = new THREE.Mesh(geometry, material);

    cube.scale.x = 1;
    cube.scale.y = 1;
    cube.scale.z = options.height || 1;

    cube.position.z = cube.scale.z / 2;
    cube.receiveShadow = true;

    this.scene.add(cube);

    return cube;
  },
  updateModel: function(inGameObject) {
    if (inGameObject.graphicModel) {
      var
        inGameObject = inGameObject,
        coordinates = this.transformPositiveCoordinates(inGameObject.getCoordinates()),
        vector = new THREE.Vector3(coordinates.x, coordinates.y, 0),
        axis = ["x", "y"];

      for (var i = 0; i < axis.length; i++) {
        a = axis[i];
        inGameObject.graphicModel.position[a] = coordinates[a];
      }
      return true;

    } else {
      console.error(inGameObject, "Tried to update object without model!");
    }
  },
  transformPositiveCoordinates: function(coordinates) {
    var
      mapSize = this.mapSize,
      newCoords = {
        x: 0,
        y: 0
      };

    newCoords.x = coordinates.x - mapSize.width / 2;
    newCoords.y = coordinates.y - mapSize.height / 2;

    return newCoords;
  },
  transformCrossCoordinates: function(coordinates) {
    var
      mapSize = this.mapSize,
      newCoords = {
        x: 0,
        y: 0
      };

    newCoords.x = coordinates.x + mapSize.width / 2;
    newCoords.y = coordinates.y + mapSize.height / 2;

    return newCoords;
  },
  size: {
    width: document.body.clientWidth,
    height: document.body.clientWidth
  },
  scene: false,
  camera: false,
  mapSize: Game.Map.getSize(),
  renderer: false,
  container: document.body,
  objects: {}
});
