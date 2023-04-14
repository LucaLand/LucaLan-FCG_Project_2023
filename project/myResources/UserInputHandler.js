"use strict";

const events = {
        onMouseDown: "mousedown",
        onMouseUp: "mouseup",
        onMouseMove: "mousemove",
        onKeyDown: "keydown",
        onKeyUp: "keyup",
        onTouchStart: "touchstart",
        onTouchEnd: "touchend",
        onTouchMove: "touchmove",
        onWheel: "wheel"
};

const UserInputHandler = function (cam, canvas){
    let camera = cam;
    let drag = false;
    let old = {x:0, y:0};
    let targetObjMesh = null;
    let cameraMode = cameraModesEnum.thirdPerson;
    let oldCameraMode = cameraMode;
    let angle = 0, angleVertical = 0;
    let step = 0.5;
    let limitXP = 60, limitXNeg = -35, limitZP = 60, limitZNeg = -80;

    this.attachDefaultHandler = function (object, eventType){
        console.log("Adding event listener for Obj:" + object +" eType:" + eventType);
        object.addEventListener(eventType, (e) => handleUserEvent(e));
    }

    this.attachAllDefaultHandlers = function (optionalObject){
        let targetAddingHandler = canvas;
        if(optionalObject == null)
            targetAddingHandler = optionalObject;

        Object.values(events).forEach( eventType => {
            console.log(eventType)
            if(eventType !== events.onKeyDown && eventType !== events.onKeyUp)
                targetAddingHandler.addEventListener(eventType, (e) => handleUserEvent(eventType, e))
            else
                document.addEventListener(eventType, (e) => handleUserEvent(eventType, e));
        })
    }

    this.attachNewHandler = function (object, eventType, handlerFunc){
        console.log("Adding event listener for Obj:" + object +" eType:" + eventType);
        object.addEventListener(eventType, handlerFunc);
    }

    function handleUserEvent(eventType, e){
        let eventHandlerMap;

        switch (cameraMode) {
            case cameraModesEnum.thirdPerson:
                eventHandlerMap = eventHandlerArrayMapThirdPerson;
                break;
            case cameraModesEnum.firstPerson:
                eventHandlerMap = eventHandlerArrayMapFirstPerson;
                break;
            case cameraModesEnum.freeCamera:
                eventHandlerMap = eventHandlerArrayMapFreeCamera;
                break;
        }

        //DEBUGGING
        // console.log(e);

        eventHandlerMap.forEach(entry => {
            if (entry.eventName === eventType)
                entry.eventHandler(e);
        })
    }

    const mouseDownDefaultHandler = function (e){
        console.log("mouse Pressed!")
        drag = true;
        old.x = e.pageX;
        old.y = e.pageY;
    }

    const mouseUpDefaultHandler = function (e){
        drag = false;
        old.x=0;
        old.y=0;
        e.preventDefault();
    }

    const mouseMoveDefaultHandler = function (e){
       if(drag){
           let cur = {x: e.pageX, y:e.pageY};   //windowToCanvas(canvas, e.pageX, e.pageY);
           let dX = -(cur.x-old.x)*2*Math.PI/canvas.width;
           let dY = -(cur.y-old.y)*2*Math.PI/canvas.height;
           camera.rotateCamera(dX, dY);
           old.x=cur.x;
           old.y=cur.y;
       }
        e.preventDefault();
    }

    const mouseMoveHandlerFirstPerson = function (e){
        if(drag){
            let cur = {x: e.pageX, y:e.pageY};
            let dY = -(cur.y-old.y)*2*Math.PI/canvas.height;
            if(angleVertical+dY <= 1.5 && angleVertical+dY >= -1.5)
                angleVertical += dY;
            old.x=cur.x;
            old.y=cur.y;
        }
        e.preventDefault();
    }

    const mouseMoveHandlerFreeCamera = function (e){
        if(drag){
            let cur = {x: e.pageX, y:e.pageY};   //windowToCanvas(canvas, e.pageX, e.pageY);
            let dX = -(cur.x-old.x)*2*Math.PI/canvas.width;
            let dY = -(cur.y-old.y)*2*Math.PI/canvas.height;
            if(angleVertical+dY <= 1.5 && angleVertical+dY >= -1.5)
                angleVertical += dY;
            angle += dX;

            old.x=cur.x;
            old.y=cur.y;
        }
        e.preventDefault();
    }

    const wheelHandler = function (e){
        console.log("Wheel DeltaY: " + e.deltaY);
        camera.translateCameraDistance(e.deltaY/300)
        e.preventDefault();
    }

    const wheelHandlerFirstPerson = function (e){
        console.log("Wheel DeltaY: " + e.deltaY);
        camera.addFov(-e.deltaY/100);
        e.preventDefault();
    }

    const keyDownHandlerMap = function (e){
        if(targetObjMesh !== null) {
            activateObjLimits();
            switch (e.code) {
                case "KeyW":
                    targetObjMesh.move(directions.Forward, step);
                    break;
                case "KeyS":
                    targetObjMesh.move(directions.Backward, step);
                    break;
                case "KeyE":
                    targetObjMesh.move(directions.Right, step);
                    break;
                case "KeyQ":
                    targetObjMesh.move(directions.Left, step);
                    break;
                case "KeyA":
                    targetObjMesh.rotate(0, 5, 0);
                    break;
                case "KeyD":
                    targetObjMesh.rotate(0, -5, 0);
                    break;
                case "KeyV":
                    changeCameraMode();
                    break;
            }
        }
        console.log(e);
    }

    const keyDownHandlerMapFreeCamera = function (e){
        if(targetObjMesh !== null) {
            switch (e.code) {
                case "KeyW":
                    camera.move(directions.Forward, step);
                    break;
                case "KeyS":
                    camera.move(directions.Backward, step);
                    break;
                case "KeyE":
                    camera.move(directions.Right, step);
                    break;
                case "KeyQ":
                    camera.move(directions.Left, step);
                    break;
                case "KeyA":
                    angle += degToRad(3);
                    break;
                case "KeyD":
                    angle += degToRad(-3);
                    break;
                case "KeyV":
                    changeCameraMode();
                    break;
            }
        }
        console.log(e);
    }

    function activateObjLimits(){
        targetObjMesh.activateLimits(true);
        targetObjMesh.xPLimit = limitXP;
        targetObjMesh.xNegLimit = limitXNeg;
        targetObjMesh.zPLimit = limitZP;
        targetObjMesh.zNegLimit = limitZNeg;
    }

    const eventHandlerArrayMapThirdPerson = [
        {eventName: events.onMouseDown, eventHandler: mouseDownDefaultHandler},
        {eventName: events.onMouseUp, eventHandler: mouseUpDefaultHandler},
        {eventName: events.onMouseMove, eventHandler: mouseMoveDefaultHandler},
        {eventName: events.onWheel, eventHandler: wheelHandler},
        {eventName: events.onKeyDown, eventHandler: keyDownHandlerMap},
        {eventName: events.onTouchStart, eventHandler: mouseDownDefaultHandler},
        {eventName: events.onTouchEnd, eventHandler: mouseUpDefaultHandler},
        {eventName: events.onTouchMove, eventHandler: mouseMoveHandlerFreeCamera}
    ]

    const eventHandlerArrayMapFirstPerson = [
        {eventName: events.onWheel, eventHandler: wheelHandlerFirstPerson},
        {eventName: events.onKeyDown, eventHandler: keyDownHandlerMap},
        {eventName: events.onMouseDown, eventHandler: mouseDownDefaultHandler},
        {eventName: events.onMouseUp, eventHandler: mouseUpDefaultHandler},
        {eventName: events.onMouseMove, eventHandler: mouseMoveHandlerFirstPerson},
        {eventName: events.onTouchStart, eventHandler: mouseDownDefaultHandler},
        {eventName: events.onTouchEnd, eventHandler: mouseUpDefaultHandler},
        {eventName: events.onTouchMove, eventHandler: mouseMoveHandlerFirstPerson}
    ]

    const eventHandlerArrayMapFreeCamera = [
        {eventName: events.onWheel, eventHandler: wheelHandlerFirstPerson},
        {eventName: events.onKeyDown, eventHandler: keyDownHandlerMapFreeCamera},
        {eventName: events.onMouseDown, eventHandler: mouseDownDefaultHandler},
        {eventName: events.onMouseUp, eventHandler: mouseUpDefaultHandler},
        {eventName: events.onMouseMove, eventHandler: mouseMoveHandlerFreeCamera},
        {eventName: events.onTouchStart, eventHandler: mouseDownDefaultHandler},
        {eventName: events.onTouchEnd, eventHandler: mouseUpDefaultHandler},
        {eventName: events.onTouchMove, eventHandler: mouseMoveHandlerFreeCamera}
    ]

    this.setMovementTarget = function (movementTargetObj){
        targetObjMesh = movementTargetObj;
    }

    function setCameraMode(mode){
        console.log(cameraMode);
        cameraMode = mode;
        switch (mode) {
            case cameraModesEnum.thirdPerson:
                camera.setFollowTargetObj(true);
                camera.polarMode = true;
                camera.setCameraAttrDefault1();
                step = 1;
                break;
            case cameraModesEnum.firstPerson:
                camera.polarMode = false;
                camera.setFollowTargetObj(false);
                camera.up = [0,1,0];
                step = 0.5;
                break;
            case cameraModesEnum.freeCamera:
                camera.polarMode = false;
                camera.setFollowTargetObj(false);
                camera.setTargetForward();
                step = 3.0;
                break;
        }
    }

    this.setCameraMode = function (mode){
       setCameraMode(mode);
    }

    function changeCameraMode(){
        resetAngleVertical();
        targetObjMesh.setRotation(0, targetObjMesh.getRotation()[1], 0);

        cameraMode++;
        if(cameraMode >= 4)
            cameraMode = 1;
        setCameraMode(cameraMode);
    }

    this.changeCameraMode = function (){
        changeCameraMode();
    }

    this.getCameraMode = function (){
        return cameraMode;
    }

    this.updateFirstPersonforCamera = function (){
        camera.setCameraPosition(targetObjMesh.getPosition()[0], targetObjMesh.getPosition()[1], targetObjMesh.getPosition()[2]);
        angle = targetObjMesh.getRotation()[1];
        camera.setAngle(angle, angleVertical);
        targetObjMesh.setRotation(0, angle, 0);
        camera.move(directions.Forward, 1);
        camera.setTargetForward();

    }

    this.updateFreeCamera = function (){
        camera.setAngle(angle, angleVertical);
        camera.setTargetForward();
        step = 2;
    }

    this.refreshCameraMode = function (newCameraMode){
        if(newCameraMode !== oldCameraMode) {
            this.setCameraMode(newCameraMode);
            oldCameraMode = newCameraMode;
        }
    }

    function resetAngleVertical() {
        angleVertical = 0;
    }

    this.setStep = function (number){
        step = number;
    }

    this.setCameraMode(cameraMode); //init
}

