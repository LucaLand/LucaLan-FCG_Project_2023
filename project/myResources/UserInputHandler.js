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
        //TODO. Remove and associate directly the handler in addEventListener (in the attach function)
        if(cameraMode === cameraModesEnum.thirdPerson) {
            eventHandlerArrayMap.forEach(entry => {
                if (entry.eventName === eventType)
                    entry.eventHandler(e);
            })
        }else{
            eventHandlerArrayMapFirstPerson.forEach(entry => {
                if (entry.eventName === eventType)
                    entry.eventHandler(e);
            })
        }
    }

    const mouseDownDefaultHandler = function (e){
        console.log("mouse Pressed!")
        drag = true;
        old.x = e.pageX;
        old.y = e.pageY;
        //e.preventDefault();
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
            switch (e.code) {
                case "KeyW":
                    targetObjMesh.move(directions.Forward, 0.2);
                    break;
                case "KeyS":
                    targetObjMesh.move(directions.Backward, 0.2);
                    break;
                case "KeyE":
                    targetObjMesh.move(directions.Right, 0.2);
                    break;
                case "KeyQ":
                    targetObjMesh.move(directions.Left, 0.2);
                    break;
                case "KeyA":
                    targetObjMesh.rotate(0, 5, 0);
                    break;
                case "KeyD":
                    targetObjMesh.rotate(0, -5, 0);
                    break;
                case "KeyV":
                    if(cameraMode === cameraModesEnum.thirdPerson)
                        cameraMode = cameraModesEnum.firstPerson;
                    else
                        cameraMode = cameraModesEnum.thirdPerson;
            }
        }
        console.log(e);
    }

    const eventHandlerArrayMap = [
        {eventName: events.onMouseDown, eventHandler: mouseDownDefaultHandler},
        {eventName: events.onMouseUp, eventHandler: mouseUpDefaultHandler},
        {eventName: events.onMouseMove, eventHandler: mouseMoveDefaultHandler},
        {eventName: events.onWheel, eventHandler: wheelHandler},
        {eventName: events.onKeyDown, eventHandler: keyDownHandlerMap}
    ]

    const eventHandlerArrayMapFirstPerson = [
        {eventName: events.onWheel, eventHandler: wheelHandlerFirstPerson},
        {eventName: events.onKeyDown, eventHandler: keyDownHandlerMap}
    ]

    this.setMovementTarget = function (movementTargetObj){
        targetObjMesh = movementTargetObj;
    }

    this.setCameraMode = function (mode){
        console.log(cameraMode);
        cameraMode = mode;
        switch (mode) {
            case cameraModesEnum.thirdPerson:
                camera.setFollowTargetObj(true);
                camera.up = [0,1,0];
                camera.polarMode = true;
                camera.setCameraAttrDefault1();
                break;
            case cameraModesEnum.firstPerson:
                camera.polarMode = false;
                camera.setFollowTargetObj(false);
                camera.up = [0,1,0];
                this.updateFirstPersonforCamera();
                break;
        }
    }

    this.getCameraMode = function (){
        return cameraMode;
    }

    this.updateFirstPersonforCamera = function (){
        camera.setCameraPosition(targetObjMesh.getPosition()[0], targetObjMesh.getPosition()[1], targetObjMesh.getPosition()[2]);
        camera.setAngle(targetObjMesh.getRotation()[1]);
        camera.move(directions.Forward, 1);
        camera.setTargetForward();
    }

    this.refreshCameraMode = function (newCameraMode){
        if(newCameraMode !== oldCameraMode) {
            this.setCameraMode(newCameraMode);
            oldCameraMode = newCameraMode;
        }
    }




    this.setCameraMode(cameraMode); //init
}

