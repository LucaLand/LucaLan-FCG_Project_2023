"use strict";

let ObjMesh = function (id, name, mesh, meshData){
    console.log(meshData);

    this.id = id;
    this.name = name+id;

    this.mesh = mesh;
    this.positions = meshData.positions;
    this.normals = meshData.normals;
     this.texcoords = meshData.texcoords;
     this.numVertices = meshData.numVertices;
     this.ambient = meshData.ambient;   //Ka
     this.diffuse = meshData.diffuse;   //Kd
     this.specular = meshData.specular;  //Ks
     this.emissive = meshData.emissive;  //Ke
     this.shininess = meshData.shininess; //Ns
     this.opacity = meshData.opacity;   //Ni

}