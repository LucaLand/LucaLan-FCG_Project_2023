"use strict";

let MeshData = function(){
    this.positions = [];
    this.normals = [];
    this.texcoords = [];
    this.numVertices = 0;
    this.ambient = [0,0,0];
    this.diffuse = [0,0,0];
    this.specular = [0,0,0];
    this.emissive = [0,0,0];
    this.shininess = [0,0,0];
    this.opacity = 0.0;
    this.textureImage = null;
}

let ObjManager = function (){
    let idMesh = 0; //Incremental id of the MeshObjects
    let objList = []; //TODO. make this a map with key the name of the objects, to get them. Use this to print all

    this.loadObj= function(name, sourcePath) {
        let meshData = new MeshData();

        let mesh = {};
        mesh.sourceMesh = sourcePath;

        retrieveDataFromSource(mesh);
        Unitize(mesh.data);

        //Ora che ho la mesh e il/i materiali associati, mi occupo di caricare
        //la/le texture che tali materiali contengono
        let map = mesh.materials[1].parameter;
        let textureImage;
        if(map.get("map_Kd") !== undefined) {
            meshData.textureRootPath = mesh.sourceMesh.substring(0, mesh.sourceMesh.lastIndexOf("/") + 1);
            textureImage = loadTextureImage(meshData.textureRootPath + map.get("map_Kd"));
        }else {
            textureImage = null;
        }

        let x=[], y=[], z=[];
        let xt=[], yt=[];
        let i0,i1,i2;
        let nvert=mesh.data.nvert;
        let nface=mesh.data.nface;
        let ntexcoord=mesh.data.textCoords.length;

        for (let i=0; i<nvert; i++){
            x[i]=mesh.data.vert[i+1].x;
            y[i]=mesh.data.vert[i+1].y;
            z[i]=mesh.data.vert[i+1].z;
        }
        for (let i=0; i<ntexcoord-1; i++){
            xt[i]=mesh.data.textCoords[i+1].u;
            yt[i]=mesh.data.textCoords[i+1].v;
        }
        for (let i=1; i<=nface; i++){
            i0=mesh.data.face[i].vert[0]-1;
            i1=mesh.data.face[i].vert[1]-1;
            i2=mesh.data.face[i].vert[2]-1;
            meshData.positions.push(x[i0],y[i0],z[i0],x[i1],y[i1],z[i1],x[i2],y[i2],z[i2]);
            i0=mesh.data.facetnorms[i].i;
            i1=mesh.data.facetnorms[i].j;
            i2=mesh.data.facetnorms[i].k;
            meshData.normals.push(i0,i1,i2,i0,i1,i2,i0,i1,i2);
            i0=mesh.data.face[i].textCoordsIndex[0]-1;
            i1=mesh.data.face[i].textCoordsIndex[1]-1;
            i2=mesh.data.face[i].textCoordsIndex[2]-1;
            meshData.texcoords.push(xt[i0],yt[i0],xt[i1],yt[i1],xt[i2],yt[i2]);
        }
        meshData.numVertices=3*nface;

        if (mesh.fileMTL == null){
            meshData.ambient=mesh.materials[0].parameter.get("Ka");
            meshData.diffuse=mesh.materials[0].parameter.get("Kd");
            meshData.specular=mesh.materials[0].parameter.get("Ks");
            meshData.emissive=mesh.materials[0].parameter.get("Ke");
            meshData.shininess=mesh.materials[0].parameter.get("Ns");
            meshData.opacity=mesh.materials[0].parameter.get("Ni");
        }
        else{
            meshData.ambient=mesh.materials[1].parameter.get("Ka");
            meshData.diffuse=mesh.materials[1].parameter.get("Kd");
            meshData.specular=mesh.materials[1].parameter.get("Ks");
            meshData.emissive=mesh.materials[1].parameter.get("Ke");
            meshData.shininess=mesh.materials[1].parameter.get("Ns");
            meshData.opacity=mesh.materials[1].parameter.get("Ni");
        }

        meshData.textureImage = textureImage;

        //Log
        console.log("Loaded Obj - id:" + idMesh + " || Name: " + name)
        console.log("ObjManager")
        console.log(mesh)
        let newObj = new ObjMesh(idMesh++, name, mesh, meshData);
        objList.push(newObj);

        return newObj;
    }

    function loadTextureImage(textureImagePath){
        const image = new Image();
        image.src = textureImagePath;
        return image;
    }

    this.duplicateObj = function (objMesh){
        if(objList.includes(objMesh)){
            let duplicateObj = new ObjMesh(idMesh++, objMesh.name, objMesh.mesh, objMesh.meshData);
            objList.push(duplicateObj);
        }
        return null;
    }
}