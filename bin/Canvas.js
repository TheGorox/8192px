const fs = require('fs');
const PNG = require('pngjs').PNG;
const {
    getColorId,
    colors
} = require('./utils');

class Canvas {
    static START_SIZE = 2;

    constructor() {
        this.data = [];
        this.width = 0;
        this.height = 0;
    }

    generateData() {
        let data = [];

        this.width = this.height = Canvas.START_SIZE;

        let whiteColorId = getColorId([255, 255, 255]);
        if (whiteColorId < 0) whiteColorId = 0;

        for (let i = 0; i < this.width * this.height; i++) {
            data.push(whiteColorId);
        }

        return data
    }

    getPixel(x, y) {
        return this.data[x + this.width * y]
    }

    setPixel(x, y, colId) {
        this.data[x + this.width * y] = colId
    }

    async load(path) {
        if (path) {
            await this.importFrom(path);
        } else {
            this.data = this.generateData();
        }
    }

    async importFrom(path) {
        return new Promise((res, rej) => {
            let self = this;
            fs.createReadStream(path).pipe(new PNG()).on('parsed', function (buf) {
                buf = new Uint8Array(buf);
                // context will be in PNG
                self.width = this.width;
                self.height = this.height;

                let data = [];
                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++) {
                        let idx = (x + this.width * y) << 2; // x << 2 = x * 4
                        let rgb = [buf[idx], buf[idx + 1], buf[idx + 2]];
                        let colIdx = getColorId(rgb);

                        data.push(colIdx < 0 ? 0 : colIdx);
                    }
                }

                self.data = data;
                res();
            })
        })
    }

    async save(path) {
        return new Promise((res, rej) => {
            const png = new PNG({
                width: this.width,
                height: this.height,
                filterType: -1
            });

            for (let y = 0; y < png.height; y++) {
                for (let x = 0; x < png.width; x++) {
                    var idx = (png.width * y + x) << 2;
                    let color = colors[this.getPixel(x, y)];

                    png.data[idx] = color[0];
                    png.data[idx + 1] = color[1];
                    png.data[idx + 2] = color[2];
                    png.data[idx + 3] = 255;
                }
            }

            png.pack().pipe(fs.createWriteStream(path)).on('close', res);
        })
    }

    expand(pixels) {
        let whiteColorId = getColorId([255, 255, 255]);
        if (whiteColorId < 0) whiteColorId = 0;

        let newWidth = this.width + pixels;
        let newHeight = this.height + pixels;

        let data = [];
        for (let y = 0; y < newHeight; y++) {
            for (let x = 0; x < newWidth; x++) {
                data.push(whiteColorId);
            }
        }

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let _x = (x + pixels/2) | 0;
                let _y = (y + pixels/2) | 0;

                const idx = newWidth * _y + _x;
                const oldIdx = x + this.width * y;

                data[idx] = this.data[oldIdx]
            }
        }

        this.width = newWidth;
        this.height = newHeight;
        this.data = data;
    }

    toBuffer(){
        let data = [];
        for(let i = 0; i < this.data.length; i++){
            (colors[this.data[i]] || colors[0]).forEach(el => data.push(el));
            data.push(255);
        }

        return new Uint8Array(data)
    }
}

module.exports = Canvas