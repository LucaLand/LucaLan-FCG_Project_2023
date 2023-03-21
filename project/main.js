"use strict";

// const envmapProgramInfo = webglUtils.createProgramInfo(GlDrawer.gl, ["envmap-vertex-shader", "envmap-fragment-shader"]);
// const program = webglUtils.createProgramFromScripts(GlDrawer.gl, ["3d-vertex-shader", "3d-fragment-shader"]);

let photo = 0;

const Main = function() {
    // Get A WebGL context
    let canvas1GlDrawer = new GLDrawer("my_Canvas");
    let camera = canvas1GlDrawer.getCamera();
    let objManager = new ObjManager();
    let userInputHandler = new UserInputHandler(canvas1GlDrawer.getCamera(), canvas1GlDrawer.getCanvas());
    let skybox1 = new Skybox(canvas1GlDrawer.getGL(), canvas1GlDrawer.getPrograms().SkyBoxProgramInfo);
    canvas1GlDrawer.setSkybox(skybox1);

    let canvas2GlDrawer = new GLDrawer("canvas-2");
    canvas2GlDrawer.enableCullFace(false);
    let skybox2 = new Skybox(canvas2GlDrawer.getGL(), canvas2GlDrawer.getPrograms().SkyBoxProgramInfo);
    canvas2GlDrawer.setSkybox(skybox2);

    let nightSkybox1 = new NightSkybox(canvas1GlDrawer.getGL(), canvas1GlDrawer.getPrograms().SkyBoxProgramInfo);
    let nightSkybox2 = new NightSkybox(canvas2GlDrawer.getGL(), canvas2GlDrawer.getPrograms().SkyBoxProgramInfo);

    //CREAZIONE SCENA
    //Camera OBJ
    const objCamera = objManager.loadObj("camera", "assets/objs/DigitalCamera_v3_L3.123c1cb807d5-2d9f-49cf-a1e4-b466a061bb87/10818_DigitalCamera_v2.obj");
    objCamera.setPosition(0, 1, 0);

    let scale= 50;
    const sanpietriniStreet = objManager.loadObj("strada", "assets/objs/sanpietrini_street.obj");
    sanpietriniStreet.setScale(100, 0.1, 100);
    sanpietriniStreet.setPosition(0, 0, 0);

    const torreEiffelObj = objManager.loadObj("Eiffel", "assets/objs/Torre-Eiffel.obj");
    torreEiffelObj.setScale(scale, scale, scale);
    torreEiffelObj.setPosition(25, scale, 25);

    const cortile_pareti = objManager.loadObj("pareti-cortile", "assets/objs/cortile-pareti.obj");
    cortile_pareti.setScale(scale,scale,scale);
    cortile_pareti.setPosition(0, scale/4, 0);
    cortile_pareti.setShadowRender(false);

    const lampione = objManager.loadObj("lampione", "assets/objs/Street Lamp/StreetLamp.obj");
    lampione.setScale(scale*3/2,scale*3/2,scale*3/2);
    lampione.setPosition(-30, 32, 25);


    //USER INPUTS Handlers
    userInputHandler.setMovementTarget(objCamera);
    userInputHandler.attachAllDefaultHandlers(canvas1GlDrawer.getCanvas());
    camera.setTargetObj(objCamera);


    //LIGHT TEST
    let light = new Light();
    light.setSunLight();
    canvas1GlDrawer.setLight(light);

    let night = false;
    let animate = 0, i=0;
    //draw with starting time 0
    let then = 0;
    drawScene(0);

    // Draw the scene.
    function drawScene(time) {
        //console.log("draw:" + time);
        time *= 0.001; //convert to seconds
        let deltaTime = time - then;  // Subtract the previous time from the current time

        pullSettingsFromUI();
        handleSettings(Settings);

        updateVisualAndUI();

        if(photo !== 0 && photo <= 30){
            console.log("Shooting: " + photo);
            photo++;
            if(photo % 30 === 0)
                drawPhoto();
        }else{
            photo = 0;
        }

        // If more than 0 result in laggin behaviour (tryed to maximize performance with deltaTime)
        if(deltaTime >=0) {
            render(time);
        }

        requestAnimationFrame(drawScene);
    }

    function render(time){
        then = time; //Remember the current time for the next frame.

        canvas1GlDrawer.getCamera().computeMatrix();

        //Draw the scene with all the Geometries loaded
        canvas1GlDrawer.drawSceneWObjects(objManager.getAllObjMesh());

        if(animate !== 0){
            i += animate;
            light.setLightTarget(2*i, i/2, 20);
            if(i > 50){
                animate = -1;
            }else if(i < 0){
                animate=  1;
            }
        }

    }

    function handleSettings(settings) {
        let time = settings.time;
        if(time < 50 && time >= 0){
            setNight(false);
            light.updateTime(time);
        }else if(time < 0){
            settings.time = 0;
        }else if(time <= 100 && time >= 50){
            setNight(true);
            light.updateTime(time);
        }else if(time > 100){
            settings.time = 100
        }
    }

    function pushSettingsInUI(){

    }

    function pullSettingsFromUI(){
        let inputTime = document.getElementById("inputTime");
        // console.log(inputTime.getAttribute("value"))
        Settings.time = inputTime.value;
    }

    this.changeVisualMode = function (){
        userInputHandler.changeCameraMode();
    }

    function drawPhoto() {
        canvas2GlDrawer.setCamera(canvas1GlDrawer.getCamera());
        canvas2GlDrawer.setLight(canvas1GlDrawer.getLight());
        canvas2GlDrawer.preRender();
        canvas2GlDrawer.drawSkybox();
        canvas2GlDrawer.drawSceneWObjects(objManager.getAllObjMesh());
    }

    this.drawPhoto = function (){
        drawPhoto();
    }

    this.getCameraMode = function (){
        return userInputHandler.getCameraMode();
    }

    function updateVisualAndUI(){
        let buttonVisual = document.getElementById("buttonVisual");
        switch (userInputHandler.getCameraMode()) {
            case cameraModesEnum.thirdPerson:
                buttonVisual.innerText = "Terza Persona!";
                break;
            case cameraModesEnum.firstPerson:
                buttonVisual.innerText = "Prima Persona!";
                userInputHandler.updateFirstPersonforCamera();
                break;
            case cameraModesEnum.freeCamera:
                buttonVisual.innerText = "Camera Libera!";
                userInputHandler.updateFreeCamera();
                break;
        }
        toggleFotoButton();
    }

    function toggleFotoButton(){
        let buttonFoto = document.getElementById("buttonFoto");
        if(userInputHandler.getCameraMode() === cameraModesEnum.firstPerson) {
            buttonFoto.setAttribute("class", "");
        } else {
            buttonFoto.setAttribute("class", "invisible");
        }
    }

    function setNight(bool){
        if(night !== bool) {
            night = bool;
            if (bool) {
                light.setSpotLight();
                canvas1GlDrawer.setSkybox(nightSkybox1);
                canvas2GlDrawer.setSkybox(nightSkybox2);
            } else {
                light.setSunLight();
                canvas1GlDrawer.setSkybox(skybox1);
                canvas2GlDrawer.setSkybox(skybox2);
            }
        }
    }

};

let main = new Main();
console.log("Main: ");
console.log(main);

