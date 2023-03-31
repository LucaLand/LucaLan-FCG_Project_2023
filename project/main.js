"use strict";


let photo = 0;

const Main = function() {
    // Get A WebGL context
    let canvas1GlDrawer = new GLDrawer("my_Canvas");
    let camera = canvas1GlDrawer.getCamera();
    let objManagerLight = new ObjManager()
    let objManagerFull = new ObjManager();
    let objManager = objManagerFull;
    let userInputHandler = new UserInputHandler(canvas1GlDrawer.getCamera(), canvas1GlDrawer.getCanvas());
    let skybox1 = new Skybox(canvas1GlDrawer.getGL(), canvas1GlDrawer.getPrograms().SkyBoxProgramInfo);
    canvas1GlDrawer.setSkybox(skybox1);

    let canvas2GlDrawer = new GLDrawer("canvas-2");
    // canvas2GlDrawer.enableCullFace(false);
    let skybox2 = new Skybox(canvas2GlDrawer.getGL(), canvas2GlDrawer.getPrograms().SkyBoxProgramInfo);
    canvas2GlDrawer.setSkybox(skybox2);

    let nightSkybox1 = new NightSkybox(canvas1GlDrawer.getGL(), canvas1GlDrawer.getPrograms().SkyBoxProgramInfo);
    let nightSkybox2 = new NightSkybox(canvas2GlDrawer.getGL(), canvas2GlDrawer.getPrograms().SkyBoxProgramInfo);

    //CREAZIONE SCENA
    //Camera OBJ
    const objCamera = objManager.loadObj("camera", "assets/objs/DigitalCamera_v3_L3.123c1cb807d5-2d9f-49cf-a1e4-b466a061bb87/10818_DigitalCamera_v2.obj");
    objCamera.setPosition(0, 2, -55);

    let scale= 50;
    const sanpietriniStreet = objManager.loadObj("strada", "assets/objs/sanpietrini_street.obj");
    sanpietriniStreet.setScale(100, 0.1, 200);
    sanpietriniStreet.setPosition(0, 0, 0);

    const torreEiffelObj = objManager.loadObj("Eiffel", "assets/objs/Torre-Eiffel.obj");
    torreEiffelObj.setScale(scale, scale, scale);
    torreEiffelObj.setPosition(25, scale, 25);

    // const cortile_pareti = objManager.loadObj("pareti-cortile", "assets/objs/cortile-pareti.obj");
    const cortile_pareti = objManager.loadObj("pareti-cortile", "assets/objs/PorticoStart_2.obj");
    cortile_pareti.setScale(scale,scale,scale*1.5);
    cortile_pareti.setPosition(60, scale/4, 0);
    // cortile_pareti.setShadowRender(false);

    const parete2 = objManager.duplicateObj(cortile_pareti);
    parete2.setRotation(0, degToRad(180), 0);
    parete2.setPosition(-35, scale/4, 0);

    const cortile_front = objManager.loadObj("front-cortile", "assets/objs/PorticoStart_Front.obj");
    cortile_front.setScale(scale,scale,scale);
    cortile_front.setPosition(15, scale/4, 60);
    cortile_front.setRotation(0, degToRad(-90), 0);

    const lampione = objManager.loadObj("lampione", "assets/objs/Street Lamp/StreetLamp.obj");
    lampione.setScale(scale*2/2,scale*3/2,scale*2/2);
    lampione.setPosition(-22, 32, 25);

    const panchina = objManager.loadObj("panchina", "assets/objs/Bench/bench.obj");
    panchina.setScale(5, 5, 5);
    panchina.setPosition(2, 2, 38);
    panchina.setRotation(0,degToRad(90), 0);

    const panchina2 = objManager.duplicateObj(panchina);
    panchina2.setPosition(2, 2, 12);

    const panchina3 = objManager.duplicateObj(panchina);
    panchina3.setPosition(20, 2, 2);
    panchina3.setRotation(0,0,0);

    //Light Scene
    objManagerLight.addLoadedMesh([objCamera, sanpietriniStreet, torreEiffelObj, cortile_front, cortile_pareti, parete2, lampione]);

    //USER INPUTS Handlers
    userInputHandler.setMovementTarget(objCamera);
    userInputHandler.attachAllDefaultHandlers(canvas1GlDrawer.getCanvas());
    camera.setTargetObj(objCamera);


    //LIGHT TEST
    let light = new Light();
    light.setSunLight(Settings.time);
    canvas1GlDrawer.setLight(light);

    let night = false;
    let animate = 0, i=0, lampType = 1;
    //draw with starting time 0
    let then = 0;
    drawScene(0);

    // Draw the scene.
    function drawScene(time) {
        //console.log("draw:" + time);
        time *= 0.001; //convert to seconds
        let deltaTime = time - then;  // Subtract the previous time from the current time

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
        if(deltaTime >=0 && loaded) {
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
            if(night)
                light.setLightTarget(2*i/2+5, i/6+4, 20);
            else
                light.updateTime(i/2);
            if(i > 100){
                animate = -1;
            }else if(i < 0){
                animate =  1;
            }
            i += animate;
        }

    }

    function handleSettings(settings, changeName) {
        let time = settings.time;
        if(time < 50 && time >= 0) {
            light.updateTime(time);
        }

        if(settings.sun)
            setNight(false);
        else
            setNight(true);

        if(settings.animation && animate === 0)
            animate = 1;
        else if(!settings.animation)
            animate = 0;

        if(settings.lightScene)
            objManager = objManagerLight;
        else
            objManager = objManagerFull;

        if(settings.lampType !== lampType){
            lampType = settings.lampType;
            if(night)
                light.setSpotLight(lampType);
        }

        light.enabledShadows = settings.shadows;
        canvas1GlDrawer.enableCullFace(settings.enableCullFace);
        light.enableFrustumDraw = settings.frustum;
        if(changeName === "lightColor")
            light.setLightColorVec4(settings.lightColor[0], settings.lightColor[1], settings.lightColor[2]);
    }

    function pushSettingsInUI(){

    }

    this.pullSettingsFromUI = function (changeName){
        let inputTime = document.getElementById("inputTime");
        if(inputTime.value > 49)
            inputTime.value = 49;
        if(inputTime.value < 0)
            inputTime.value = 0;
        Settings.time = inputTime.value;

        let sun = document.getElementById("checkerSun");
        Settings.sun = sun.checked;

        let shadows = document.getElementById("shadows");
        Settings.shadows = shadows.checked;

        let lightColor = document.getElementById("lightColor").value;
        const red = parseInt(lightColor.substring(1, 3), 16)/255;
        const green = parseInt(lightColor.substring(3, 5), 16)/255;
        const blue = parseInt(lightColor.substring(5, 7), 16)/255;
        Settings.lightColor = [red, green, blue];

        let backFaceCulling = document.getElementById("backFaceCulling");
        Settings.enableCullFace = backFaceCulling.checked;

        let lampType = document.getElementById("lampType");
        if(lampType.value < 1)
            lampType.value = 1;
        if(lampType.value > 3)
            lampType.value = 3;
        Settings.lampType = lampType.value;

        let animation = document.getElementById("animation");
        Settings.animation = animation.checked;

        let frustumDraw = document.getElementById("frustum");
        Settings.frustum = frustumDraw.checked;

        let lightScene = document.getElementById("lightScene");
        Settings.lightScene = lightScene.checked;

        //Handle them
        handleSettings(Settings, changeName);
    }

    this.changeVisualMode = function (){
        userInputHandler.changeCameraMode();
    }

    function drawPhoto() {
        canvas2GlDrawer.setCamera(canvas1GlDrawer.getCamera());
        canvas2GlDrawer.setLight(canvas1GlDrawer.getLight());
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
                light.setSpotLight(lampType);
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

