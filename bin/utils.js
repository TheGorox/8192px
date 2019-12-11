const colors = [
    [255, 255, 255],
    [211, 211, 211],
    [169, 169, 169],
    [0, 0, 0],
    [255, 192, 203],
    [255, 0, 0],
    [255, 215, 0],
    [165, 42, 42],
    [255, 255, 0],
    [144, 238, 144],
    [0, 128, 0],
    [0, 255, 255],
    [173, 216, 230],
    [0, 0, 255],
    [255, 105, 180],
    [128, 0, 128],
    [255, 140, 0],
    [220, 20, 60],
];

function eq(rgb1, rgb2) {
    return rgb1[0] === rgb2[0] && rgb1[1] === rgb2[1] && rgb1[2] === rgb2[2];
}

function getColorId(clr) {
    let color_id = -1;
    for (let c = 2; c < colors.length; c++) {
        let rgb = colors[c];
        if (eq(clr, rgb)) {
            color_id = c;
            break;
        }
    }
    return color_id;
}

function charize(board){

}

module.exports = {
    colors,
    getColorId
}