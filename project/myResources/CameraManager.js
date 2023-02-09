"use strict";

let CameraManager = function (gl){
    this.viewMatrix = m4.identity;
    this.cameraMatrix = m4.identity;
    this.projectionMatrix = m4.identity;

    this.fieldOfViewRadians = degToRad(60);
    this.cameraPosition = [5,0,5];
    this.targetPosition = [0, 0, 0];
    this.up = [0, 1, 0];
    this.zmin = 0.1;
    this.zfar = 200;
    this.distance = 5;

    this.theta = degToRad(0);   //Angolo su x
    this.phi = degToRad(90);     //Angolo su z

    let DLimitMax = 10, DLimitMin = 1;
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
        this.up = [0, Math.sin(this.phi), 0];
        //this.computeMatrix();
    }

     this.computeMatrix = function (){

         this.computeCameraMatrixWithPolarCords();
         // Compute the projection matrix
         let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
         this.projectionMatrix = m4.perspective(this.fieldOfViewRadians, aspect, this.zmin, this.zfar);

         //Setting target on obj
         if(lookingAtTargetObj && targetObj !== null){
             this.targetPosition = targetObj.getPosition();
             if(followingObj)
                 cameraPositionCenter = targetObj.getPosition();
         }

         // Compute the camera's matrix using look at.
         this.cameraMatrix = m4.lookAt(this.cameraPosition, this.targetPosition, this.up);

         // Make a view matrix from the camera matrix.
         this.viewMatrix = m4.inverse(this.cameraMatrix);
     }

     //Computing Matrix first time this is created
    this.computeMatrix();

     this.setCameraAttrDefault1 = function (){
        const camera = this;

        let cameraPosition = [3, 0, 3];
        let up = [0, 1, 0];
        let target = [0, 0, 0];
        let fieldOfViewRadians = degToRad(60);

        camera.cameraPosition = cameraPosition;
        camera.up = up;
        camera.target = target;
        camera.fieldOfViewRadians = fieldOfViewRadians;

        this.theta = degToRad(0);
        this.phi = degToRad(90);
        camera.computeMatrix(); //Camera Compute Matrix
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
    }


 //TODO. Add setter and getter for camera data (and autocompute matrix on this changes -  add this.matrixAutoUpdate = true)

}