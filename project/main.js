"use strict";

function main() {
    // Get A WebGL context
    let canvas = document.getElementById("my_Canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }
    let skybox = new Skybox(gl);
    let camera = new CameraManager(gl);
    camera.computeMatrix();
    let objManager = new ObjManager(gl);

    // setup GLSL programs and lookup locations
    const envmapProgramInfo = webglUtils.createProgramInfo(gl, ["envmap-vertex-shader", "envmap-fragment-shader"]);
    const program = webglUtils.createProgramFromScripts(gl, ["3d-vertex-shader", "3d-fragment-shader"]);

    skybox.loadSkybox();
    let boeing = objManager.loadObj("Ciaooo", "assets/objs/boeing_3.obj");


    //draw with starting time 0
    let then = 0;
    drawScene(0);

    // Draw the scene.
    function drawScene(time) {
        // convert to seconds
        time *= 0.001;
        // Subtract the previous time from the current time
        // let deltaTime = time - then;
        // Remember the current time for the next frame.
        then = time;

        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        //Optimizing performance with Cull face (try to remove and see what happens)
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        let cameraPosition = [2, 0, 2];
        let up = [0, 1, 0];
        let target = [0, 0, 0];
        let fieldOfViewRadians = degToRad(30);


        camera.cameraPosition = cameraPosition;
        camera.up = up;
        camera.target = target;
        camera.fieldOfViewRadians = fieldOfViewRadians;

        //Camera Compute Matrix
        camera.computeMatrix();

        //Draw Skybox
        skybox.drawSkybox(camera.viewMatrix, camera.projectionMatrix);

        // Draw the geometry.
        boeing.prepareObjDraw(gl, camera, program);
        gl.drawArrays(gl.TRIANGLES, 0, boeing.numVertices);

        requestAnimationFrame(drawScene);
    }


}

main();