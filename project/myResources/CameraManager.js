"use strict";

const cameraModesEnum = {
    thirdPerson: 1,
    firstPerson: 2
}

let CameraManager = function (gl){
    this.viewMatrix = m4.identity;
    this.cameraMatrix = m4.identity;
    this.projectionMatrix = m4.identity;

    this.fieldOfViewRadians = degToRad(60);

    this.targetPosition = [0, 0, 0];
    this.up = [0, 1, 0];
    this.zmin = 0.1;
    this.zfar = 200;
    this.distance = 5;

    this.theta = degToRad(0);       //Angolo su x
    this.phi = degToRad(90);        //Angolo su z

    this.cameraPosition = [5,0,5];  //Non viene usato con le polar cords
    this.angle = 0;                 //Angle used for forward direction in First Person mode
    this.angleVertical = 0;
    this.polarMode = true;

    let DLimitMax = 15, DLimitMin = 1;
    let fovLimitMax = 2.2, fovLimitMin = 0.4;
    let lookingAtTargetObj = true;
    let followingObj = true;
    let targetObj = null;
    let cameraPositionCenter = [0,0,0];

    this.setTargetObj = function (meshObj){
        targetObj = meshObj;
        this.setFollowTargetObj(true);
    }

    this.setLookAtTargetObj = function (bool){
        lookingAtTargetObj = bool;
    }

    this.setFollowTargetObj = function (bool){
        followingObj = bool;
        lookingAtTargetObj = bool;
    }

    this.computeCameraMatrixWithPolarCords = function (){
        let D = this.distance;
        let c = cameraPositionCenter;
        this.cameraPosition =[(D * Math.sin(this.theta) * Math.sin(this.phi)) + c[0],
            (D * Math.cos(this.phi)) + c[1],
            (D * Math.cos(this.theta) * Math.sin(this.phi)) + c[2]];

        //To go upside down (don't make camera twist in the pole)
        let yUp = Math.sin(this.phi);
        if(yUp <= 0.01 && yUp >= 0)
            yUp = 0.01;
        else if(yUp >= -0.01 && yUp <= 0)
            yUp = -0.01;

        this.up = [0, yUp, 0];
    }

     this.computeMatrix = function (){


         //Setting target on obj
         if(lookingAtTargetObj && targetObj !== null){
             this.targetPosition = targetObj.getPosition();
             if(followingObj)
                 cameraPositionCenter = targetObj.getPosition();
         }
         if(this.polarMode)
             this.computeCameraMatrixWithPolarCords();
         // Compute the projection matrix
         let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
         this.projectionMatrix = m4.perspective(this.fieldOfViewRadians, aspect, this.zmin, this.zfar);

         // Compute the camera's matrix using look at.
         this.cameraMatrix = m4.lookAt(this.cameraPosition, this.targetPosition, this.up);

         // Make a view matrix from the camera matrix.
         this.viewMatrix = m4.inverse(this.cameraMatrix);
     }

    //Computing Matrix first time this is created
    this.computeMatrix();

     this.setCameraAttrDefault1 = function (){
        let up = [0, 1, 0];
        let fieldOfViewRadians = degToRad(60);

        this.up = up;
        this.fieldOfViewRadians = fieldOfViewRadians;
        this.theta = degToRad(180);
        this.phi = degToRad(70);
        this.distance = 6;
        this.polarMode = true;
        this.setFollowTargetObj(true);
    }

    this.rotateCamera = function (dTheta, dPhi){
        this.theta += dTheta;
        this.phi += dPhi;
    }

    this.translateCameraDistance = function (deltaDistance) {
        let d = this.distance;
        if((d + deltaDistance) < DLimitMax && (d + deltaDistance) > DLimitMin)
            this.distance += deltaDistance;
        console.log("Camera Distance: " + this.distance)
        // this.computeMatrix();
    }

    this.setPolarPosition = function(degTheta, degPhi){
         this.theta = degToRad(degTheta);
         this.phi = degToRad(degPhi);
         // this.computeMatrix();
    }

    this.setCameraDistance = function (d){
         this.distance = d;
         // this.computeMatrix();
    }

    this.setCameraPosition = function(x, y, z){
        this.cameraPosition = [x,y,z]
        //this.computeMatrix();
    }

    this.translate = function (dx, dy, dz){
         let camera = this;
         let x = camera.cameraPosition[0]+dx, y = camera.cameraPosition[1]+dy, z = camera.cameraPosition[2]+dz;
        this.cameraPosition[0] = x;
        this.cameraPosition[1] = y;
        this.cameraPosition[2] = z;
        //this.computeMatrix();
     }

    this.move = function (directionAxis, step){
         let angle = this.angle;
        let dxf = step * Math.sin(angle);
        let dzf = step * Math.cos(angle);
        let dxr = step * Math.sin(angle + degToRad(90));
        let dzr = step * Math.cos(angle + degToRad(90));
        switch (directionAxis){
            case directions.Forward: this.translate(dxf, 0, dzf); break;
            case directions.Backward: this.translate(-dxf, 0, -dzf); break;
            case directions.Right: this.translate(-dxr, 0, -dzr); break;
            case directions.Left: this.translate(dxr, 0, dzr); break;
        }
    }

    this.setAngle = function (angle, angleVertical){
         this.angle = angle;
         this.angleVertical = angleVertical;
    }

    this.setTargetForward = function (){
         let angle = this.angle, angleVertical = this.angleVertical;
         let multiplier = 1000000000;
         this.targetPosition = [multiplier*Math.sin(angle)*Math.cos(angleVertical),multiplier*Math.sin(angleVertical),multiplier*Math.cos(angle)*Math.cos(angleVertical)];
    }

    this.addFov = function (deltaFov) {
        let fov = this.fieldOfViewRadians;
        let deltaFovDeg = degToRad(deltaFov);
         if(fov+deltaFovDeg > fovLimitMin && fov+deltaFovDeg < fovLimitMax)
            this.fieldOfViewRadians += degToRad(deltaFov);
    }


 //TODO. Add setter and getter for camera data (and autocompute matrix on this changes -  add this.matrixAutoUpdate = true)

}