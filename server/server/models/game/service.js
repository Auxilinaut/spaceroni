var World = require("./world.js");

class Service {
    // Intentionally Left Empty
}

if (global.world) {
    module.exports = global.world;
} else {
    module.exports = global.world = new World({});
}

module.exports = Service;