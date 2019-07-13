import { CONST } from "../const/const";
import * as is from '../../assets/js/InfiniShip.js';
import * as aud from '../../assets/js/aud.js';

declare var InfiniShip:any;
declare var aud:any;
declare var audio_context:any;

export class MainMenuScene extends Phaser.Scene {
  private startKey: Phaser.Input.Keyboard.Key;
  private bitmapTexts: Phaser.GameObjects.BitmapText[] = [];
  private playerName: Phaser.GameObjects.BitmapText;
  private enterNameButton: Phaser.GameObjects.BitmapText;
  private generateButton: Phaser.GameObjects.BitmapText;
  private playButton: Phaser.GameObjects.BitmapText;
  private muteButton: Phaser.GameObjects.BitmapText;
  private musicButton: Phaser.GameObjects.BitmapText;

  private shipGen:any;
  private shipBase64:any;
  private player:Phaser.GameObjects.Image;

  private htmlimg:HTMLImageElement;

  constructor() {
    super({
      key: "MainMenuScene"
    });
  }

  init(): void {
    this.cameras.main.setViewport(0,0,window.innerWidth,window.innerHeight)
    this.startKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );

    // reset score, highscore and player lives
    if (CONST.SCORE > CONST.HIGHSCORE) {
      CONST.HIGHSCORE = CONST.SCORE;
      localStorage.setItem("shighscore", CONST.HIGHSCORE.toString());
    }
    if (CONST.LASTSCORE)
    {
      localStorage.setItem("slastscore", CONST.LASTSCORE.toString());
    }
    CONST.SCORE = 0;
    //CONST.LIVES = 1;

    aud.setVolume(0.3);
    aud.generatePattern(0, 0, 3, 512, Math.random()*100000);
  }

  preload(): void {
    /*this.load.bitmapFont(
      "asteroidFont",
      "./assets/games/asteroid/asteroidFont.png",
      "./assets/games/asteroid/asteroidFont.fnt"
    );
    this.load.image("laser", "./assets/laser.png");
    //background sprite from space-2d
    var bg = document.getElementById('background').getAttribute('src');
    //this.load.image('bg', bg);
    this.textures.addBase64("bg", bg);*/
  }

  create(): void {

    this.bitmapTexts.push(
      this.add.bitmapText(
        this.sys.canvas.width / 2 - 150,
        this.sys.canvas.height / 2 - 60,
        "asteroidFont",
        "SPACERONI",
        80
      )
    );

    if(CONST.HIGHSCORE)
    {
      this.bitmapTexts.push(
        this.add.bitmapText(
          this.sys.canvas.width / 2 - 150,
          this.sys.canvas.height / 2 + 40,
          "asteroidFont",
          "HIGH SCORE: " + CONST.HIGHSCORE,
          45
        )
      );
    }

    if (CONST.LASTSCORE){
      this.bitmapTexts.push(
        this.add.bitmapText(
          this.sys.canvas.width / 2 - 150,
          this.sys.canvas.height / 2 + 40,
          "asteroidFont",
          "SCORE: " + CONST.SCORE,
          45
        )
      );
    }

    this.playerName = this.add.bitmapText(
      this.sys.canvas.width / 2 + 140,
      this.sys.canvas.height / 2 + 80,
      "asteroidFont",
      "",
      45
    );

    this.enterNameButton = this.add.bitmapText(
      this.sys.canvas.width / 2 - 150,
      this.sys.canvas.height / 2 + 80,
      "asteroidFont",
      "[ENTER NAME]",
      45
    );

    this.enterNameButton.setInteractive();
    this.enterNameButton.on('pointerdown', this.enterName, this);
    this.bitmapTexts.push(
      this.enterNameButton
    );

    this.generateButton = this.add.bitmapText(
      this.sys.canvas.width / 2 - 150,
      this.sys.canvas.height / 2 + 120,
      "asteroidFont",
      "[GENERATE SHIP]",
      45
    );

    this.generateButton.setInteractive();
    this.generateButton.on('pointerdown', this.generateShip, this);
    this.bitmapTexts.push(
      this.generateButton
    );

    this.musicButton = this.add.bitmapText(
      this.sys.canvas.width / 2 - 150,
      this.sys.canvas.height / 2 + 160,
      "asteroidFont",
      "[GENERATE MUSIC]",
      45
    );
    this.musicButton.setInteractive();
    this.musicButton.on('pointerdown', this.generateMusic, this);
    this.bitmapTexts.push(
        this.musicButton
    );

    this.playButton = this.add.bitmapText(
      this.sys.canvas.width / 2 - 150,
      this.sys.canvas.height / 2 + 200,
      "asteroidFont",
      "[PLAY GAME]",
      45
    );
    this.playButton.setInteractive();
    this.playButton.on('pointerdown', ()=>{this.scene.start("GameScene",{base64:this.shipBase64, name: this.player.name});});
    this.bitmapTexts.push(
      this.playButton
    );

    this.shipGen = new InfiniShip(false);
    this.shipBase64 = this.shipGen.makeShip();
    console.log(this.shipBase64);

    this.textures.once('addtexture', function () {

      this.player = new Phaser.GameObjects.Image(this, this.sys.canvas.width / 2 + 100, this.sys.canvas.height / 2 + 100, "ship");
      this.player.setScale(CONST.SHIP_SIZE);
      this.add.existing(this.player);
    }, this);
    this.textures.addBase64("ship", this.shipBase64);

    //Music
    this.muteButton = this.add.bitmapText(
        20,
        20,
        "asteroidFont",
        "[TOGGLE MUSIC]",
        35
    );
    this.muteButton.setInteractive();
    this.muteButton.on('pointerdown', this.toggleMusic, this);
    this.bitmapTexts.push(
        this.muteButton
    );
    
  }

  update(): void {
    if (this.startKey.isDown) {
      this.scene.start("GameScene",{base64:this.shipBase64, name: this.player.name});
    }
  }

  generateShip(): void {
    var s = Math.random() < 0.1; //monochrome chance
    this.shipGen = new InfiniShip(s);
    this.shipBase64 = this.shipGen.makeShip();
    this.player.destroy();
    this.textures.remove("ship");
    this.textures.once('addtexture', function () {

      this.player = new Phaser.GameObjects.Image(this, this.sys.canvas.width / 2 + 100, this.sys.canvas.height / 2 + 100, "ship");
      this.player.setScale(CONST.SHIP_SIZE);
      this.add.existing(this.player);
    }, this);
    this.textures.addBase64("ship", this.shipBase64);

  }

  enterName(): void {
    this.player.name = prompt("Please enter your name.");
    this.playerName.setText(this.player.name);
  }

  generateMusic() : void {
      var stress: number = 0;
      var energy: number = 0.25;
      var pat: number = 4;
      var patLen: number = 512;
      var plusOrMinus: number = Math.random() < 0.5 ? -1 : 1;
      var seed: number = plusOrMinus * Math.random() * Number.MAX_VALUE;
      aud.generatePattern(stress, energy, pat, patLen, seed);
      aud.togglePlay();
  }

  toggleMusic() : void {
    audio_context.resume();
    aud.togglePlay();
  }

}
