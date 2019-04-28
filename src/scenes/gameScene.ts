import { Bullet } from "../objects/bullet";
import { Ship } from "../objects/ship";
import { CONST } from "../const/const";
import * as is from '../../assets/js/InfiniShip.js';
import * as Socket from 'socket.io-client';
import { Time } from "phaser";
import * as aud from '../../assets/js/aud.js';

declare var aud:any;
declare var audio_context:any;
declare var InfiniShip:any;

export class GameScene extends Phaser.Scene {
  private player: Ship;
  private playerName: string = "";
  private enemies: Ship[] = [];
  //private numberOfAsteroids: number;
  private bullets = {};
  private score: number;
  private bitmapTexts: Phaser.GameObjects.BitmapText[];
  //private gotHit: boolean;
  private textureStr: string;
  private socket: SocketIOClient.Socket = null;
  private inGame: boolean = false;

  private shipGen: any;
  private playerBase64: any;
  private pendingShips: number = 0;

  private bg: Phaser.GameObjects.Image;

  private leaderboard = [];

  constructor() {
    super({
      key: "GameScene"
    });
  }

  init(data): void {
    this.playerBase64 = data.base64;
    if (data.name != '') this.playerName = data.name;
    this.matter.world.setBounds(0,0,5000,5000);
    this.matter.world.autoUpdate = false;
    this.bg = this.add.image(0,0,"bg").setOrigin(0);
    this.bg.setScale(5,5);
    aud.adaptPattern(0, 0.5);
    //console.log("my base64:");
    //console.dir(data.base64);
  }

  create(): void {
    this.socket = Socket('142.44.160.26:4200');
    this.socket.on("connect", this.onSocketConnected.bind(this));
    this.socket.on("new_player", this.onNewPlayer.bind(this));
    this.socket.on("existing_players", this.onExistingPlayers.bind(this));
		this.socket.on("move_player", this.onMove.bind(this));
    this.socket.on("remove_player", this.onRemovePlayer.bind(this));
    this.socket.on("place_player", this.onPlacePlayer.bind(this));
    this.socket.on("player_shoot", this.onShoot.bind(this));
    this.socket.on("bullets_update", this.onBulletsUpdate.bind(this));
    this.socket.on("bullet_collision", this.onBulletCollision.bind(this));
    this.socket.on("update_score", this.onUpdateScore.bind(this));
    this.socket.on('leaderboard', this.onUpdateLeaderboard.bind(this));
  }

  update(): void {
    if (this.inGame)
    {
      this.player.update();
      if (this.player.inputsOn)
      {
        this.socket.emit('player_input', {move: this.player.forward, rotate: this.player.sideways, shoot: this.player.shooting, dash: this.player.dashing});
      }
    }
  }

  createPlayer(data) //my ship
  {
    this.shipGen = new InfiniShip(false);

    //this.textureStr = "ship";
    //this.textures.addImage(this.textureStr, this.shipData);
    this.player = new Ship(this.scene.scene, data.x, data.y, "ship");
    this.player.setAngle(data.angle);
    this.player.id = data.id;
    //this.player.setScrollFactor(0);
    this.cameras.main.startFollow(this.player);

    this.score = CONST.SCORE;
  }

  /**
   * LISTENERS
   */

  //we connected to server, emit player data
  onSocketConnected()
  {
    //console.log("connected to server"); 
    console.dir(this.textures.list);
    if (this.playerName != '')
    this.socket.emit('new_player', {base64: this.playerBase64, name: this.playerName});
    else
    this.socket.emit('new_player', {base64: this.playerBase64});
  }
  
  //new player joined, take their data
  onNewPlayer(data)
  {
    //console.log("new player");
    //console.dir(data);
    //this.textureStr = this.genTextureId();
    this.textureStr = data.id;
    this.textures.once('onload', function() { 
      if (data.name)
      {
        let actualCreate = this.addShipNamed.bind(this, {t: this.textureStr, d: data, n: data.name});
        actualCreate(); //load ship texture/other data
      }
      else
      {
        let actualCreate = this.addShip.bind(this, {t: this.textureStr, d: data});
        actualCreate(); //load ship texture/other data
      }
      this.loadedShips++;			
    },this);
    this.textures.addBase64(this.textureStr, data.base64);
  }

  //there are other people here, load them as well
  onExistingPlayers(data)
  {
    console.log("existing players");
    console.dir(data);
    this.pendingShips = Object.keys(data).length;
    this.textures.on('onload', this.updatePending, this);
    this.textures.on('onerror', this.updatePending, this);
    this.textures.on('texturesready', ()=>{
      for (var key in data)
      {
        let actualCreate = this.addShip.bind(this, {t: data[key].id, d: data[key]});
        actualCreate();
      }
    }, this);

    for (var key in data)
    {
      this.textures.addBase64(data[key].id, data[key].base64);
    }
  }

  onRemovePlayer(data) 
  {
    let removePlayer = this.findPlayerById(data.id);

    if (!removePlayer)
    {
      //console.log('Player not found: ', data.id)
      return;
    }
    
    removePlayer.destroy();
    this.enemies.splice(this.enemies.indexOf(removePlayer), 1);
  }
  
  onMove(data) 
  {
    var movePlayer;

    if (!this.player || !this.player.id)
      return;

    if (data.id == this.player.id)
    {
      movePlayer = this.player;
    }
    else
    {
      movePlayer = this.findPlayerById(data.id); 
    }
    
    if (!movePlayer)
    {
      return;
    }

    movePlayer.x = data.x; 
    movePlayer.y = data.y; 
    movePlayer.angle = data.angle; 
  }

  onPlacePlayer(data) 
  {
    this.createPlayer(data);
    console.log("my id:" + this.player.id);
    this.inGame = true;
  }

  onShoot(data) 
  {
    //console.log("new bullet with id " + data.id + " by " + data.ownerId + " at x " + data.x + " and y " + data.y + " with angle " + data.angle);
    this.bullets[data.id] = new Bullet(this, data.x, data.y, "laser", {id: data.id, ownerId: data.ownerId, angle: data.angle});
  }

  onBulletsUpdate (server_bullets)
  {
    //console.dir(server_bullets);
    // If there's not enough bullets on the client, create them

    for(var id in server_bullets)
    {
      if (this.bullets[id])
      {
        this.bullets[id].x = server_bullets[id].x;
        this.bullets[id].y = server_bullets[id].y;
        this.bullets[id].setRotation(server_bullets[id].angle);
      }
    }

    for(var id in this.bullets)
    {
      if (!server_bullets[id])
      {
        this.bullets[id].destroy();
        delete this.bullets[id];
      }
    }

  }

  onBulletCollision (data) 
  {
    console.log("bullet collision between ownerId " + data.ownerId + " bulletId " + data.bulletId + " and victimId " + data.victimId); 
    //var bullet = this.findBulletById(data.bulletId);
    var deadGuy: Ship;

    if (data.victimId == this.player.id)
    {
      location.reload(true);
      /*deadGuy = this.player;
      this.inGame = false;
      //this.matter.world.remove(deadGuy, true);
      //deadGuy.destroy();
      this.player = null;

      this.textures.remove("ship");
      //this.textures.remove(this.textureStr);

      console.log("Texture list:");
      console.dir(this.textures.list);

      for (var i=0; i<this.enemies.length; i++)
      {
        console.log("Removing enemy texture with ID " + this.enemies[i].id);
        this.textures.remove(this.enemies[i].id);
      }

      //this.textures.list = {};

      this.enemies = [];
      this.bullets = {};

      this.scene.start('BootScene');*/
    }
    else
    {
      deadGuy = this.findPlayerById(data.victimId);
      //this.matter.world.remove(deadGuy, true);
      deadGuy.destroy();
      this.enemies.splice(this.enemies.indexOf(deadGuy), 1);
    }

    //this.matter.world.remove(this.bullets[data.id], true);
    //delete this.bullets[data.id];
  }

  onUpdateScore (data)
  {
      //for (var i = 0; i < this.leaderboard.length; i++)
      //{
        //display each position to screen
      //}
      //console.log("leaderboard shared with player");
      // not sure if this is needed after updateLeaderboard is impletmented
  }
  
  onUpdateLeaderboard (data)
  {
    var lb_display = [];

    if (data.length > 10)
    {
      lb_display = data.splice(10);
    }
    else
    {
      lb_display = data;
    }

    var idCheck = false;
    var playerIndex = 0;

    for (let i = 0; i < lb_display.length; i++)
    {
        if(lb_display[i]["id"] == this.player.id)
        {
          idCheck = true;
          playerIndex = i;
        }
    }

    if (!idCheck)
    {
      //lb_display.push({name: data[playerIndex].name, score: data[playerIndex].score, place: (playerIndex + 1)});
    }

    this.events.emit('update_leaderboard', lb_display);
  }

  findPlayerById(id): Ship
  {
    for (let i = 0; i < this.enemies.length; i++)
    {
      if (this.enemies[i].id == id)
      {
        return this.enemies[i]; 
      }
    }
  }

  /*findBulletById(id): Bullet
  {
    for (let i = 0; i < this.bullets.length; i++)
    {
      if (this.bullets[i].id == id)
      {
        return this.bullets[i]; 
      }
    }
  }*/

  // dec2hex :: Integer -> String
  dec2hex (dec)
  {
    return ('0' + dec.toString(16)).substr(-2)
  }

  // generateId :: Integer -> String
  genTextureId (len?)
  {
    var arr = new Uint8Array((len || 40) / 2)
    window.crypto.getRandomValues(arr)
    return Array.from(arr, this.dec2hex).join('')
  }

  getBase64Image (img)
  {
    // Create an empty canvas element
    var c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;

    // Copy the image contents to the canvas
    var ctx = c.getContext("2d");
    ctx.putImageData(img, 0, 0);

    return c.toDataURL();
  }

  updatePending()
  {
        this.pendingShips--;

        if (this.pendingShips === 0)
        {
            this.textures.off('onload',null,this,true);
            this.textures.off('onerror',null,this,true);

            this.textures.emit('texturesready');
        }
  }

  addShipNamed (d)
  {
    this.enemies.push(new Ship(this, d.d.x, d.d.y, d.t, d.d.id, d.n));
  }

  addShip (d)
  {
    this.enemies.push(new Ship(this, d.d.x, d.d.y, d.t, d.d.id));
  }
}
