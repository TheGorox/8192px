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
    COOLDOWN: 2
}

module.exports = {
    colors,
    getColorId,
    OPCODES
}