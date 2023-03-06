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
    // const boeing = objManager.loadObj("boeing", "assets/objs/boeing_3.obj");
    // const chair = objManager.loadObj("chair", "assets/objs/chair.obj");


    const objCamera = objManager.loadObj("camera", "assets/objs/camera.obj")
    //testing duplication
    const objCmaera2 = objManager.duplicateObj(objCamera);
    userInputHandler.setMovementTarget(objCamera);

    userInputHandler.attachAllDefaultHandlers(canvas1GlDrawer.getCanvas());
    camera.setTargetObj(objCamera);     //Testing following target for camera

    // userInputHandler.setCameraMode(cameraModesEnum.firstPerson); //Test setting first person camera

    //draw with starting time 0
    let then = 0;
    drawScene(0);
    // Draw the scene.
    function drawScene(time) {
        //console.log("draw:" + time);
        time *= 0.001; //convert to seconds
        // let deltaTime = time - then;  // Subtract the previous time from the current time
        then = time; //Remember the current time for the next frame.

        userInputHandler.refreshCameraMode(userInputHandler.getCameraMode());
        if(userInputHandler.getCameraMode() === cameraModesEnum.firstPerson)
            userInputHandler.updateFirstPersonforCamera();

        canvas1GlDrawer.preRender()

        //Draw Skybox
        skybox.drawSkybox(canvas1GlDrawer.getCamera());

        //Camera Movement test
        //objCamera.translate(0.01, 0,0);

        //Draw all the Geometries loaded
        canvas1GlDrawer.multipleObjDraw(objManager.getAllObjMesh());

        requestAnimationFrame(drawScene);
    }

}

main();