// ---------------------------------------------------------------------------
//  app: index.js
// ---------------------------------------------------------------------------

    import color from 'pleasejs';

    const w = window;

    const container = document.getElementById('container');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const errorTolerance = 8;
    const animationSpeed = 1;
    const multiplier = 24;
    const channelMax = 155;

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
        format: 'rgb'
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
                startColor.r + Math.round((errorTolerance / 2) - (Math.random() * errorTolerance)),
                startColor.g + Math.round((errorTolerance / 2) - (Math.random() * errorTolerance)),
                startColor.b + Math.round((errorTolerance / 2) - (Math.random() * errorTolerance))
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

        let x = Math.ceil(containerSize.width / multiplier);

        while (x--) {
            let y = Math.ceil(containerSize.height / multiplier);

            while (y--) {
                createPixel(x * multiplier, y * multiplier, multiplier, multiplier);
            }
        }

        clearTimeouts();
    }

    setup();

    window.addEventListener('resize', function () {
        setup();
    });

    function getPixel(targetX, targetY) {
        let _i = pixels.length;

        while (_i--) {
            let _pixel = pixels[_i];

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

        const _direction = options.direction || [0, 0];

        if (_direction[1] < 0) { // Ripple up
            callback(_pixel, getPixel(_pixelX, _pixelY - multiplier), 0, -1);

            // Ripple up left
            if (_direction[0] < 0) {
                callback(_pixel, getPixel(_pixelX - multiplier, _pixelY - multiplier), -1, -1);
            }

            // Ripple up right
            if (_direction[0] > 0) {
                callback(_pixel, getPixel(_pixelX + multiplier, _pixelY - multiplier), +1, -1);
            }
        } else if (_direction[1] > 0) { // Ripple down
            callback(_pixel, getPixel(_pixelX, _pixelY + multiplier), 0, +1);

            // Ripple down left
            if (_direction[0] < 0) {
                callback(_pixel, getPixel(_pixelX - multiplier, _pixelY + multiplier), -1, +1);
            }

            // Ripple down right
            if (_direction[0] > 0) {
                callback(_pixel, getPixel(_pixelX + multiplier, _pixelY + multiplier), +1, +1);
            }
        }

        // Ripple left
        if (_direction[0] < 0) {
            callback(_pixel, getPixel(_pixelX - multiplier, _pixelY), -1, 0);
        }

        // Ripple right
        if (_direction[0] > 0) {
            callback(_pixel, getPixel(_pixelX + multiplier, _pixelY), +1, 0);
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

            neighborPixel.rgb = [
                Math.max(0, Math.min(channelMax,
                    targetPixel.rgb[0] + Math.round((errorTolerance / 2) - (Math.random() * errorTolerance))
                )),
                Math.max(0, Math.min(channelMax,
                    targetPixel.rgb[1] + Math.round((errorTolerance / 2) - (Math.random() * errorTolerance))
                )),
                Math.max(0, Math.min(channelMax,
                    targetPixel.rgb[2] + Math.round((errorTolerance / 2) - (Math.random() * errorTolerance))
                ))
            ];

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
                format: 'rgb'
            })[0];

            _centerPixel.rgb = [
                _color.r,
                _color.g,
                _color.b
            ];

            timeouts.push(setTimeout(function () {
                ripple({
                    startX: _centerPosition.x,
                    startY: _centerPosition.y,
                    direction: [1, 1]
                }, rippleEffectColorSpread);
            }, 16 + (Math.random() * 250)));

            timeouts.push(setTimeout(function () {
                ripple({
                    startX: _centerPosition.x,
                    startY: _centerPosition.y,
                    direction: [-1, -1]
                }, rippleEffectColorSpread);
            }, 16 + (Math.random() * 250)));

            timeouts.push(setTimeout(function () {
                ripple({
                    startX: _centerPosition.x,
                    startY: _centerPosition.y,
                    direction: [1, -1]
                }, rippleEffectColorSpread);
            }, 16 + (Math.random() * 250)));

            timeouts.push(setTimeout(function () {
                ripple({
                    startX: _centerPosition.x,
                    startY: _centerPosition.y,
                    direction: [-1, 1]
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

        while (_i--) {
            let _pixel = pixels[_i];

            // Figure out how many channel differences there are. Eg. if
            // there's only one channel difference, it's thrice as fast
            // as when all are different
            let _differences = 0;

            if (_pixel._currentRGB[0] !== _pixel.rgb[0]) {
                _differences += 1;
            }

            if (_pixel._currentRGB[1] !== _pixel.rgb[1]) {
                _differences += 1;
            }

            if (_pixel._currentRGB[2] !== _pixel.rgb[2]) {
                _differences += 1;
            }

            if (_pixel._currentRGB[0] > _pixel.rgb[0]) {
                _pixel._currentRGB[0] -= animationSpeed + 3 - _differences;

                if (_pixel._currentRGB[0] < _pixel.rgb[0]) {
                    _pixel._currentRGB[0] = _pixel.rgb[0];
                }
            } else if (_pixel._currentRGB[0] < _pixel.rgb[0]) {
                _pixel._currentRGB[0] += animationSpeed + 3 - _differences;

                if (_pixel._currentRGB[0] > _pixel.rgb[0]) {
                    _pixel._currentRGB[0] = _pixel.rgb[0];
                }
            }

            if (_pixel._currentRGB[1] > _pixel.rgb[1]) {
                _pixel._currentRGB[1] -= animationSpeed + 3 - _differences;

                if (_pixel._currentRGB[1] < _pixel.rgb[1]) {
                    _pixel._currentRGB[1] = _pixel.rgb[1];
                }
            } else if (_pixel._currentRGB[1] < _pixel.rgb[1]) {
                _pixel._currentRGB[1] += animationSpeed + 3 - _differences;

                if (_pixel._currentRGB[1] > _pixel.rgb[1]) {
                    _pixel._currentRGB[1] = _pixel.rgb[1];
                }
            }

            if (_pixel._currentRGB[2] > _pixel.rgb[2]) {
                _pixel._currentRGB[2] -= animationSpeed + 3 - _differences;

                if (_pixel._currentRGB[2] < _pixel.rgb[2]) {
                    _pixel._currentRGB[2] = _pixel.rgb[2];
                }
            } else if (_pixel._currentRGB[2] < _pixel.rgb[2]) {
                _pixel._currentRGB[2] += animationSpeed + 3 - _differences;

                if (_pixel._currentRGB[2] > _pixel.rgb[2]) {
                    _pixel._currentRGB[2] = _pixel.rgb[2];
                }
            }

            const _random = Math.random();

            _pixel.rgb = [
                Math.round(_pixel.rgb[0] + 1 - (_random * 2)),
                Math.round(_pixel.rgb[1] + 1 - (_random * 2)),
                Math.round(_pixel.rgb[2] + 1 - (_random * 2))
            ];

            context.fillStyle = `rgb(${_pixel._currentRGB.join(',')})`;
            context.fillRect(_pixel.x, _pixel.y, _pixel.width, _pixel.height);
        }
    }

    function loop() {
        draw();
        raf(loop);
    }

    loop();
