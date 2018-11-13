import {getColor as getRandomColor} from 'random-material-color';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const canvasWidth = canvas.offsetWidth;
const canvasHeight = canvas.offsetHeight;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

function raf(callback) {
	return (window.requestAnimationFrame
		|| (window.webkitRequestAnimationFrame)
		|| (window.mozRequestAnimationFrame)
		|| (function (callback) {
			window.setTimeout(callback, 16);
		   })
	).call(window, callback);
}

function createPixel(options) {
	const pixel = {...options, cycle: 0, render: true};

	function tick() {
		pixel.x += pixel.speed.x;
		pixel.y += pixel.speed.y;

		if ((pixel.x > pixel.max.x)
		|| ((pixel.x + pixel.width) < pixel.min.x)
		|| ((pixel.y > pixel.max.y))) {
			pixel.render = false;
		}
	}

	function draw(context) {
		context.fillStyle = pixel.color;

		let drawWidth = pixel.width;
		let drawHeight = pixel.height;
		const adjustedCycle = pixel.cycle / 10;

		if (drawWidth > adjustedCycle) {
			drawWidth = Math.min(drawWidth, adjustedCycle);
		}

		if (drawHeight > adjustedCycle) {
			drawHeight = Math.min(drawHeight, adjustedCycle);
		}

		context.fillRect(pixel.x, pixel.y, drawWidth, drawHeight);
		pixel.cycle += 1;
	}

	pixel.tick = tick;
	pixel.draw = draw;

	return pixel;
}

const pixels = [];

function createRandomPixel(options) {
	const size = Math.round(Math.random() * 5);

	return createPixel({
		x: Math.round(Math.random() * canvasWidth) - size,
		y: Math.round(Math.random() * canvasHeight) - size,
		width: size,
		height: size,
		color: getRandomColor(),
		speed: {x: 0, y: 0},
		...options
	});
}

const pixelOptions = {
	min: {x: 0, y: 0},
	max: {x: canvasWidth, y: canvasHeight}
};

let pixelCount = 0;

function pushRandomPixel(options) {
	const randomPixel = createRandomPixel({...pixelOptions, ...options});
	randomPixel.speed.y = Math.random();

	pixels.push(randomPixel);
	pixelCount += 1;
}

while (pixelCount < canvasWidth) {
	pushRandomPixel();
}

function draw() {
	context.clearRect(0, 0, canvasWidth, canvasHeight);

	let pixelsLength = pixels.length;
	let i = pixelsLength;

	while (i -= 1) {
		if (pixels[i] && (pixels[i].render === false)) {
			pixels.splice(i, 1);
			pixelsLength -= 1;
		}
	}

	let y = 0;
	let pixel;

	while (y < pixelsLength) {
		pixel = pixels[y];

		if (pixel) {
			pixel.draw(context);
			pixel.tick();
		}

		y += 1;
	}
}

let drawCycle = 0;

while (drawCycle < 100) {
	draw();
	drawCycle += 1;
}

function loop() {
	draw();
	raf(loop);
}

loop();

setInterval(() => {
	if (pixels.length > (canvasHeight * 2)) {
		return;
	}

	pushRandomPixel({y: (Math.random() * 100) - 50});
}, Math.min(30, (250 / canvasWidth) * 250));
