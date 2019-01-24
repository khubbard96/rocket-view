const TWEEN = require('@tweenjs/tween.js');
const FS = require('fs-web');
const partDef = require("./assets/parts/part_definition.json");

module.exports = class Rocket {

  constructor(rocketParts, partNames, rocketName) {
    this.parts = [];
    this.partNames = partNames;
    var i = 0;
    var self = this;
    rocketParts.forEach(part => {
      var rPart = new RocketPart(part, partNames[i]);
      self.parts.push(rPart);
      i++;
    });
  }

  //load in each of the rocket parts and create RocketPart objects
  buildRocket(rocketObj, callback) {
    var self = this;
    var parts = this.partNames.length;
    var partsLoaded = 0;

  }


  createRocketPart(rawModel, name){
    debugger;
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
