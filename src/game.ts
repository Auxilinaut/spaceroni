/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @description  Asteroid: Game
 * @license      Digitsensitive
 */

/// <reference path="phaser.d.ts"/>

import "phaser";
import { BootScene } from "./scenes/bootScene";
import { MainMenuScene } from "./scenes/mainMenuScene";
import { GameScene } from "./scenes/gameScene";
import { UIScene } from "./scenes/uiScene";

const config: GameConfig = {
  title: "Spaceroni 3",
  version: "0.0.1",
  width: 1280,
  height: 720,
  type: Phaser.AUTO,
  parent: "game",
  scene: [BootScene, MainMenuScene, GameScene, UIScene],
  input: {
    activePointers: 2,
    keyboard: true,
    mouse: true,
    touch: true,
    gamepad: false
  },
  physics: {
    default: "matter",
    debug: true,
    gravity: {
      x: 0,
      y: 0
    }
  },
  backgroundColor: "#000000",
  pixelArt: true,
  antialias: true,
  "render.autoResize": true
};

export class Game extends Phaser.Game {
  constructor(config: GameConfig) {
    super(config);
  }

  resize() {
    var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    canvas.style.width = windowWidth + "px";
    canvas.style.height = windowHeight + "px";
    /*var windowRatio = windowWidth / windowHeight;
    var gameRatio = +this.config.width / +this.config.height;
  
    if(windowRatio < gameRatio){
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else {
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }*/

    this.renderer.resize(windowWidth, windowHeight);
  }
}

window.onload = () => {
  var game = new Game(config);
  //game.resize();
  //window.addEventListener("resie", game.resize, false);
};