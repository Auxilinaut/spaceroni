
class BasePlayer {
    constructor(data) {
        this.id = data.id;
        this.x = data.x;
        this.y = data.y;
        this.angle = data.angle;
        this.base64 = data.base64;
        this.name = data.name;
    }
}

module.exports = BasePlayer;