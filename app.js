const THREE = window.THREE = require('three');


require('three/examples/js/loaders/GLTFLoader');
require('three/examples/js/controls/OrbitControls');
const ObjWrapper = require('./objectwrapper');
const Rocket = require('./rocket');
const partDef = require("./assets/parts/part_definition.json");
const jQuery = require("jquery");

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
    //this.scene.add( new THREE.AxesHelper( 10 ) );


    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    this.renderer.gammaOutput = true;
    this.renderer.gammaFactor = 2.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    //document.getElementById('stage_description_container').appendChild(this.renderer.domElement);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement );
    this.controls.autoRotate = true;
    this.loader = new THREE.GLTFLoader();

    this.animate = this.animate.bind(this);
    //this.generateRocketParts = this.generateRocketParts.bind(this);

    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    var self = this;
    window.addEventListener("mousemove", function(event){
        self.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        self.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    }, false)

    this.loadModel(function() {
      requestAnimationFrame(self.animate);
    });

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
    this.raycaster.setFromCamera(this.mouse, this.camera);

    var intersects = this.raycaster.intersectObject(this.scene.children[3].children[0]);

    for(var i = 0; i < intersects.length; i++) {
      intersects[i].object.material.color.set(0xff0000);
    }


    this.renderer.render(this.scene, this.camera);
  }

  loadModel(callback) {
    var self = this;
    this.generateRocketParts(function(resultParts){
      self.lights();
      const loader = self.loader;
      var rocket = new Rocket(resultParts, "NOVA II");
      self.setContent(rocket.parts[0], undefined);
      requestAnimationFrame(self.animate);
    });
  }

  generateRocketParts(oncomplete) {
    var numParts = partDef.parts;
    var partsLoaded = 0;
    var rawParts = [];
    var partNames = [];
    var self = this;
    partDef.partNames.forEach(file => {
      self.loader.load('./assets/models/' + file, function(glb){
        var object = glb.scene;
        //self.createRocketPart(object, file);
        rawParts.push(object);
        partNames.push(file);
        partsLoaded++;
        if (partsLoaded == numParts) {
          numParts = 0; partsLoaded = 0;
          oncomplete(rawParts);
        }
      }, undefined, function(error){
        console.log(error);
      });
    });

  }

  setContent ( object, clips ) {
    object = object.rawModel;
    object.updateMatrixWorld();
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    this.controls.reset();

    object.position.x -= Math.abs(center.x - object.position.x);
    object.position.y -= Math.abs(center.y - object.position.y);
    object.position.z -= Math.abs(center.z - object.position.z);
    this.controls.maxDistance = size * 10;
    this.controls.maxPolarAngle = Math.PI;
    this.camera.near = size / 100;
    this.camera.far = size * 100;
    this.camera.updateProjectionMatrix();

    this.camera.position.copy(center);
    this.camera.position.x = -2;
    this.camera.position.y = 2;
    this.camera.position.z = 5;
    this.camera.lookAt(center);
    this.controls.update();
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

//bind and run interface events
(function($){
  function bindEvents() {

    var partNav = $("#stage_navigator");

    partNav.find(".stage-item").off().on("click", function(e) {
      partNav.find(".stage-item").removeClass("selected");
      $(e.target).addClass("selected");
      //

      var selectStage = $(e.target).attr("data-stage-id");

      var descArr = partDef.partDescriptions[selectStage];
      var informationTitle = descArr.title;
      var descFormat = "";
      descArr.info.forEach(function(el, i){
        descFormat += el;
        if (i < descArr.info.length - 1) {
          descFormat += "<br><br>"
        }
      });
      $("#information_title, #information_info").fadeOut("slow", function(){
        $("#information_title").html(informationTitle);
        $("#information_info").html(descFormat);
        $(this).fadeIn("slow");
        $("#information_billboard #info_next, #information_billboard #info_prev").removeClass("disabled");
        if(!descArr.next) $("#information_billboard #info_next").addClass("disabled");
        if(!descArr.prev) $("#information_billboard #info_prev").addClass("disabled");

      });

    });
  }

  $(document).ready(function() {
    bindEvents();
  });
})(jQuery)
