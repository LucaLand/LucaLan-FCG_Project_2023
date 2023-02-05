"use strict";

// const envmapProgramInfo = webglUtils.createProgramInfo(GlDrawer.gl, ["envmap-vertex-shader", "envmap-fragment-shader"]);
// const program = webglUtils.createProgramFromScripts(GlDrawer.gl, ["3d-vertex-shader", "3d-fragment-shader"]);

function main() {
    // Get A WebGL context
    let GlDrawer = new GLDrawer("my_Canvas");
    let skybox = new Skybox(GlDrawer.getGL());
    let camera = GlDrawer.getCamera();
    let objManager = new ObjManager(GlDrawer.getGL());

    skybox.loadSkybox();
    let boeing = objManager.loadObj("boeing", "assets/objs/boeing_3.obj");
    let chair = objManager.loadObj("chair", "assets/objs/chair.obj");

    //draw with starting time 0
    let then = 0;
    drawScene(0);

    function setCameraAttr(){
        let cameraPosition = [2, 0, 2];
        let up = [0, 1, 0];
        let target = [0, 0, 0];
        let fieldOfViewRadians = degToRad(30);

        camera.cameraPosition = cameraPosition;
        camera.up = up;
        camera.target = target;
        camera.fieldOfViewRadians = fieldOfViewRadians;
    }

    // Draw the scene.
    function drawScene(time) {
        time *= 0.001; //convert to seconds
        // let deltaTime = time - then;  // Subtract the previous time from the current time
        then = time; //Remember the current time for the next frame.

        GlDrawer.preRender()

        setCameraAttr();
        camera.computeMatrix();  //Camera Compute Matrix

        //Draw Skybox
        skybox.drawSkybox(camera.viewMatrix, camera.projectionMatrix);

        // Draw the geometry.
        // boeing.prepareObjDraw(GlDrawer.getGL(), camera, programs.ObjsProgramInfo.program);
        // GlDrawer.gl.drawArrays(GlDrawer.getGL().TRIANGLES, 0, boeing.numVertices);
        //
        // chair.prepareObjDraw(GlDrawer.getGL(), GlDrawer.getCamera(), programs.ObjsProgramInfo.program)
        // GlDrawer.gl.drawArrays(GlDrawer.getGL().TRIANGLES, 0, chair.numVertices);

        GlDrawer.objDraw(boeing);

        requestAnimationFrame(drawScene);
    }

}

main();