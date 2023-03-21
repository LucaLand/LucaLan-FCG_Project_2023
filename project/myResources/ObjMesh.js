"use strict";

//TODO. Do a global j file with global variable, enum and constants
const directions = {
    Forward: "f",
    Backward: "b",
    Right: "r",
    Left: "l"
}

let ObjMesh = function (id, name, mesh, meshData){
    console.log(meshData);

    this.id = id;
    this.name = name;
    this.mesh = mesh;
    this.meshData = meshData;

    this.positions = meshData.positions;
    this.normals = meshData.normals;
    this.texcoords = meshData.texcoords;
    this.numVertices = meshData.numVertices;
    this.textureImage = meshData.textureImage;

    this.ambient = meshData.ambient;   //Ka
    this.diffuse = meshData.diffuse;   //Kd
    this.specular = meshData.specular;  //Ks
    this.emissive = meshData.emissive;  //Ke
    this.shininess = meshData.shininess; //Ns
    this.opacity = meshData.opacity;   //Ni
    this.meshMatrix = m4.identity(); //Obj world matrix

    //Controls if an object emit shadows or not
    this.shadow = true;

    let objPosition = {x:0, y:0, z:0};
    let objRotation = {x:0, y:0, z:0};
    let objScale = {x:1, y:1, z:1};


    this.getObjUniforms = function () {
        this.computeMatrix();
        let objUniforms = {
            u_world: this.meshMatrix, //The one to chnage for the obj attributes
            diffuse: this.diffuse,
            ambient: this.ambient,
            specular: this.specular,
            emissive: this.emissive,
            shininess: this.shininess,
            opacity: this.opacity,
        }
        return objUniforms;
    }

    this.getPosition = function (){
        return [objPosition.x, objPosition.y, objPosition.z];
    }

    this.setPosition = function (x, y, z){
        objPosition.x = x;
        objPosition.y = y;
        objPosition.z = z;
    }

    this.translate = function (dx, dy, dz){
        objPosition.x += dx;
        objPosition.y += dy;
        objPosition.z += dz;
    }

    this.rotate = function (dx, dy, dz){
        objRotation.x += degToRad(dx);
        objRotation.y += degToRad(dy);
        objRotation.z += degToRad(dz);
    }

    this.setRotation = function (x, y, z){
        objRotation.x = x;
        objRotation.y = y;
        objRotation.z = z;
    }

    this.getRotation = function () {
        return [objRotation.x, objRotation.y, objRotation.z];
    }

    this.setScale = function (x, y, z){
        objScale.x = x;
        objScale.y = y;
        objScale.z = z;
    }

    this.getScale = function (){
        return [objScale.x, objScale.y, objScale.z];
    }

    this.computeMatrix = function () {
        let matrix = m4.identity();
        matrix = m4.translate(matrix, objPosition.x, objPosition.y, objPosition.z);
        matrix = m4.xRotate(matrix, objRotation.x);
        matrix = m4.yRotate(matrix, objRotation.y);
        matrix = m4.zRotate(matrix, objRotation.z);
        matrix = m4.scale(matrix, objScale.x, objScale.y, objScale.z);
        this.meshMatrix = matrix;
        return matrix;
    }

    this.move = function (directionAxis, step){
        let dxf = step * Math.sin(objRotation.y);
        let dzf = step * Math.cos(objRotation.y);
        let dxr = step * Math.sin(objRotation.y + degToRad(90));
        let dzr = step * Math.cos(objRotation.y + degToRad(90));
        switch (directionAxis){
            case directions.Forward: this.translate(dxf, 0, dzf); break;
            case directions.Backward: this.translate(-dxf, 0, -dzf); break;
            case directions.Right: this.translate(-dxr, 0, -dzr); break;
            case directions.Left: this.translate(dxr, 0, dzr); break;
        }
    }

    this.setShadowRender = function (bool){
        this.shadow = bool;
    }



}

