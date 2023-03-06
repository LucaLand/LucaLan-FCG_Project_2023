"use strict";

// const envmapProgramInfo = webglUtils.createProgramInfo(GlDrawer.gl, ["envmap-vertex-shader", "envmap-fragment-shader"]);
// const program = webglUtils.createProgramFromScripts(GlDrawer.gl, ["3d-vertex-shader", "3d-fragment-shader"]);

const Main = function() {
    // Get A WebGL context
    let canvas1GlDrawer = new GLDrawer("my_Canvas");
    let camera = canvas1GlDrawer.getCamera();
    let objManager = new ObjManager(canvas1GlDrawer.getGL());
    let userInputHandler = new UserInputHandler(camera, canvas1GlDrawer.getCanvas());

    let canvas2GlDrawer = new GLDrawer("canvas-2");

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
        if (userInputHandler.getCameraMode() === cameraModesEnum.firstPerson)
            userInputHandler.updateFirstPersonforCamera();

        canvas1GlDrawer.preRender()

        //Draw Skybox
        canvas1GlDrawer.drawSkybox();

        //Camera Movement test
        //objCamera.translate(0.01, 0,0);

        //Draw all the Geometries loaded
        canvas1GlDrawer.multipleObjDraw(objManager.getAllObjMesh());

        requestAnimationFrame(drawScene);
    }

    this.changeVisualMode = function (){
        if(userInputHandler.getCameraMode() === cameraModesEnum.firstPerson)
            userInputHandler.refreshCameraMode(cameraModesEnum.thirdPerson)
        else
            userInputHandler.refreshCameraMode(cameraModesEnum.firstPerson)
    }

    this.foto = function (){
        canvas2GlDrawer.camera = canvas1GlDrawer.camera;
        canvas2GlDrawer.preRender();
        canvas2GlDrawer.drawSkybox();
        canvas2GlDrawer.multipleObjDraw(objManager.getAllObjMesh());
    }

};

let main = new Main();
console.log("Main: ");
console.log(main);

