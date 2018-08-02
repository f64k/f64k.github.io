'use strict';

function sgn(x) { return (x > 0) - (x < 0); }

window.addEventListener('DOMContentLoaded', function () {

    var div1 = document.getElementById('div1');

    if (div1) {

        div1.addEventListener('touchstart', function (event) {
            var t0 = event.targetTouches[0];
            if (event.target.id != 'svg1' && event.target.className.baseVal == 'svgdrag') {
                event.preventDefault();
                var elem = event.target;
                elem.className.baseVal = 'touched'; //elem.setAttribute('className','touched'); // elem.className = 'touched';


                var firstX = 0, firstY = 0;
                var xforms = elem.transform.baseVal; // An SVGTransformList
                if (xforms.length) {
                    var firstXForm = xforms.getItem(0);       // An SVGTransform
                    if (firstXForm.type == SVGTransform.SVG_TRANSFORM_TRANSLATE) {
                        firstX = firstXForm.matrix.e;
                        firstY = firstXForm.matrix.f;
                    }
                }
                elem.startX = t0.pageX - firstX;
                elem.startY = t0.pageY - firstY;
            }
            else {
                event.preventDefault();

                Spark(svgPoly1, t0);

                if (div1)
                { div1.innerHTML = t0.pageX + ";" + t0.pageY; }
            }
        }, false);

        div1.addEventListener('touchmove', function (event) {
            var t0 = event.targetTouches[0];
            if (event.target.id != 'svg1' && event.target.className.baseVal == 'touched') {
                event.preventDefault();
                var elem = event.target;
                var x = t0.pageX - elem.startX; // startX - добавленное свойство для хранения позиции начала перемещения
                var y = t0.pageY - elem.startY; // startY - добавленное свойство для хранения позиции начала перемещения
                //elem.style.left = x;
                //elem.style.top = y;
                elem.setAttribute("transform", "translate(" + x + "," + y + ")");
            }
            else {
                event.preventDefault();

                Spark(svgPoly1, t0);

                if (div1)
                { div1.innerHTML = t0.pageX + ";" + t0.pageY; }
            }
        }, false);

        div1.addEventListener('touchend', function (event) {
            if (event.target.id != 'svg1' && event.target.className.baseVal == 'touched') {
                event.preventDefault();
                var elem = event.target;
                elem.className.baseVal = 'svgdrag'; // elem.setAttribute('className','');
            }
            else {

            }
        }, false);

    }

    function updateOrientation() {
        event.preventDefault();
        var orientation = window.orientation;
        switch (orientation) {
            case 90: case -90:
                orientation = 'landscape';
                break;
            default:
                orientation = 'portrait';
        }
        var h1 = document.getElementById('h1');
        if (h1) {
            h1.innerHTML = 'Touch demo ' + orientation;
        }
    }

    window.addEventListener('orientationchange', updateOrientation, false);


    window.addEventListener('devicemotion', function (event) {
        event.preventDefault();
        var devicemotion = event;
        if (devicemotion.acceleration != undefined) {
            var accelLineX = document.getElementById('accelLineX');
            var accelLineY = document.getElementById('accelLineY');
            var velosVector = document.getElementById('velosVector');
            if (accelLineX && accelLineX.points && accelLineX.points.length > 1)
                if (accelLineY && accelLineY.points && accelLineY.points.length > 1) {
                    var aX = -5 * devicemotion.acceleration.x || 0;
                    var aY = 5 * devicemotion.acceleration.y || 0;
                    var aL = accelLineX.points.length;
                    var dx = accelLineX.points[aL - 1].x - accelLineX.points[aL - 2].x;
                    var newPt = svg1.createSVGPoint();
                    newPt.x = accelLineX.points[aL - 1].x + dx;
                    newPt.y = aX + 60;
                    accelLineX.points.appendItem(newPt);
                    if (aL > 64) {
                        accelLineX.points.removeItem(0);
                        for (i = 0; i < aL; i++) {
                            accelLineX.points[i].x -= dx;
                        }
                    }
                    newPt = svg1.createSVGPoint();
                    newPt.x = accelLineY.points[aL - 1].x + dx;
                    newPt.y = aY + 120;
                    accelLineY.points.appendItem(newPt);
                    if (aL > 64) {
                        accelLineY.points.removeItem(0);
                        for (i = 0; i < aL; i++) {
                            accelLineY.points[i].x -= dx;
                        }
                    }
                    velosVector.points[1].x -= aX;
                    velosVector.points[1].y -= aY;
                    if (Math.abs(aX) < 0.05 && Math.abs(aY) < 0.05) // если покой, то ошибку скорости убирать
                    {
                        velosVector.points[1].x -= 0.1 * (velosVector.points[1].x - velosVector.points[0].x); //0.1*sgn(velosVector.points[0].x-velosVector.points[1].x);
                        velosVector.points[1].y -= 0.1 * (velosVector.points[1].y - velosVector.points[0].y);
                    }
                }
        }
    }, true);




}, false);

