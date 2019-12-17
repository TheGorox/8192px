const colors = [
    [0, 0, 0],
    [34, 32, 52],
    [69, 40, 60],
    [102, 57, 49],
    [143, 86, 59],
    [223, 113, 38],
    [217, 160, 102],
    [238, 195, 154],
    [251, 242, 54],
    [153, 229, 80],
    [106, 190, 48],
    [55, 148, 110],
    [75, 105, 47],
    [82, 75, 36],
    [50, 60, 57],
    [63, 63, 116],
    [48, 96, 130],
    [91, 110, 225],
    [99, 155, 255],
    [95, 205, 228],
    [203, 219, 252],
    [255, 255, 255],
    [155, 173, 183],
    [132, 126, 135],
    [105, 106, 106],
    [89, 86, 82],
    [118, 66, 138],
    [172, 50, 50],
    [217, 87, 99],
    [215, 123, 186],
    [143, 151, 74],
    [138, 111, 48]
];

function eq(rgb1, rgb2) {
    return rgb1[0] === rgb2[0] && rgb1[1] === rgb2[1] && rgb1[2] === rgb2[2];
}

function getColorId(clr) {
    let color_id = -1;
    for (let c = 0; c < colors.length; c++) {
        let rgb = colors[c];
        if (eq(clr, rgb)) {
            color_id = c;
            break;
        }
    }
    return color_id;
}

const OPCODES = {
    PIXEL: 0,
    BOARD: 1,
    COOLDOWN: 2,
    PING: 3,
    ONLINE: 4
}

function compress(raw) {
    let compressed = [];

    let lastCol = null;
    let differents = [];

    let equalCount = 0;

    for (let i = 0; i < raw.length; i++) {
        let col = raw[i];
        if (col == lastCol) {
            ++equalCount
            if (differents.length > 0) {
                compressed.push(-differents.length);
                compressed.push(-1);
                compressed.push.apply(compressed, differents);
                differents = [];
            }
            if (equalCount == 126) {
                compressed.push(-(equalCount + 1));
                compressed.push(col);
                lastCol = null;
                equalCount = 0;

                continue
            }
        } else {
            if (equalCount > 0) {
                compressed.push(-(equalCount + 1));
                compressed.push(lastCol);
            }
            equalCount = 0;
            if (raw[i + 1] == col) {
                lastCol = col;
                continue
            }
            differents.push(col);
        }
        lastCol = col;
    }
    if (equalCount > 0) {
        compressed.push(-(equalCount + 1));
        compressed.push(lastCol);
    } else
    if (differents.length) {
        compressed.push(-differents.length);
        compressed.push(-1);
        compressed = compressed.concat(differents)
    }

    return compressed
}

function decompress(comp) {
    let raw = [];
    let diffRemain = 0;

    for (let i = 0; i < comp.length; i++) {
        let char = comp[i];
        if (diffRemain > 0) {
            diffRemain--
            raw.push(char);
            continue
        }
        if (char >= 0) {
            throw new Error('Decompression Error: unsigned char as flag');
        } else {
            let nextChar = comp[i + 1]
            if (nextChar == -1) { // different colors chain
                diffRemain = Math.abs(char)
                i++
                continue
            } else {
                i++
                raw.push.apply(raw, new Array(Math.abs(char)).fill(nextChar))
            }
        }
    }

    return raw
}

// function generate() {
//     let out = []
//     for (let i = 0; i < 2000*2000; i++) {
//         out.push(Math.random() * 3 | 0)
//     }
//     return out
// }

// for (let i = 0; i < 1000; i++) {
//     let timer = Date.now();
//     let generated = generate();
//     console.log(Date.now() - timer, 'gen')
//     timer = Date.now();
//     let comp = compress(generated);
//     console.log(Date.now() - timer, 'com')
//     timer = Date.now();
//     let decomp = decompress(comp);   
//     console.log(Date.now() - timer, 'dec')
//     console.log(i)

//     try{
//         decomp.forEach((val, idx) => {
//             if (val != generated[idx]) throw new Error()
//         })
//     }catch(e){
//         console.log(generated, 'generated')
//         console.log(comp, 'comp')
//         console.log(decomp, 'decomp')
//     }
// }

module.exports = {
    colors,
    getColorId,
    OPCODES,
    compress,
    decompress
}