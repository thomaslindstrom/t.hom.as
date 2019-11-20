import {getColor as getRandomColor} from 'random-material-color';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const canvasWidth = canvas.offsetWidth;
const canvasHeight = canvas.offsetHeight;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

function raf(callback) {
	return (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || (function (callback) {
		window.setTimeout(callback, 16);
	})).call(window, callback);
}

const piTimesTwo = Math.PI * 2;

function createPixel(options) {
	const pixel = {...options, cycle: 0, render: true};

	function tick() {
		pixel.x += pixel.speed.x;
		pixel.y += pixel.speed.y;

		if ((pixel.x > pixel.max.x)
		|| ((pixel.x + pixel.size) < pixel.min.x)
		|| (((pixel.y - pixel.size) > pixel.max.y))) {
			pixel.render = false;
		}
	}

	function draw(context) {
		let drawSize = pixel.size;
		const adjustedCycle = pixel.cycle / 10;

		if (drawSize > adjustedCycle) {
			drawSize = Math.min(drawSize, adjustedCycle);
		}

		context.fillStyle = pixel.color;
		context.beginPath();
		context.arc(pixel.x, pixel.y, drawSize / 2, 0, piTimesTwo);
		context.fill();

		pixel.cycle += 1;
	}

	pixel.tick = tick;
	pixel.draw = draw;

	return pixel;
}

const pixels = new Array(1000);
let pixelsCount = pixels.length;

function createRandomPixel(options) {
	const size = Math.round(Math.random() * 5);

	return createPixel({
		x: Math.round(Math.random() * canvasWidth) - size,
		y: Math.round(Math.random() * canvasHeight) - size,
		size,
		color: getRandomColor(),
		speed: {x: 0, y: 0},
		...options
	});
}

const pixelOptions = {
	min: {x: 0, y: 0},
	max: {x: canvasWidth, y: canvasHeight}
};

function pushRandomPixel(options) {
	const randomPixel = createRandomPixel({...pixelOptions, ...options});
	randomPixel.speed.y = Math.random() / 4;

	let i = pixelsCount;
	let shouldPushToArray = true;

	while (i) {
		i -= 1;

		if (pixels[i] === undefined) {
			pixels[i] = randomPixel;
			shouldPushToArray = false;
			break;
		}
	}

	if (shouldPushToArray) {
		pixels.push(randomPixel);
		pixelsCount += 1;
	}
}

let initialPopulation = canvasWidth;

while (initialPopulation) {
	pushRandomPixel();
	initialPopulation -= 1;
}

function birth() {
	raf(() => {
		setTimeout(() => {
			pushRandomPixel({y: 0});
			birth();
		}, 100);
	});
}

birth();

function draw() {
	context.clearRect(0, 0, canvasWidth, canvasHeight);
	let i = pixelsCount;

	while (i) {
		i -= 1;
		const pixel = pixels[i];

		if (pixel) {
			if (pixel.render === false) {
				pixels[i] = undefined;
				delete pixels[i];
			} else {
				pixel.draw(context);
				pixel.tick();
			}
		}
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
