class Packet {

    static handle(player) {
        throw new Error('Unimplemented Base Packet Function');
    }
    static getPacketName() {
        throw new Error('Unimplemented Base Packet Function');
    }
}
module.exports = Packet;