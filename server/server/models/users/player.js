let Service = require("../game/service.js");
let Matter = require("../../matter.js");

class Player {
	//Creates the Player Object
	constructor(client) {
		this.client = client;
		this.id = this.client.id;
		this.connected = false;
		this.x = null;
		this.y = null;
		this.angle = null;
		this.base64 = null;
		this.score = 0;
		this.isShooting = false;
		this.shootTimer = 0;
		this.dashTimer = 0;
		this.name = "";
	}

    createBody() {
        this.body = Matter.Bodies.circle(this.x, this.y, 15, { collisionFilter: {category: global.world.shipCategory}});
        this.body.label = this.id;
		this.body.angle = this.angle;
		//Matter.Body.setVelocity(this.body, Matter.Vector.create(0,0));
        Matter.Body.setAngularVelocity(this.body, 0);
        this.body.frictionAir = 0.1;
        Matter.World.add(global.world.engine.world, this.body);
    }

	onEvent() {
		//validate that the player can do this
		//Do what needs to be done
		//End the function
		console.log("This function was called.");
	}
}

module.exports = Player;