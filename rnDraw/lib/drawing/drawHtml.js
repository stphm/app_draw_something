// @flow
export const html = `<!DOCTYPE html>
<html>

<head>
    <style>
        html,
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
        }

        #drawing-area {
            border: 2px solid green;
        }

        .wall {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #000;
            opacity: 0.5;
            z-index: 100;
        }
    </style>
</head>

<body>

    <canvas id="drawing-area" class="drawing-area"></canvas>
    <div id="#wall"></div>

    <script>
        window.isAllowedToDraw = false;
        let wall = false;

        function setCanvasHeightAuto() {
            var documentWidth = document.documentElement ? document.documentElement.clientWidth : 0;
            var documentHeight = document.documentElement ? document.documentElement.clientHeight : 0;
            var innerWidth = window.innerWidth;
            var innerHeight = window.innerHeight;
            var screenWidth = screen.width;
            var screenHeight = screen.height;

            var width = screen.width * window.devicePixelRatio;
            var height = screen.height * window.devicePixelRatio;

            var setWidth = documentWidth && documentWidth > innerWidth ? documentWidth : innerWidth;
            var setHeight = documentHeight && documentHeight > innerHeight ? documentHeight : innerHeight;

            if (setWidth > width) {
                width = setWidth;
                height = setHeight;
            }

            document.getElementById("drawing-area").width = width;
            document.getElementById("drawing-area").height = height;
           
        }

        setCanvasHeightAuto();

        // =============
        // == Globals ==
        // =============
        const canvas = document.getElementById("drawing-area");
        window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "canvasSize",
            payload: {
                width: canvas.width,
                height: canvas.height,
            }
        }));
        const ctx = canvas.getContext("2d");

        const state = {
            mousedown: false,
        };

        // ===================
        // == Configuration ==
        // ===================
        const lineWidth = 10; // [[LINE_WIDTH]];
        const strokeStyle = '#000'; // '[[COLOR]]';

        ctx.lineCap = "round";
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;

        let points = [];
        let allPoints = [];

        let addPointsThrottle = null;

        // =====================
        // == Event Listeners ==
        // =====================
        canvas.addEventListener("mousedown", handleWritingStart);
        canvas.addEventListener("mousemove", handleWritingInProgress);
        canvas.addEventListener("mouseup", handleDrawingEnd);
        canvas.addEventListener("mouseout", handleDrawingEnd);

        canvas.addEventListener("touchstart", handleWritingStart);
        canvas.addEventListener("touchmove", handleWritingInProgress);
        canvas.addEventListener("touchend", handleDrawingEnd);

        // ====================
        // == Event Handlers ==
        // ====================
        function handleWritingStart(event) {
            if (!window.isAllowedToDraw) return;
            event.preventDefault();

            const mousePos = getMosuePositionOnCanvas(event);

            ctx.beginPath();

            ctx.moveTo(mousePos.x, mousePos.y);

            points.push({
                x: mousePos.x,
                y: mousePos.y,
                c: ctx.strokeStyle,
            });

            ctx.fill();

            state.mousedown = true;
        }

        function handleWritingInProgress(event) {
            if (!window.isAllowedToDraw) return;
            event.preventDefault();

            if (state.mousedown) {
                const mousePos = getMosuePositionOnCanvas(event);

                ctx.lineTo(mousePos.x, mousePos.y);

                points.push({
                    x: mousePos.x,
                    y: mousePos.y,
                    c: ctx.strokeStyle,
                });

                ctx.stroke();
            }
        }

        function redrawAllLines() {
            const existingStrokeStyle = ctx.strokeStyle;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let allPt of allPoints) {
                ctx.strokeStyle = allPt[0].c;
                console.log(allPt[0].c);

                ctx.beginPath();
                ctx.moveTo(allPt[0].x, allPt[0].y);
                ctx.fill();

                for (let pt of allPt) {
                    ctx.lineTo(pt.x, pt.y);
                    ctx.stroke();
                }

                ctx.closePath();
            }

            ctx.strokeStyle = existingStrokeStyle;
        }

        function setColor(colour) {
            ctx.strokeStyle = colour;
        }

        function setStrokeWidth(width) {
            ctx.lineWidth = width;
        }

        function undoLines() {
            allPoints.pop();

            redrawAllLines();
        }

        function clearDrawing() {
            points = [];
            allPoints = [];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        function handleDrawingEnd(event) {
            if (!window.isAllowedToDraw) return;
            event.preventDefault();

            if (state.mousedown) {
                ctx.stroke();
            }
            state.mousedown = false;
            if (points.length > 0) {
                allPoints.push(points);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: "pathPoints",
                    payload: points,
                }));
                points = [];
            }

            ctx.closePath();

        }

        // ======================
        // == Helper Functions ==
        // ======================
        function getMosuePositionOnCanvas(event) {
            const clientX = event.clientX || event.touches[0].clientX;
            const clientY = event.clientY || event.touches[0].clientY;
            const { offsetLeft, offsetTop } = event.target;
            const canvasX = clientX - offsetLeft;
            const canvasY = clientY - offsetTop;

            return { x: canvasX, y: canvasY };
        }


        // setInterval(() => {
        //     //window.ReactNativeWebView.postMessage("exit");
        // }, 1000);

        document.addEventListener('message', function (e) {
            const data = JSON.parse(e.data);
            switch (data.type) {
                case "setColor":
                    setColor(data.payload);
                    break;
                case "setStrokeWidth":
                    setStrokeWidth(data.payload);
                    break;

                case 'wall':
                    wall = !wall;
                    if (wall) {
                        document.getElementById("wall").classList.add("wall");
                    } else {
                        document.getElementById("wall").classList.remove("wall");
                    }
                    break;
                case 'add_point':
                    try {
                        if ('' == data.payload) return;
                        allPoints.push(JSON.parse(data.payload));
                        redrawAllLines();                        
                    } catch (error) {
                        window.ReactNativeWebView.postMessage(error);
                    }
                    break;
                case 'undo':
                    undoLines();
                    undoLines();
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: "undo",
                    }));
                    break;
                case 'clear':
                    clearDrawing();
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: "clear",
                    }));
                    break;
                case 'set_is_drawing_enabled':
                    window.isAllowedToDraw = data.payload;
                    break;
                case 'undo_no_emit':
                    undoLines();
                    break;
                case 'clear_no_emit':
                    clearDrawing();
                    break;
            }
        });
    </script>
</body>

</html>`;
