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
        camera.computeMatrix(); //Camera Compute Matrix
    }

 //TODO. Add setter and getter for camera data (and autocompute matrix on this changes -  add this.matrixAutoUpdate = true)

}