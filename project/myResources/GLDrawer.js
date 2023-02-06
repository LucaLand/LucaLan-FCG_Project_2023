"use strict";

const programs ={
    SkyBoxProgramInfo: null,
    ObjsProgramInfo: null,
}

let GLDrawer = function (canvasId){
    let canvas = document.getElementById(canvasId);
    this.gl = canvas.getContext("webgl");
    if (!this.gl) {
        console.log("!!!NO GL for canvas:"+canvasId);
    }

    // setup GLSL programs and lookup locations
    programs.SkyBoxProgramInfo = webglUtils.createProgramInfo(this.gl, ["skybox-vertex-shader", "skybox-fragment-shader"]);
    programs.ObjsProgramInfo =  webglUtils.createProgramInfo(this.gl, ["3d-vertex-shader", "3d-fragment-shader"]);

    this.camera = new CameraManager(this.gl);
    this.ambientLight = [0.2,0.2,0.2];
    this.colorLight = [1.0,1.0,1.0];

    this.getGL = function (){
        return this.gl;
    }

    this.getCamera = function (){
        return this.camera;
    }

    let objProgramUniforms = {
        u_ambientLight: this.ambientLight,
        u_colorLight: this.colorLight,
        u_lightDirection: m4.normalize([-1, 3, 5]),
        u_view: this.camera.viewMatrix,
        u_projection: this.camera.projectionMatrix,
        u_viewWorldPosition: this.camera.cameraPosition
    }

    this.updateObjProgramUniforms = function (){
        objProgramUniforms = {
            u_ambientLight: this.ambientLight,
            u_colorLight: this.colorLight,
            u_lightDirection: m4.normalize([-1, 3, 5]),
            u_view: this.camera.viewMatrix,
            u_projection: this.camera.projectionMatrix,
            u_viewWorldPosition: this.camera.cameraPosition
        }
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

        //Setting program and Uniforms
        gl.useProgram(programs.ObjsProgramInfo.program);
        objWriteBuffers(gl, objMesh.positions, objMesh.normals, objMesh.texcoords);
        this.updateObjProgramUniforms();
        webglUtils.setUniforms(programInfo, objProgramUniforms); //TODO. do this uniform set in a init funct of the gl (update this only in case of background changes or camera changes)
        gl.uniform1i(gl.getUniformLocation(programInfo.program, "diffuseMap"), 0);  // Tell the shader to use texture unit 0 for diffuseMap
        webglUtils.setUniforms(programInfo, objMesh.getObjUnifrom());

        //DRAW the obj
        gl.drawArrays(this.getGL().TRIANGLES, 0, objMesh.numVertices);
    }




    this.preRender = function (){
        let gl = this.getGL();
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        //Optimizing performance with Cull face (try to remove and see what happens)
        gl.enable(this.gl.CULL_FACE);
        gl.enable(this.gl.DEPTH_TEST);

        // Clear the canvas AND the depth buffer.
        gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }


}