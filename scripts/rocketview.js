var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(0.8 * 180 / Math.PI, window.innerWidth / window.innerHeight, 0.01, 1000);

scene.add(camera);
scene.add( new THREE.AxesHelper( 10 ) );


var light1 = new THREE.AmbientLight(0xffffff, 1.0);
scene.add(light1);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

var controls = new THREE.OrbitControls(camera, renderer.domElement );

var light1 = new THREE.SpotLight(0xffffff, 20.0);
light1.position.set(0,40,0);
light1.angle = Math.PI / 4;
light1.penumbra = 1;
light1.decay = 2;
light1.distance = 2000;

light1.castShadow = true;
light1.shadow.mapSize.width = 1024;
light1.shadow.mapSize.height = 1024;

light1.shadow.camera.near = 10;
light1.shadow.camera.far = 200;
light1.shadow.camera.fov = 30;

scene.add(light1);


var loader = new THREE.GLTFLoader();



loader.load('assets/models/uslirocket_step.glb', function(gltf){
  var object = gltf.scene;
  var clips = gltf.animations;

  object.updateMatrixWorld();
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3()).length();
  const center = box.getCenter(new THREE.Vector3());

  //controls.target.copy(center);
  //controls.update();

  //this.controls.reset();

  object.position.x += (object.position.x - center.x);
  object.position.y += (object.position.y - center.y);
  object.position.z += (object.position.z - center.z);
  //this.controls.maxDistance = size * 10;
  camera.near = size / 100;
  camera.far = size * 100;
  camera.updateProjectionMatrix();

  camera.position.copy(center);
  camera.position.x = 0;
  camera.position.y = 50;
  camera.position.z = 0;
  camera.rotation = camera.rotation + (Math.PI / 2);
  camera.lookAt(center);
  controls.update();

  scene.add(object);

  function animate() {
    requestAnimationFrame(animate);

    controls.update();

    light1.position.copy(camera.position);

    renderer.render(scene, camera);
  }
  animate();

}, undefined, function(error){
  console.log(error);
});
