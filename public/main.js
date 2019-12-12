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

window.createSocket = function createSocket(url) {
	return new WebSocket(url);
};

window.onresize = function (event) {
	viewport.width = window.innerWidth;
	viewport.height = window.innerHeight;

	requestAnimationFrame(function () {
		viewport.render();
	});
};

var content = document.querySelector('main');

const OPCODES = {
	PIXEL: 0,
	BOARD: 1,
	COOLDOWN: 2
}

var colors = [
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

let rgbaColors = colors.map(col => [...col, 255])
let rgbaColors32 = colors.map(col => 0xff000000 | col[2] << 16 | col[1] << 8 | col[0])

var palette = document.createElement('section');

palette.id = 'palette';
palette.className = 'palette';
colors.forEach((color, index) => {
	var button = document.createElement('button');
	button.className = 'swatch';
	button.dataset.index = index;
	button.style.backgroundColor = `rgb(${color.join(',')})`;
	button.onclick = function (event) {
		//palette.style.backgroundColor = name;
		viewport.color = index;
	};

	palette.appendChild(button);
});

content.appendChild(palette);

var viewport = document.createElement('canvas');
viewport.id = 'viewport';
viewport.className = 'viewport';
viewport.width = window.innerWidth;
viewport.height = window.innerHeight;
viewport.tabIndex = 0;

viewport.x = 0;
viewport.y = 0;

viewport.scale = 5;

viewport.color = 0;
viewport.tileX = 0;
viewport.tileY = 0;

viewport.canvas = document.createElement('canvas');
viewport.canvas.width = 2;
viewport.canvas.height = 2;

window.ontouchstart = function (event) {
	var screenX, screenY;
	var distance;

	window.ontouchstart = function touchstart(event) {
		if (event.touches.length == 1) {
			screenX = event.touches[0].screenX;
			screenY = event.touches[0].screenY;
		}

		if (event.touches.length == 2) {
			var x = event.touches[0].screenX - event.touches[1].screenX;
			var y = event.touches[0].screenY - event.touches[1].screenY;

			distance = Math.sqrt(x * x + y * y);
		}
	};

	window.ontouchmove = function touchmove(event) {
		if (event.touches.length == 1) {
			var touch = event.touches[0];
			viewport.x += (event.touches[0].screenX - screenX) / viewport.scale;
			viewport.y += (event.touches[0].screenY - screenY) / viewport.scale;

			screenX = event.touches[0].screenX;
			screenY = event.touches[0].screenY;
		} else if (event.touches.length == 2) {
			var x = event.touches[0].screenX - event.touches[1].screenX;
			var y = event.touches[0].screenY - event.touches[1].screenY;

			var value = Math.sqrt(x * x + y * y);
			var delta = (value - distance) * 0.25;

			viewport.scale = Math.min(Math.max(viewport.scale + delta, 1), 100);
			distance = value;
		}

		requestAnimationFrame(function () {
			viewport.render();
		});

		event.preventDefault();
	};

	window.ontouchend = function touchend(event) {
		screenX = event.touches[0].screenX;
		screenY = event.touches[0].screenY;
	};

	return window.ontouchstart(event);

};

window.onmousedown = function (ev) {
	var buttons = {};
	var screenX, screenY;
	let startX = ev.clientX;
	let startY = ev.clientY;

	window.onclick = function click(event) {
		if (event.button == 0) {
			var delta = viewport.scale <= 5 ? 1 : 5;
			if (event.altKey || event.ctrlKey) {
				viewport.scale = Math.max(1, viewport.scale - delta);
			} else if (event.shiftKey) {
				viewport.scale = Math.min(100, viewport.scale + delta);
			}

			requestAnimationFrame(function () {
				viewport.render();
			});

			return event.preventDefault();
		}
	};

	window.onwheel = function wheel(event) {
		var delta = (viewport.scale <= 5 ? 1 : 5) * Math.sign(event.deltaY);
		viewport.scale = Math.min(Math.max(viewport.scale - delta, 1), 100);
		requestAnimationFrame(function () {
			viewport.render();
		});
	};

	window.onmousedown = function (event) {
		buttons[event.button] = true;

		screenX = event.screenX;
		screenY = event.screenY;

		startX = event.clientX;
		startY = event.clientY;

		event.preventDefault();
	};

	window.onmousemove = function mousemove(event) {
		if (viewport.style.cursor == 'move') {
			viewport.style.cursor = '';
		}

		if (buttons[0]) {
			viewport.style.cursor = 'move';
			viewport.x += (event.screenX - (screenX || event.screenX)) / viewport.scale;
			viewport.y += (event.screenY - (screenY || event.screenY)) / viewport.scale;
		}

		var canvas = viewport.canvas;
		viewport.tileX = Math.floor(
			(event.offsetX - viewport.width / 2) / viewport.scale + canvas.width / 2 - viewport.x
		);

		viewport.tileY = Math.floor(
			(event.offsetY - viewport.height / 2) / viewport.scale + canvas.height / 2 - viewport.y
		);

		requestAnimationFrame(function () {
			viewport.render();
		});

		event.preventDefault();

		screenX = event.screenX;
		screenY = event.screenY;
	};

	window.onmouseup = function mouseup(event) {
		if (event.button == 0) {
			if (viewport.style.cursor == 'move') {
				viewport.style.cursor = '';
			}
		}

		let endX = event.clientX;
		let endY = event.clientY;

		delete buttons[event.button];

		if (Math.abs(startX - endX) < 5 && Math.abs(startY < endY) < 5) {
			if (event.button == 0) {
				if (event.shiftKey || event.ctrlKey || event.altKey) {
					return event.preventDefault();
				}

				if (viewport.timeout == null) {
					var canvas = viewport.canvas;
					var x = Math.floor(
						(event.offsetX - viewport.width / 2) / viewport.scale + canvas.width / 2 - viewport.x
					);

					var y = Math.floor(
						(event.offsetY - viewport.height / 2) / viewport.scale + canvas.height / 2 - viewport.y
					);

					if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
						return event.preventDefault();
					}

					const dv = new DataView(new ArrayBuffer(6));

					dv.setUint8(0, OPCODES.PIXEL);

					dv.setUint16(1, x);
					dv.setUint16(3, y);

					dv.setUint8(5, viewport.color);

					socket.send(dv.buffer);

					viewport.tileX = null;
					viewport.tileY = null;
				}

				requestAnimationFrame(function () {
					viewport.render();
				});

				return event.preventDefault();
			}
		}
	};

	window.onmouseout = function (event) {
		for (var key in buttons) {
			delete buttons[key];
		}
	};

	return window.onmousedown(ev);
};

viewport.render = function render() {
	var context = viewport.getContext('2d');

	context.save();
	context.clearRect(0, 0, viewport.width, viewport.height);

	context.translate(viewport.width / 2, viewport.height / 2);
	context.scale(viewport.scale, viewport.scale);
	context.translate(viewport.x, viewport.y);

	var canvas = viewport.canvas;
	context.translate(-canvas.width / 2, -canvas.height / 2);

	context.fillStyle = 'white';
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.imageSmoothingEnabled = false;
	context.drawImage(canvas, 0, 0);

	context.fillStyle = 'rgb(' + colors[viewport.color].join(',') + ')';
	context.fillRect(viewport.tileX, viewport.tileY, 1, 1);

	context.restore();
};

requestAnimationFrame(function () {
	viewport.render();
});

content.appendChild(viewport);

var socket = window.createSocket(
	location.protocol.replace('http', 'ws') + '//' + location.host
);

socket.binaryType = 'arraybuffer';
socket.onopen = function (event) {
	socket.reconnect = true;

	var hint = document.createElement('p');
	hint.id = 'hint';

	var hints = [
		'The cooldown after placing a pixel can be up to 8192 seconds long.',
		'Check out 8192px on <a href="https://reddit.com/8192px">Reddit</a>"',
		'The canvas will expand every 8192 seconds.',
		'Use your imagination, be creative and have fun.',
		'Join the <a href="https://discord.gg/XdN2CHk">Discord</a> chat server',
		'Try to work with what is already on the canvas.',
		'The palette will colors change every now and then.',
		'8192px is hosted with <a href="https://m.do.co/c/77e38b5a6b3e">DigitalOcean</a>, they are freaking awesome.',
		'8192px is open source, check it out on <a href="https://github.com/8192px/8192px">GitHub</a>',
	];

	if (/phone|pad|tablet|droid/i.test(navigator.userAgent)) {
		hints = [
			'Double tap to place a pixel.',
			'Pinch to zoom in and out.',
		].concat(hints);
	} else {
		hints = [
			'Double click to place a pixel.',
			'Click a color swatch in the palette to switch colors.',
			'Click while holding the shift key to zoom in.',
			'Click and drag to move the canvas.',
			'Click while holding the control key to zoom out.',
		].concat(hints);
	}

	hint.className = 'hint fade-out';

	setTimeout(function show() {
		hint.innerHTML = hints[0];
		content.appendChild(hint);

		hints = hints.sort(function () {
			return 0.5 - Math.random();
		});

		setTimeout(function hide() {
			content.removeChild(hint);
		}, 60 * 1000);

		setTimeout(show, 300 * 1000);
	}, 0);
};

socket.onmessage = function (event) {
	let message = event.data;
	if (typeof message === 'string') {
		// ... string handle
	} else {
		let dv = new DataView(message);
		switch (dv.getUint8(0)) { // OPCODE
			case OPCODES.BOARD: {
				var canvas = viewport.canvas;
				var context = canvas.getContext('2d');

				var x = dv.getUint16(2);
				var y = dv.getUint16(4);

				var width = dv.getUint16(6);
				var height = dv.getUint16(8);

				let compressed = dv.getUint8(1);
				let bufferData;
				let timer = Date.now();
				if(compressed == 1){
					bufferData = decompress(new Int8Array(dv.buffer.slice(10)))
					console.log('Got compressed data, decompression took: ' + (Date.now() - timer) + 'ms');
				}else{
					bufferData = new Uint8Array(dv.buffer.slice(10));
					console.log('Got UNcompressed data');
				}

				if ((width != 1 && width != canvas.width) || (height != 1 && height != canvas.height)) {
					var bitmap = context.getImageData(0, 0, canvas.width, canvas.height);

					canvas.width = width;
					canvas.height = height;

					context.putImageData(bitmap, 0, 0);
				}

				var bitmap = context.getImageData(x, y, width, height);
				
				let intView = new Uint32Array(bitmap.data.buffer);
				timer = Date.now();
				bufferData.forEach((colorId, i) => {
					intView[i] = rgbaColors32[colorId];
					//imageData.push.apply(imageData, rgbaColors[colorId])
				})
				console.log('Conversion took: ' + (Date.now() - timer) + 'ms')
				
				//bitmap.data.set(imageData);

				context.putImageData(bitmap, x, y);

				requestAnimationFrame(function () {
					viewport.render();
				});

				break
			}
			case OPCODES.PIXEL: {
				let x = dv.getUint16(1);
				let y = dv.getUint16(3);
				let colorId = dv.getUint8(5);

				let context = viewport.canvas.getContext('2d');
				context.fillStyle = `rgb(${colors[colorId].join(',')})`;
				context.fillRect(x, y, 1, 1);

				break
			}
			case OPCODES.COOLDOWN: {
				var hint = document.createElement('p');
				hint.id = 'hint';
				hint.className = 'hint';
				content.appendChild(hint);

				viewport.timeout = setTimeout(function tick(wait) {
					var now = Date.now();
					var time = wait - now;

					hint.innerHTML = 'Wait... (' + Math.ceil(time / 1000) + ')';

					if (viewport.style.cursor == '') {
						viewport.style.cursor = 'wait';
					}

					if (time > 0) {
						return viewport.timeout = setTimeout(tick, 1000, wait);
					}

					content.removeChild(hint);
					viewport.timeout = null;

					if (viewport.style.cursor == 'wait') {
						viewport.style.cursor = '';
					}
				}, 0, dv.getFloat64(1));
			}
		}
	}
};

socket.onclose = function () {
	var status = document.createElement('p');
	status.className = 'hint';

	if (socket.reconnect) {
		status.innerHTML = [
			'Connection lost, <a href="#" onclick="location.reload()">click</a> or wait to reconnect...',
		].join('\n');

		setTimeout(function () {
			location.reload();
		}, 60 * 1000);
	} else {
		status.innerHTML = [
			'Unable to connect, <a href="#" onclick="location.reload()">click</a> to retry...',
		].join('\n');
	}

	content.appendChild(status);
};