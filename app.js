const THREE = window.THREE = require('three');


require('three/examples/js/loaders/GLTFLoader');
require('three/examples/js/controls/OrbitControls');

class ModelViewer {

  /**
    @param el: wrapper element around the canvas element
    @param options: options for the viewer
  */

  constructor(el, options) {
    //instance variables
    this.prevTime = 0;

    this.spotlights = {
      mainSpot: undefined,
    }

    //setup THREE scene and associated objects
    this.scene = new THREE.Scene();
    this.default_camera = new THREE.PerspectiveCamera(0.8 * 180 / Math.PI, window.innerWidth / window.innerHeight, 0.01, 1000);
    this.camera = this.default_camera;
    this.scene.add(this.camera);
    this.scene.add( new THREE.AxesHelper( 10 ) );


    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.gammaOutput = true;
    this.renderer.gammaFactor = 2.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement );

    this.loader = new THREE.GLTFLoader();

    this.animate = this.animate.bind(this);
    var self = this;
    this.loadModel(function() {
      requestAnimationFrame(self.animate);
    });




    //initial setup functionality

  }

  animate(time) {
    requestAnimationFrame(this.animate);
    const dt = (time - this.prevTime) / 1000;

    this.controls.update();
    this.spotlights.mainSpot.position.copy(this.camera.position);

    this.render();
    this.prevTime = time;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  loadModel(callback) {

    this.lights();

    const loader = this.loader;

    var self = this;

    loader.load('assets/models/uslirocket_step.glb', function(gltf){
      var object = gltf.scene;
      var clips = gltf.animations;

      //self.setContent(object, clips);

      object.updateMatrixWorld();
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());

      var geometry = new THREE.BoxBufferGeometry( box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z );
      var edges = new THREE.EdgesGeometry( geometry );
      var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
      line.position.x = center.x;
      line.position.y = center.y;
      line.position.z = center.z;
      //self.scene.add( line );


      //controls.target.copy(center);
      //controls.update();

      //this.controls.reset();

      object.position.x -= Math.abs(center.x - object.position.x);
      object.position.y -= Math.abs(center.y - object.position.y);
      object.position.z -= Math.abs(center.z - object.position.z);
      //object.rotation.set(0,0,1.57,'XYZ');
      //bject.rotation._z = Math.PI / 2;
      //this.controls.maxDistance = size * 10;
      self.camera.near = size / 100;
      self.camera.far = size * 100;
      self.camera.updateProjectionMatrix();

      self.camera.position.copy(center);
      self.camera.position.x = 0;
      self.camera.position.y = 0;
      self.camera.position.z = 3;
      //self.camera.rotation.z = self.camera.rotation.z + 90;
      self.camera.lookAt(center);
      self.controls.update();

      self.scene.add(object);

      function animate() {
        requestAnimationFrame(self.animate);

        self.controls.update();

        self.spotlights.mainSpot.position.copy(self.camera.position);

        self.renderer.render(self.scene, self.camera);
      }
      animate();
      callback();

    }, undefined, function(error){
      console.log(error);
    });
  }

  setContent ( object, clips ) {

    //this.clear();

    object.updateMatrixWorld();
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    this.controls.reset();

    object.position.x += (object.position.x - center.x);
    object.position.y += (object.position.y - center.y);
    object.position.z += (object.position.z - center.z);
    this.controls.maxDistance = size * 10;
    this.defaultCamera.near = size / 100;
    this.defaultCamera.far = size * 100;
    this.defaultCamera.updateProjectionMatrix();

    this.defaultCamera.position.copy(center);
    this.defaultCamera.position.x += size / 2.0;
    this.defaultCamera.position.y += size / 5.0;
    this.defaultCamera.position.z += size / 2.0;
    this.defaultCamera.lookAt(center);

    this.controls.saveState();

    this.scene.add(object);

  }

  lights() {
    //show spotlights
    var light1 = new THREE.SpotLight(0xffffff, 20.0);
    light1.position.x = 40;
    light1.position.y = 0;
    light1.position.z = 0;
    light1.angle = Math.PI / 4;
    light1.penumbra = 1;
    light1.decay = 2;
    light1.distance = 200;

    light1.castShadow = true;
    light1.shadow.mapSize.width = 1024;
    light1.shadow.mapSize.height = 1024;

    light1.shadow.camera.near = 10;
    light1.shadow.camera.far = 200;
    light1.shadow.camera.fov = 30;

    this.scene.add(light1);
    this.spotlights.mainSpot = light1;
    //ambient light
    var light1 = new THREE.AmbientLight(0xffffff, 5.0);
    this.scene.add(light1);
  }

}
var view = new ModelViewer(document.createElement('div'));
