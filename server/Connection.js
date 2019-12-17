const {
    OPCODES,
    compress
} = require('./utils');

class Connection {
    constructor(connection, client) {
        this.socket = connection;
        this.session = client;

        this.lastPong = null;
    }

    ping() {
        console.trace('send ping')
        let dv = new DataView(new ArrayBuffer(1));
        dv.setUint8(0, OPCODES.PING);

        try {
            this.socket.send(dv.buffer);
        } catch (e) {
            console.log(e);
        }
    }

    sendCooldown(cd) {
        let dv = new DataView(new ArrayBuffer(1 + 8));
        dv.setUint8(0, OPCODES.COOLDOWN);
        dv.setFloat64(1, cd);

        try {
            this.socket.send(dv.buffer);
        } catch (error) {
            console.error(error);
        }
    }

    sendBoard(canvas) {
        let pixelData = canvas.data; //canvas.toBuffer();
        let compressed = compress(pixelData);
        const badCompression = (compressed.length > pixelData.length);
        let data
        if (badCompression) {
            data = new Uint8Array(pixelData.length + 10);
        } else {
            data = new Int8Array(compressed.length + 10);
        }

        let view = new DataView(data.buffer, data.byteOffset, data.byteLength);

        view.setUint8(0, OPCODES.BOARD);
        view.setUint8(1, badCompression ? 0 : 1);

        view.setUint16(2, 0);
        view.setUint16(4, 0);
        view.setUint16(6, canvas.width);
        view.setUint16(8, canvas.height);

        data.set(badCompression ? pixelData : compressed, 10);

        try {
            this.socket.send(data);
        } catch (error) {
            console.error(error);
        }
    }

    sendOnline(count) {
        let dv = new DataView(new ArrayBuffer(3));
        dv.setUint8(0, OPCODES.ONLINE);
        dv.setUint16(1, count);

        try {
            this.socket.send(dv.buffer);
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = Connection