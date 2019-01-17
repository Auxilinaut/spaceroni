/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @description  Asteroid: Boot Scene
 * @license      Digitsensitive
 */

export class BootScene extends Phaser.Scene {
  constructor() {
    super({
      key: "BootScene"
    });
  }

  preload(): void {
    this.load.bitmapFont(
      "asteroidFont",
      "./assets/games/asteroid/asteroidFont.png",
      "./assets/games/asteroid/asteroidFont.fnt"
    );
    this.load.image("laser", "./assets/laser.png");
    if (!this.textures.exists('bg'))
    {
      //background sprite from space-2d
      var bg = document.getElementById('background').getAttribute('src');
      //this.load.image('bg', bg);
      this.textures.addBase64("bg", bg);
    }
  }

  update(): void {
    this.scene.start("MainMenuScene");
  }

}

