var Player = require('./models/users/player.js');
var WorldInstance = require('./models/game/world.js')
var DisconnectPacket = require('./models/packets/disconnect.js');
var ConnectPacket = require('./models/packets/connect.js');
var MovementPacket = require('./models/packets/movement.js');
var Matter = require('./matter.js');

var io = require('socket.io')();
io.on('connection', function(client) {
	
	let player = new Player(client);

	client.on("new_player", (data) =>
		new ConnectPacket(data).handle(player)
	);

	client.on("disconnect", () =>
		new DisconnectPacket().handle(player)
    );

    client.on("player_input", (data) =>
		new MovementPacket(data).handle(player)
	);

});
io.listen(process.env.APP_PORT || 4200);