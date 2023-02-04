let CameraManager = function (gl){


    this.viewMatrix = m4.identity;
    this.projectionMatrix = m4.identity;

    let cameraMatrix = m4.identity;
    let fieldOfViewRadians = degToRad(60);
    let rotationSpeed = .3;
    let cameraPosition = [2,2,0];
    let target = [0, 0, 0];
    let up = [0, 1, 0];



 this.computeMatrix = function (time){
     // Compute the projection matrix
     let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
     this.projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

     // camera going in circle from origin looking at origin
     cameraPosition = [Math.cos(time * rotationSpeed) * 2, 0, Math.sin(time * rotationSpeed) * 2];
     target = [0, 0, 0];
     up = [0, 1, 0];

     // Compute the camera's matrix using look at.
     cameraMatrix = m4.lookAt(cameraPosition, target, up);
     // Make a view matrix from the camera matrix.
     this.viewMatrix = m4.inverse(cameraMatrix);
 }


}