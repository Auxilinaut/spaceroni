import { CONST } from "../const/const";

export class Bullet extends Phaser.Physics.Matter.Image {
  private colors: number[];
  private selectedColor: number;
  private currentScene: Phaser.Scene;
  private velocity: Phaser.Math.Vector2;
  private lifeSpan: number;
  private isOffScreen: boolean;
  public id: any;
  public ownerId: any;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, params?) {

    super(scene.matter.world,x,y,texture);

    // variables
    this.colors = [];
    this.colors.push(0x3ae0c4);
    this.colors.push(0x39e066);
    this.colors.push(0xe08639);
    let rndColor = Phaser.Math.RND.between(0, 2);
    this.selectedColor = this.colors[rndColor];
    this.currentScene = scene;
    this.lifeSpan = 100;
    this.isOffScreen = false;

    // init bullet
    this.id = params.id;
    this.ownerId = params.ownerId;
    this.x = x;
    this.y = y;
    /*this.velocity = new Phaser.Math.Vector2(
      CONST.BULLET_SPEED * Math.cos(params.angle - Math.PI / 2),
      CONST.BULLET_SPEED * Math.sin(params.angle - Math.PI / 2)
    );*/

    // physics
    this.setIgnoreGravity(true);
    this.setRotation(params.angle);
    /*this.setFrictionAir(0.01);
    this.setMass(3);
    this.setSize(3, 3);*/
    //this.currentScene.matter.world.add(this);
    this.currentScene.add.existing(this);
  }

  update(): void {
    //this.setVelocity(this.velocity.x, this.velocity.y);

    /*if (this.lifeSpan < 0 || this.isOffScreen) {
      this.setActive(false);
    } else {
      this.lifeSpan--;
    }*/
  }

  public getBody(): any {
    return this.body;
  }
}
