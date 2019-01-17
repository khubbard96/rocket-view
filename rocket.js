const TWEEN = require('@tweenjs/tween.js');
const FS = require('fs');
const rocketPartsDir = "./assets/parts/";

module.exports = class Rocket {

  constructor(rocketParts, rocketName) {
    this.parts = [];
    this.partNames = [];

    buildRocket(this, function() {
      //callback for when the rocket is done building
    });
  }

  //load in each of the rocket parts and create RocketPart objects
  buildRocket(rocketObj, callback) {
    FS.readdirSync(rocketPartsDir).forEach(file => {
      console.log(file);
      rocketObj.partNames.push(file);
    });

    var parts = rocketObj.partNames.length;
    var partsLoaded = 0;

    rocketObj.partNames.forEach(file => {
      loader.load(rocketPartsDir + file, function(glb){
        var object = glb.scene;
        rocketObj.createRocketPart(object, file);
        partsLoaded++;
        if (partsLoaded == parts) {
          parts = 0; partsLoaded = 0;
          callback();
        }
      }, undefined, function(error){
        console.log(error);
      });
    });

  }

  createRocketPart(rawModel, name){
    var part = new RocketPart(rawModel, name);
    this.parts.push(part);
  }

  explodePart(partId) {
    //explodes rocket outward from the specified part
  }


}

class RocketPart {

  constructor(rawModel, name) {
    //constants
    this.explodeTime = 1500; //ms


    this.rawModel = rawModel;
    this.name = name;
    this.loadedPosition = {

    }
    this.animation = {
      tweens: {},
    }
    this.buildTweens = this.buildTweens.bind(this);
  }

  buildTweens() {
    //record base position of rocket part
    var position = {
      x: this.loadedPosition.x,
      y: this.loadedPosition.y,
      z: this.loadedPosition.z,
    }

    //define where the part should end up in the "up" animation
    var endPositionUp = {
      x: this.loadedPosition.x + 5,
      y: this.loadedPosition.y,
      z: this.loadedPosition.z,
    }
    //define where the part should end up in the "down" animation
    var endPositionDown = {
      x: this.loadedPosition - 5,
      y: this.loadedPosition.y,
      z: this.loadedPosition.z,
    }

    //create and save these tweens
    this.animation.tweens = {
      tweenUp: new TWEEN.Tween(position).to(endPositionUp, this.explodeTime),
      tweenDown: new TWEEN.Tween(position).to(endPositionDown, this.explodeTime),
      tweenReturn: new TWEEN.Tween(position).to(this.loadedPosition, this.explodeTime),
    };

    //apply the update function to each of the tweens
    var self = this;
    Object.keys(this.animation.tweens).forEach(function(key){
      self.animation.tweens[key].onUpdate(function(){
        //move the rawModel to the new position, calculated by the tween
        self.rawModel.position.x = position.x;
        self.rawModel.position.y = position.y;
        self.rawModel.position.z = position.z;
      });
    });
  }

  animateUp() {
    this.animation.tweens.tweenUp.start();
  }
  animateDown() {
    this.animation.tweens.tweenDown.start();
  }
  animateReturn() {
    this.animation.tweens.tweenReturn.start();
  }


}
