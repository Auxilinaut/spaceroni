let Matter = require("../../matter.js");
let Engine = Matter.Engine;

class World {

    constructor() {
        this.players = {};
        this.basePlayers = {};
        this.size = [5000,5000];
        this.bullets = {};

        this.defaultCategory = 0x0001;
        this.shipCategory = 0x0002;
        this.bulletCategory = 0x0004;
        this.wallCategory = 0x0008;

        this.engine = Engine.create();

        this.startCollisionDetection(this);
        this.startGameLoop(this);
        this.leaderboardTimer = 30;
    };

    // MAIN GAME LOOP

    startGameLoop(self)
    {
        //console.log("Building walls.");
        let topWall = Matter.Bodies.rectangle(2500, -150, 5000, 300, { isStatic: true, collisionFilter: {category: this.wallCategory} });
        let bottomWall = Matter.Bodies.rectangle(2500, 5150, 5000, 300, { isStatic: true, collisionFilter: {category: this.wallCategory} });
        let leftWall = Matter.Bodies.rectangle(-150, 2500, 300, 5600, { isStatic: true, collisionFilter: {category: this.wallCategory} });
        let rightWall = Matter.Bodies.rectangle(5150, 2500, 300, 5600, { isStatic: true, collisionFilter: {category: this.wallCategory} });

        Matter.World.add(this.engine.world, [topWall, bottomWall, leftWall, rightWall]);

        this.engine.world.gravity.y = 0;
        this.engine.world.bounds = {
            min : {
                x : 0,
                y : 0
            },
            max : {
                x : 5000,
                y : 5000
            }
        };

        let engine = this.engine;
        setInterval(function() {
            Engine.update(engine, 1000 / 60);
            self.update();
        }, 1000 / 60);
        console.log("Game loop running.");

    }

    update()
    {
        let players = Object.values(this.players);
        let bulletUpdateData = {};
        for (let key in this.bullets) {
            let bullet = this.bullets[key];

            bulletUpdateData[bullet.id] = {
                id: bullet.id,
                ownerId: bullet.label,
                x: bullet.position.x,
                y: bullet.position.y,
                angle: bullet.angle
            };

            // Remove if it goes too far off screen
            if(bullet.position.x < 0 || bullet.position.x > 5000 || bullet.position.y < 0 || bullet.position.y > 5000){
                Matter.World.remove(this.engine.world, this.bullets[key]);
                delete this.bullets[key];
            }
        }

        if (players.length > 0) {
            for (var i=0; i<players.length; i++) {
                let player = players[i];
                let ship = player.body;
                ship.angle = ship.angle % (Math.PI * 2);
                if (ship.speed > 32) {
                    Matter.Body.setVelocity(ship, Matter.Vector.mult(Matter.Vector.normalise(ship.velocity), 32));
                }
                if (ship.speed > 0 || ship.angularVelocity != 0) {
                    player.client.emit("move_player", {
                        id : player.id,
                        x : ship.position.x,
                        y : ship.position.y,
                        angle : 180 * ship.angle / Math.PI
                    });
                    player.client.broadcast.emit("move_player", {
                        id : player.id,
                        x : ship.position.x,
                        y : ship.position.y,
                        angle : 180 * ship.angle / Math.PI
                    });
                }
                if (player.isShooting && player.shootTimer <= 0) {
                    let bullet = Matter.Bodies.rectangle(
                        ship.position.x + 10 * Math.cos(ship.angle - Math.PI / 2),
                        ship.position.y + 10 * Math.sin(ship.angle - Math.PI / 2),
                        9,
                        37, {
                            collisionFilter: {
                                category: this.bulletCategory
                            }
                        }
                    );

                    bullet.label = player.id;
                    bullet.frictionAir = 0;
                    Matter.Body.setAngle(bullet, ship.angle);
                    Matter.Body.setVelocity(bullet, Matter.Vector.create(25 * Math.sin(bullet.angle), -25 * Math.cos(bullet.angle)));

                    Matter.World.add(this.engine.world, bullet);

                    let bulletEmitData = {
                        id: bullet.id,
                        ownerId: bullet.label,
                        x: bullet.position.x,
                        y: bullet.position.y,
                        angle: bullet.angle
                    };

                    player.client.emit("player_shoot", bulletEmitData);
                    player.client.broadcast.emit("player_shoot", bulletEmitData);

                    this.bullets[bullet.id] = bullet;
                    bulletUpdateData[bullet.id] = bulletEmitData;
                    player.shootTimer = 20;
                    player.isShooting = false;
                }

                player.client.emit("bullets_update", bulletUpdateData);

                if (player.shootTimer > 0) {
                    player.shootTimer--;
                }

                if (player.dashTimer > 0) {
                    player.dashTimer--;
                }

                Matter.Body.setAngularVelocity(ship, 0);
            }

            //update the leaderboard every second
            if(this.leaderboardTimer <= 0)
            {
                this.leaderboardTimer = 30;
                let leaderboard = this.updateLeaderboard(players);
                let player = players[0];
                if (player)
                    player.client.emit("leaderboard", leaderboard);
                    
                if (players.length > 1)
                    player.client.broadcast.emit("leaderboard", leaderboard);
            }
            else
            {
                this.leaderboardTimer--;
            }
        }
    }

    // SETUP

    startCollisionDetection(self) {
        Matter.Events.on(this.engine, "collisionStart", function(event) {
            //handles every collison on the server
            var pairs = event.pairs;    //every collision is stored as the pair of objects that are colliding

            for(var i=0; i < pairs.length; i++) {   //indexes through each collision
                var pair = pairs[i];

                var bulletCollisionData = undefined;
                var bulletToRemove = undefined;

                //sets the collision data
                if((pair.bodyA.collisionFilter.category === self.bulletCategory) && (pair.bodyB.collisionFilter.category === self.shipCategory)) {
                    bulletCollisionData = {
                        bulletId:   pair.bodyA.id,
                        ownerId:    pair.bodyA.label,
                        victimId:   pair.bodyB.label
                    }
                    bulletToRemove = pair.bodyA;
                }
                else if ((pair.bodyB.collisionFilter.category === self.bulletCategory) && (pair.bodyA.collisionFilter.category === self.shipCategory)) {
                    bulletCollisionData = {
                        bulletId:   pair.bodyB.id,
                        ownerId:    pair.bodyB.label,
                        victimId:   pair.bodyA.label
                    }
                    bulletToRemove = pair.bodyB;
                } else if ((pair.bodyA.collisionFilter.category === self.bulletCategory) && (pair.bodyB.collisionFilter.category === self.wallCategory)) {
                    bulletToRemove = pair.bodyA;
                } else if ((pair.bodyB.collisionFilter.category === self.bulletCategory) && (pair.bodyA.collisionFilter.category === self.wallCategory)) {
                    bulletToRemove = pair.bodyB;
                }

                if (bulletCollisionData) {
                    if (bulletCollisionData.ownerId !== bulletCollisionData.victimId) {
                        Matter.World.remove(self.engine.world, self.players[bulletCollisionData.victimId].body);
                        //console.log("This guy died:");
                        //console.log(self.players[bulletCollisionData.victimId]);
                        delete self.players[bulletCollisionData.victimId];
                        delete self.basePlayers[bulletCollisionData.victimId];

                        self.updateScore(bulletCollisionData.ownerId);   //update the score of bullet owner

                        self.players[bulletCollisionData.ownerId].client.emit("bullet_collision", bulletCollisionData);  //emits the collision data
                        self.players[bulletCollisionData.ownerId].client.broadcast.emit("bullet_collision", bulletCollisionData);  //emits the collision data
                    }
                    else
                    {
                        bulletToRemove = undefined;
                    }
                }

                if (bulletToRemove) {
                    //console.log("removing bullet");
                    Matter.World.remove(self.engine.world, bulletToRemove);
                    if (self.bullets[bulletToRemove.id]) {
                        delete self.bullets[bulletToRemove.id];
                        //console.log("Removed bullet with id " + bulletToRemove.id);
                    }
                }

                //console.log("Bodies: " + self.engine.world.bodies.length);
            }
        });
    }

    // LISTENERS & EMITTERS

    onPlayerInput(id, move, rotate, shoot, dash) {
        let player = this.players[id];
        let ship = player.body;

        if (move) {
            //player.isMoving = true;
            Matter.Body.applyForce(ship, ship.position, {
                x: +move * Math.sin(ship.angle) / 500,
                y: -move * Math.cos(ship.angle) / 500
            });
        }

        if (rotate != 0)
         Matter.Body.setAngularVelocity(ship, Math.PI / 60 * rotate);
        
        if (shoot && player.shootTimer === 0)
            player.isShooting = true;

        if (dash && player.dashTimer === 0) {
            player.dashTimer = 30;
            Matter.Body.applyForce(ship, ship.position, {
                x: Math.sin(ship.angle) / 10,
                y: -Math.cos(ship.angle) / 10
            })
        }
    }

    updateScore(ownerId) {
        let player = this.players[ownerId];
        if (player) {
            player.score += 10;
        }
        console.log(ownerId + " received 10 points!\nPlayer's score is now " + player.score);
        //emit to that guy his new score
    }

    updateLeaderboard(players)
    {
        //do a selection sort of the player scores
        var sortedPlayers = players;
        var leaderboard = [];

        for(var i = 0; i < sortedPlayers.length; i++)
        {
            var max = i;

            for(var j = i+1; j < sortedPlayers.length; j++)
            {
                if(sortedPlayers[j].score > sortedPlayers[max].score)
                {
                    max = j;
                }
            }

            var temp = sortedPlayers[i];
            sortedPlayers[i] = sortedPlayers[max];
            sortedPlayers[max] = temp;

            leaderboard.push({
                id:         sortedPlayers[i].id,
                name:       sortedPlayers[i].name,
                score:      sortedPlayers[i].score
            });
        }

        return leaderboard;
    }

    clamp(num, min, max)
    {
        return num <= min ? min : num >= max ? max : num;
    }
}

module.exports = World;
