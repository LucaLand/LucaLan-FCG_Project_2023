"use strict";

let CameraManager = function (gl){
    this.viewMatrix = m4.identity;
    this.cameraMatrix = m4.identity;
    this.projectionMatrix = m4.identity;

    this.fieldOfViewRadians = degToRad(60);
    this.cameraPosition = [5,0,5];
    this.target = [0, 0, 0];
    this.up = [0, 1, 0];
    this.zmin = 0.1;
    this.zfar = 200;
    this.distance = 5;

    this.theta = degToRad(0);   //Angolo su x
    this.phi = degToRad(90);     //Angolo su z

    let DLimitMax = 10, DLimitMin = 1;


 this.computeMatrix = function (){
     // Compute the projection matrix
     let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
     this.projectionMatrix = m4.perspective(this.fieldOfViewRadians, aspect, this.zmin, this.zfar);

     // Compute the camera's matrix using look at.
     this.cameraMatrix = m4.lookAt(this.cameraPosition, this.target, this.up);

     // Make a view matrix from the camera matrix.
     this.viewMatrix = m4.inverse(this.cameraMatrix);
 }

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
        camera.computeCameraMatrixWithPolarCords();
        camera.computeMatrix(); //Camera Compute Matrix
    }

    this.rotateCamera = function (dTheta, dPhi){
        this.theta += dTheta;
        this.phi += dPhi;
        this.computeCameraMatrixWithPolarCords();
    }

    this.translateCameraDistance = function (deltaDistance) {
        let d = this.distance;
        if((d + deltaDistance) < DLimitMax && (d + deltaDistance) > DLimitMin)
            this.distance += deltaDistance;
        console.log("Camera Distance: " + this.distance)
        this.computeCameraMatrixWithPolarCords();
    }

    this.computeCameraMatrixWithPolarCords = function (){
        let D = this.distance;
         this.cameraPosition =[D * Math.sin(this.theta) * Math.sin(this.phi),
            D * Math.cos(this.phi),
            D * Math.cos(this.theta) * Math.sin(this.phi)];
        //To go upside down (don't make camera twist in the pole)
        this.up = [0, Math.sin(this.phi), 0];
        this.computeMatrix();
    }

    // this.setCameraPositionWithAngles = function (theta, phi){
    //      let D = this.distance;
    //      this.cameraPosition =[D*Math.sin(phi)*Math.cos(theta),
    //          D*Math.sin(phi)*Math.sin(theta),
    //          D*Math.cos(phi)];
    //      updateCameraAngles(theta, phi);
    //      this.computeMatrix();
    // }
    //
    // this.getCameraAngles = function (){
    //      return {
    //          theta: this.theta,
    //          phi: this.phi
    //      }
    // }
    //
    // function updateCameraAngles(t, p){
    //      this.theta = t;
    //      this.phi = p;
    // }

 //TODO. Add setter and getter for camera data (and autocompute matrix on this changes -  add this.matrixAutoUpdate = true)

}