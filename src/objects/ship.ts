/**
 * @author       Digitsensitive <digit.sensitivee@gmail.com>
 * @copyright    2018 Digitsensitive
 * @description  Asteroid: Ship
 * @license      Digitsensitive
 */

import { Bullet } from "../objects/bullet";
import { CONST } from "../const/const";

export class Ship extends Phaser.Physics.Matter.Image {
  private currentScene: Phaser.Scene;
  private velocity: Phaser.Math.Vector2;
  private cursors: CursorKeys;
  //private pointers: Phaser.Input.Pointer[];
  private bullets: Bullet[];
  private wKey: Phaser.Input.Keyboard.Key;
  private aKey: Phaser.Input.Keyboard.Key;
  private sKey: Phaser.Input.Keyboard.Key;
  private dKey: Phaser.Input.Keyboard.Key;
  private shootKey: Phaser.Input.Keyboard.Key;
  private dashKey: Phaser.Input.Keyboard.Key;
  private textureStr: string;

  public base64: any;
  public id: string;
  public name: string;

  public inputsOn: boolean = false;
  public forward: integer = 0;
  public sideways: integer = 0;
  public shooting: integer = 0;
  public dashing: integer = 0;

  public getBullets(): Bullet[] {
    return this.bullets;
  }

  public getBody(): any {
    return this.body;
  }

  constructor(scene: Phaser.Scene,x: number, y: number, texture: string, id?: string, name?: string) {

    super(scene.matter.world,x,y,texture);

    // variables
    this.currentScene = scene;
    this.bullets = [];

    this.x = -500;
    this.y = -500;
    if (id) this.id = id;
    if (name) this.name = name;
    this.velocity = new Phaser.Math.Vector2(0, 0);

    // input
    this.cursors = this.currentScene.input.keyboard.createCursorKeys();
    this.currentScene.input.addPointer(2);
    this.wKey = this.currentScene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.W
    );
    this.aKey = this.currentScene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.A
    );
    this.sKey = this.currentScene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.S
    );
    this.dKey = this.currentScene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.D
    );
    this.shootKey = this.currentScene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.dashKey = this.currentScene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SHIFT
    );

    // physics
    /*this.setIgnoreGravity(true);
    
    this.setFrictionAir(0.05);
    this.setMass(30);
    this.currentScene.matter.world.add(this);*/
    this.setAngle(270);
    this.setScale(CONST.SHIP_SIZE);
    this.currentScene.add.existing(this);
  }

  update(): void {
    if (this.active) {
      this.handleInput();
    }
    //this.applyForces();
    //this.checkIfOffScreen();
    //this.updateBullets();
  }

  private handleInput(): void {

    //if (this.forward != 0)
    this.inputsOn = false;
    if (this.cursors.up.isDown || this.wKey.isDown)
    {
      this.inputsOn = true;
      this.forward = 1;
      //this.thrustLeft(5); //idk why this thing is sideways don't blame me
    }
    else if (this.cursors.down.isDown || this.sKey.isDown)
    {
      this.inputsOn = true;
      this.forward = -1;
      //this.thrustRight(5);
    }
    else
    {
      this.forward = 0;
    }

    if (this.cursors.left.isDown || this.aKey.isDown)
    {
      this.inputsOn = true;
      this.sideways = -1;
    }
    else if (this.cursors.right.isDown || this.dKey.isDown)
    {
      this.inputsOn = true;
      this.sideways = 1;
    }
    else
    {
      this.sideways = 0;
    }

    if (this.currentScene.input.pointer1.isDown)
    {
      this.inputsOn = true;
      var angleToPointer = Phaser.Math.Angle.Between(640, 360, this.currentScene.input.pointer1.x, this.currentScene.input.pointer1.y) + 1.5708;
      
      console.log(angleToPointer);
      //angleBetween = Math.abs(angleBetween);
      var angleDelta = angleToPointer - this.rotation;
  
      angleDelta = Math.atan2(Math.sin(angleDelta), Math.cos(angleDelta));
      
      if (Phaser.Math.Within(angleDelta, 0, 0.1))
      {
        this.sideways = 0;
      }
      else
      {
        this.sideways = Math.sign(angleDelta) * 1;
      }

      this.forward = 1;
    }

    if (this.currentScene.input.mousePointer.isDown)
    {
      this.inputsOn = true;
      var angleToPointer = Phaser.Math.Angle.Between(640, 360, this.currentScene.input.mousePointer.x, this.currentScene.input.mousePointer.y) + 1.5708;
      
      console.log(angleToPointer);
      //angleBetween = Math.abs(angleBetween);
      var angleDelta = angleToPointer - this.rotation;
  
      angleDelta = Math.atan2(Math.sin(angleDelta), Math.cos(angleDelta));
      
      if (Phaser.Math.Within(angleDelta, 0, 0.05))
      {
        this.sideways = 0;
      }
      else
      {
        this.sideways = Math.sign(angleDelta) * 1;
      }

      this.forward = 1;
    }

    if ((this.shootKey.isDown || this.currentScene.input.pointer2.isDown) && !this.shooting) {
      this.inputsOn = true;
      this.shooting = 1;
    }
    
    if ((this.dashKey.isDown || this.currentScene.input.pointer3.isDown) && !this.dashing) {
      this.inputsOn = true;
      this.dashing = 1;
    }

    if (this.shootKey.isUp) {
      this.shooting = 0;
    }

    if (this.dashKey.isUp) {
      this.dashing = 0;
    }
  }

  /*private applyForces(): void {
    // apple velocity to position
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    // reduce the velocity
    this.velocity.scale(0.98);
  }*/

  /*private checkIfOffScreen(): void {
    // horizontal check
    if (this.x > this.currentScene.sys.canvas.width + CONST.SHIP_SIZE) {
      this.x = -CONST.SHIP_SIZE;
    } else if (this.x < -CONST.SHIP_SIZE) {
      this.x = this.currentScene.sys.canvas.width + CONST.SHIP_SIZE;
    }

    // vertical check
    if (this.y > this.currentScene.sys.canvas.height + CONST.SHIP_SIZE) {
      this.y = -CONST.SHIP_SIZE;
    } else if (this.y < -CONST.SHIP_SIZE) {
      this.y = this.currentScene.sys.canvas.height + CONST.SHIP_SIZE;
    }
  }*/

  private shoot(): void {
    this.bullets.push(
      new Bullet(this.currentScene, 
        this.x + CONST.SHIP_SIZE * Math.cos(this.rotation - Math.PI / 2),
        this.y + CONST.SHIP_SIZE * Math.sin(this.rotation - Math.PI / 2),
        'laser',
        {rotation:this.rotation}
      )
    );
  }

  private recoil(): void {
    // create the force in the correct direction
    /*let force = new Phaser.Math.Vector2(
      -Math.cos(this.rotation - Math.PI / 2),
      -Math.sin(this.rotation - Math.PI / 2)
    );

    // reduce the force and apply it to the velocity
    force.scale(0.05);
    this.velocity.add(force);*/
    this.thrustRight(CONST.BULLET_SPEED/2);
  }

  private updateBullets(): void {
    for (let i = 0; i < this.bullets.length; i++) {
      if (this.bullets[i].active) {
        this.bullets[i].update();
      } else {
        this.bullets[i].destroy();
        this.bullets.splice(i, 1);
      }
    }
  }
}
