"use strict";

// const envmapProgramInfo = webglUtils.createProgramInfo(GlDrawer.gl, ["envmap-vertex-shader", "envmap-fragment-shader"]);
// const program = webglUtils.createProgramFromScripts(GlDrawer.gl, ["3d-vertex-shader", "3d-fragment-shader"]);

function main() {
    // Get A WebGL context
    let canvas1GlDrawer = new GLDrawer("my_Canvas");
    let camera = canvas1GlDrawer.getCamera();
    let skybox = new Skybox(canvas1GlDrawer.getGL());
    let objManager = new ObjManager(canvas1GlDrawer.getGL());
    let userInputHandler = new UserInputHandler(camera, canvas1GlDrawer.getCanvas());


    skybox.loadSkybox();
    const boeing = objManager.loadObj("boeing", "assets/objs/boeing_3.obj");
    const chair = objManager.loadObj("chair", "assets/objs/chair.obj");

    userInputHandler.attachAllDefaultHandlers(canvas1GlDrawer.getCanvas())
    camera.setCameraAttrDefault1(); //Set the camera


    //draw with starting time 0
    let then = 0;
    drawScene(0);
    // Draw the scene.
    function drawScene(time) {
        //console.log("draw:" + time);
        time *= 0.001; //convert to seconds
        // let deltaTime = time - then;  // Subtract the previous time from the current time
        then = time; //Remember the current time for the next frame.

        canvas1GlDrawer.preRender()

        //Draw Skybox
        skybox.drawSkybox(canvas1GlDrawer.getCamera());

        // Draw the geometry.
        canvas1GlDrawer.objDraw(boeing);
        canvas1GlDrawer.objDraw(chair);

        requestAnimationFrame(drawScene);
    }

}

main();