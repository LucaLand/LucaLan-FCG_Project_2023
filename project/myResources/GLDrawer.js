"use strict";

// const programs ={
//     SkyBoxProgramInfo: null,
//     ObjsProgramInfo: null,
// }

const GLDrawer = function (canvasId){
    let canvas = document.getElementById(canvasId);
    this.gl = canvas.getContext("webgl");
    if (!this.gl) {
        console.log("!!!NO GL for canvas:"+canvasId);
    }

    let programs = {
        SkyBoxProgramInfo: webglUtils.createProgramInfo(this.gl, ["skybox-vertex-shader", "skybox-fragment-shader"]),
        ObjsProgramInfo: webglUtils.createProgramInfo(this.gl, ["3d-vertex-shader", "3d-fragment-shader"]),
    }

    this.camera = new CameraManager(this.gl);

    this.ambientLight = [0.2,0.2,0.2];
    this.colorLight = [1.0,1.0,1.0];
    this.lightDirection = m4.normalize([-1, 3, 5]);

    this.skybox = new Skybox(this.gl, programs.SkyBoxProgramInfo);
    this.skybox.loadSkybox();
    let cullFace = true;

    this.getGL = function (){
        return this.gl;
    }

    this.getCamera = function (){
        return this.camera;
    }

    this.getCanvas = function (){
        return canvas;
    }

    this.enableCullFace = function (bool){
        cullFace = bool;
    }

    let objProgramUniforms = {
        u_ambientLight: this.ambientLight,
        u_colorLight: this.colorLight,
        u_lightDirection: this.lightDirection,
        u_view: this.camera.viewMatrix,
        u_projection: this.camera.projectionMatrix,
        u_viewWorldPosition: this.camera.cameraPosition
    }

    this.updateObjProgramUniforms = function (){
        objProgramUniforms = {
            u_ambientLight: this.ambientLight,
            u_colorLight: this.colorLight,
            u_lightDirection: this.lightDirection,
            u_view: this.camera.viewMatrix,
            u_projection: this.camera.projectionMatrix,
            u_viewWorldPosition: this.camera.cameraPosition
        }

        // console.log("GLDrawer: Updating Unifroms");
        //console.log("Program uniform:");
        //console.log(objProgramUniforms);
        // console.log(this.camera);
    }

    function objWriteBuffers(gl, positions, normals, texcoords){
        let program = programs.ObjsProgramInfo.program;

        // look up where the vertex data needs to go.
        let positionLocation = gl.getAttribLocation(program, "a_position");
        let normalLocation = gl.getAttribLocation(program, "a_normal");
        let texcoordLocation = gl.getAttribLocation(program, "a_texcoord");

        // Create a buffer for positions
        let positionBuffer = gl.createBuffer();
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // Put the positions in the buffer
        //setGeometry(gl);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        // Create a buffer for normals
        let normalsBuffer = gl.createBuffer();
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER mormalsBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
        // Put the normals in the buffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

        // provide texture coordinates
        let texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        // Set Texcoords
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

        // Turn on the position attribute
        gl.enableVertexAttribArray(positionLocation);
        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        let size = 3;          // 3 components per iteration
        let type = gl.FLOAT;   // the data is 32bit floats
        let normalize = false; // don't normalize the data
        let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        let offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

        // Turn on the normal attribute
        gl.enableVertexAttribArray(normalLocation);
        // Bind the normal buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
        gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);

        // Turn on the teccord attribute
        gl.enableVertexAttribArray(texcoordLocation);
        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        size = 2;          // 2 components per iteration
        gl.vertexAttribPointer(texcoordLocation, size, type, normalize, stride, offset);
    }

    this.objDraw = function (objMesh){
        let gl = this.getGL();
        let programInfo = programs.ObjsProgramInfo;

        if(objMesh.textureImage !== null)
            this.loadObjTextureIntoBuffer(objMesh.textureImage);
        else
            this.loadDefaultTexture();
        // console.log("Texture: ")
        // console.log(objMesh.textureImage);

        //Setting program and Uniforms
        gl.useProgram(programs.ObjsProgramInfo.program);
        objWriteBuffers(gl, objMesh.positions, objMesh.normals, objMesh.texcoords);
        this.updateObjProgramUniforms();
        webglUtils.setUniforms(programInfo, objProgramUniforms); //TODO. do this uniform set in a init funct of the gl (update this only in case of background changes or camera changes)
        gl.uniform1i(gl.getUniformLocation(programInfo.program, "diffuseMap"), 0);  // Tell the shader to use texture unit 0 for diffuseMap
        webglUtils.setUniforms(programInfo, objMesh.getObjUniforms());

        //DRAW the obj
        gl.drawArrays(this.getGL().TRIANGLES, 0, objMesh.numVertices);
    }


    this.preRender = function (){
        let gl = this.getGL();
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        //Optimizing performance with Cull face (try to remove and see what happens)
        if(cullFace)
            gl.enable(this.gl.CULL_FACE);

        //gl.cullFace(this.gl.FRONT_AND_BACK);
        gl.enable(this.gl.DEPTH_TEST);

        // Clear the canvas AND the depth buffer.
        gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    this.loadObjTextureIntoBuffer = function (textureImage){
        let gl = this.getGL();

        const texture = gl.createTexture();
        const level = 0;
        const internalFormat = gl.RGBA;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,srcFormat, srcType, textureImage);
        if (isPowerOf2(textureImage.width) && isPowerOf2(textureImage.height))
            gl.generateMipmap(gl.TEXTURE_2D); // Yes, it's a power of 2. Generate mips.
        else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
    }

    this.loadDefaultTexture = function (){
        let gl = this.getGL();

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([255, 255, 255, 255]);  // opaque blue
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);
    }

    this.multipleObjDraw = function (objMeshList){
        objMeshList.forEach(objmesh => {
            this.objDraw(objmesh);
        })
    }

    this.drawSkybox = function (){
        this.skybox.drawSkybox(this.getCamera());
    }


}