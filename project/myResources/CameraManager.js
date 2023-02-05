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

 //TODO. Add setter and getter for camera data (and autocompute matrix on this changes -  add this.matrixAutoUpdate = true)

}