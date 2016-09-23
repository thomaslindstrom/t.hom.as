// ---------------------------------------------------------------------------
//  app: index.js
// ---------------------------------------------------------------------------

    import color from 'pleasejs';

    const w = window;

    const container = document.getElementById('container');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const ERROR_TOLERANCE = 8;
    const ANIMATION_SPEED = 1;
    const MULTIPLIER = 24;
    const CHANNEL_MAX = 155;

    const STRING_RGB = 'rgb';
    const STRING_PAREN_OPEN = '(';
    const STRING_PAREN_CLOSE = ')';
    const STRING_COMMA = ',';

    const NUMBER_MINUS_ONE = -1;
    const NUMBER_ZERO = 0;
    const NUMBER_PLUS_ONE = +1;
    const NUMBER_PLUS_TWO = +2;
    const NUMBER_PLUS_THREE = +3;

    let containerSize = getContainerSize();
    let mousePosition = null;

    function raf(callback) {
        return (w.requestAnimationFrame
            || (w.webkitRequestAnimationFrame)
            || (w.mozRequestAnimationFrame)
            || (function (callback) {
                    w.setTimeout(callback, 16);
               })
        ).call(w, callback);
    }

    function getContainerSize() {
        return {
            width: container.offsetWidth,
            height: container.offsetHeight
        };
    }

    function getCenterPosition() {
        if (mousePosition) {
            return mousePosition;
        }

        return {
            x: Math.round(containerSize.width / 2),
            y: Math.round(containerSize.height / 2)
        };
    }

    window.addEventListener('mousemove', function (event) {
        mousePosition = {
            x: event.pageX,
            y: event.pageY
        };
    });

    canvas.style.imageRendering = '-moz-crisp-edges';
    canvas.style.imageRendering = '-o-crisp-edges';
    canvas.style.imageRendering = '-webkit-optimize-contrast';
    canvas.style.imageRendering = 'pixelated';
    canvas.style.msInterpolationMode = 'nearest-neighbor';

    context.mozImageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;

    container.appendChild(canvas);

    let timeouts = [];

    function clearTimeouts() {
        let _i = timeouts.length;

        while (_i--) {
            if (timeouts[_i]) {
                clearTimeout(timeouts[_i]);
            }
        }

        timeouts.length = 0;
    }

    const pixels = [];
    const startColor = color.make_color({
        saturation: 0.7,
        value: 0.6,
        format: STRING_RGB
    })[0];

    function createPixel(x, y, width, height) {
        const _pixel = {
            x: x,
            y: y,
            width: width,
            height: height,
            rgb: [
                startColor.r,
                startColor.g,
                startColor.b
            ],
            _currentRGB: [
                startColor.r + Math.round((ERROR_TOLERANCE / 2) - (Math.random() * ERROR_TOLERANCE)),
                startColor.g + Math.round((ERROR_TOLERANCE / 2) - (Math.random() * ERROR_TOLERANCE)),
                startColor.b + Math.round((ERROR_TOLERANCE / 2) - (Math.random() * ERROR_TOLERANCE))
            ]
        };

        pixels.push(_pixel);
    }

    function setup() {
        containerSize = getContainerSize();
        mousePosition = null;

        canvas.width = containerSize.width;
        canvas.height = containerSize.height;

        pixels.length = 0;

        let x = Math.ceil(containerSize.width / MULTIPLIER);

        while (x--) {
            let y = Math.ceil(containerSize.height / MULTIPLIER);

            while (y--) {
                createPixel(x * MULTIPLIER, y * MULTIPLIER, MULTIPLIER, MULTIPLIER);
            }
        }

        clearTimeouts();
    }

    setup();

    window.addEventListener('resize', () => {
        setup();
    });

    function getPixel(targetX, targetY) {
        let _i = pixels.length;
        let _pixel;

        while (_i--) {
            _pixel = pixels[_i];

            if (!_pixel) {
                return;
            }

            if (targetX >= _pixel.x
            && (targetX < _pixel.x + _pixel.width)
            && (targetY >= _pixel.y)
            && (targetY < _pixel.y + _pixel.height)) {
                return _pixel;
            }
        }
    }

    function ripple(options, callback) {
        const _pixel = getPixel(options.startX, options.startY);

        if (!_pixel) {
            return;
        }

        const _pixelX = _pixel.x;
        const _pixelY = _pixel.y;

        const _direction = options.direction || [NUMBER_ZERO, NUMBER_ZERO];
        const _directionX = _direction[NUMBER_ZERO];
        const _directionY = _direction[NUMBER_PLUS_ONE];

        if (_directionY < NUMBER_ZERO) { // Ripple up
            callback(_pixel, getPixel(_pixelX, _pixelY - MULTIPLIER), NUMBER_ZERO, NUMBER_MINUS_ONE);

            // Ripple up left
            if (_directionX < NUMBER_ZERO) {
                callback(_pixel, getPixel(_pixelX - MULTIPLIER, _pixelY - MULTIPLIER), NUMBER_MINUS_ONE, NUMBER_MINUS_ONE);
            }

            // Ripple up right
            if (_directionX > NUMBER_ZERO) {
                callback(_pixel, getPixel(_pixelX + MULTIPLIER, _pixelY - MULTIPLIER), NUMBER_PLUS_ONE, NUMBER_MINUS_ONE);
            }
        } else if (_directionY > NUMBER_ZERO) { // Ripple down
            callback(_pixel, getPixel(_pixelX, _pixelY + MULTIPLIER), NUMBER_ZERO, NUMBER_PLUS_ONE);

            // Ripple down left
            if (_directionX < NUMBER_ZERO) {
                callback(_pixel, getPixel(_pixelX - MULTIPLIER, _pixelY + MULTIPLIER), NUMBER_MINUS_ONE, NUMBER_PLUS_ONE);
            }

            // Ripple down right
            if (_directionX > NUMBER_ZERO) {
                callback(_pixel, getPixel(_pixelX + MULTIPLIER, _pixelY + MULTIPLIER), NUMBER_PLUS_ONE, NUMBER_PLUS_ONE);
            }
        }

        // Ripple left
        if (_directionX < NUMBER_ZERO) {
            callback(_pixel, getPixel(_pixelX - MULTIPLIER, _pixelY), NUMBER_MINUS_ONE, NUMBER_ZERO);
        }

        // Ripple right
        if (_directionX > NUMBER_ZERO) {
            callback(_pixel, getPixel(_pixelX + MULTIPLIER, _pixelY), NUMBER_PLUS_ONE, NUMBER_ZERO);
        }
    }

    function rippleEffectColorSpread(targetPixel, neighborPixel, xDistance, yDistance) {
        if (!targetPixel || !neighborPixel) {
            return;
        }

        if (neighborPixel.timeout) {
            clearTimeout(neighborPixel.timeout);
        }

        neighborPixel.timeout = setTimeout(function () {
            if (!targetPixel || !neighborPixel) {
                return;
            }

            neighborPixel.rgb[NUMBER_ZERO] = Math.max(NUMBER_ZERO, Math.min(CHANNEL_MAX,
                targetPixel.rgb[NUMBER_ZERO] + Math.round((ERROR_TOLERANCE / NUMBER_PLUS_TWO) - (Math.random() * ERROR_TOLERANCE))
            ));

            neighborPixel.rgb[NUMBER_PLUS_ONE] = Math.max(NUMBER_ZERO, Math.min(CHANNEL_MAX,
                targetPixel.rgb[NUMBER_PLUS_ONE] + Math.round((ERROR_TOLERANCE / NUMBER_PLUS_TWO) - (Math.random() * ERROR_TOLERANCE))
            ));

            neighborPixel.rgb[NUMBER_PLUS_TWO] = Math.max(NUMBER_ZERO, Math.min(CHANNEL_MAX,
                targetPixel.rgb[NUMBER_PLUS_TWO] + Math.round((ERROR_TOLERANCE / NUMBER_PLUS_TWO) - (Math.random() * ERROR_TOLERANCE))
            ));

            ripple({
                startX: neighborPixel.x,
                startY: neighborPixel.y,
                direction: [xDistance, yDistance]
            }, rippleEffectColorSpread);
        }, 16 + (Math.random() * 500));
    }

    function start() {
        const _centerPosition = getCenterPosition();
        const _centerPixel = getPixel(
            _centerPosition.x,
            _centerPosition.y
        );

        clearTimeouts();

        if (_centerPixel) {
            const _color = color.make_color({
                saturation: 0.7,
                value: 0.6,
                format: STRING_RGB
            })[NUMBER_ZERO];

            _centerPixel.rgb[NUMBER_ZERO] = _color.r;
            _centerPixel.rgb[NUMBER_PLUS_ONE] = _color.g;
            _centerPixel.rgb[NUMBER_PLUS_TWO] = _color.b;

            timeouts.push(setTimeout(function () {
                ripple({
                    startX: _centerPosition.x,
                    startY: _centerPosition.y,
                    direction: [NUMBER_PLUS_ONE, NUMBER_PLUS_ONE]
                }, rippleEffectColorSpread);
            }, 16 + (Math.random() * 250)));

            timeouts.push(setTimeout(function () {
                ripple({
                    startX: _centerPosition.x,
                    startY: _centerPosition.y,
                    direction: [NUMBER_MINUS_ONE, NUMBER_MINUS_ONE]
                }, rippleEffectColorSpread);
            }, 16 + (Math.random() * 250)));

            timeouts.push(setTimeout(function () {
                ripple({
                    startX: _centerPosition.x,
                    startY: _centerPosition.y,
                    direction: [NUMBER_PLUS_ONE, NUMBER_MINUS_ONE]
                }, rippleEffectColorSpread);
            }, 16 + (Math.random() * 250)));

            timeouts.push(setTimeout(function () {
                ripple({
                    startX: _centerPosition.x,
                    startY: _centerPosition.y,
                    direction: [NUMBER_MINUS_ONE, NUMBER_PLUS_ONE]
                }, rippleEffectColorSpread);
            }, 16 + (Math.random() * 250)));
        }

        raf(function () {
            setTimeout(function () {
                start();
            }, 16 + 2000 + (Math.random() * 5000));
        });
    }

    start();

    function draw() {
        let _i = pixels.length;
        let _pixel;

        let _red = NUMBER_ZERO;
        let _green = NUMBER_ZERO;
        let _blue = NUMBER_ZERO;

        let _currentRed = NUMBER_ZERO;
        let _currentGreen = NUMBER_ZERO;
        let _currentBlue = NUMBER_ZERO;

        let _differences = NUMBER_ZERO;
        let _random = NUMBER_ZERO;

        while (_i--) {
            _pixel = pixels[_i];

            _red = _pixel.rgb[NUMBER_ZERO];
            _green = _pixel.rgb[NUMBER_PLUS_ONE];
            _blue = _pixel.rgb[NUMBER_PLUS_TWO];

            _currentRed = _pixel._currentRGB[NUMBER_ZERO];
            _currentGreen = _pixel._currentRGB[NUMBER_PLUS_ONE];
            _currentBlue = _pixel._currentRGB[NUMBER_PLUS_TWO];

            // Figure out how many channel differences there are. Eg. if
            // there's only one channel difference, it's thrice as fast
            // as when all are different
            _differences = NUMBER_ZERO;

            if (_currentRed !== _red) {
                _differences += NUMBER_PLUS_ONE;
            }

            if (_currentGreen !== _green) {
                _differences += NUMBER_PLUS_ONE;
            }

            if (_currentBlue !== _blue) {
                _differences += NUMBER_PLUS_ONE;
            }

            if (_currentRed > _red) {
                _pixel._currentRGB[NUMBER_ZERO] -= ANIMATION_SPEED + NUMBER_PLUS_THREE - _differences;

                if (_currentRed < _red) {
                    _pixel._currentRGB[NUMBER_ZERO] = _red;
                }
            } else if (_currentRed < _red) {
                _pixel._currentRGB[NUMBER_ZERO] += ANIMATION_SPEED + NUMBER_PLUS_THREE - _differences;

                if (_currentRed > _red) {
                    _pixel._currentRGB[NUMBER_ZERO] = _red;
                }
            }

            if (_currentGreen > _green) {
                _pixel._currentRGB[NUMBER_PLUS_ONE] -= ANIMATION_SPEED + NUMBER_PLUS_THREE - _differences;

                if (_currentGreen < _green) {
                    _pixel._currentRGB[NUMBER_PLUS_ONE] = _green;
                }
            } else if (_currentGreen < _green) {
                _pixel._currentRGB[NUMBER_PLUS_ONE] += ANIMATION_SPEED + NUMBER_PLUS_THREE - _differences;

                if (_currentGreen > _green) {
                    _pixel._currentRGB[NUMBER_PLUS_ONE] = _green;
                }
            }

            if (_currentBlue > _blue) {
                _pixel._currentRGB[NUMBER_PLUS_TWO] -= ANIMATION_SPEED + NUMBER_PLUS_THREE - _differences;

                if (_currentBlue < _blue) {
                    _pixel._currentRGB[NUMBER_PLUS_TWO] = _blue;
                }
            } else if (_currentBlue < _blue) {
                _pixel._currentRGB[NUMBER_PLUS_TWO] += ANIMATION_SPEED + NUMBER_PLUS_THREE - _differences;

                if (_currentBlue > _blue) {
                    _pixel._currentRGB[NUMBER_PLUS_TWO] = _blue;
                }
            }

            _random = Math.random();

            _pixel.rgb[NUMBER_ZERO] = Math.round(_red + NUMBER_PLUS_ONE - (_random * NUMBER_PLUS_TWO));
            _pixel.rgb[NUMBER_PLUS_ONE] = Math.round(_green + NUMBER_PLUS_ONE - (_random * NUMBER_PLUS_TWO));
            _pixel.rgb[NUMBER_PLUS_TWO] = Math.round(_blue + NUMBER_PLUS_ONE - (_random * NUMBER_PLUS_TWO));

            context.fillStyle = STRING_RGB + STRING_PAREN_OPEN + _pixel._currentRGB.join(STRING_COMMA) + STRING_PAREN_CLOSE;
            context.fillRect(_pixel.x, _pixel.y, _pixel.width, _pixel.height);
        }
    }

    function loop() {
        draw();
        raf(loop);
    }

    loop();
