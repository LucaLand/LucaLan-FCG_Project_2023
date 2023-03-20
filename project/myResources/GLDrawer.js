"use strict";

// const programs ={
//     SkyBoxProgramInfo: null,
//     ObjsProgramInfo: null,
// }

const GLDrawer = function (canvasId){
    let canvas = document.getElementById(canvasId);
    //For canvas2 image download
    let glContextAttributes = { preserveDrawingBuffer: true };
    let gl = canvas.getContext("experimental-webgl", glContextAttributes);
    // let gl = canvas.getContext("webgl");
    if (!gl) {
        console.log("!!!NO GL for canvas:"+canvasId);
    }

    const ext = gl.getExtension('WEBGL_depth_texture');
    if (!ext) {
        return alert('need WEBGL_depth_texture');
    }

    let programs = {
        SkyBoxProgramInfo: webglUtils.createProgramInfo(gl, ["skybox-vertex-shader", "skybox-fragment-shader"]),
        ObjsProgramInfo: webglUtils.createProgramInfo(gl, ["3d-vertex-shader", "3d-fragment-shader"]),
        ColorProgramInfo: webglUtils.createProgramInfo(gl, ["color-vertex-shader", "color-fragment-shader"]),
        MyProgramInfo: webglUtils.createProgramInfo(gl, ["my-vertex-shader", "my-fragment-shader"])
    }

    let camera = new CameraManager(gl);
    let light = new Light();
    this.skybox = new Skybox(gl, programs.SkyBoxProgramInfo);
    let shadows = true;
    let cullFace = true;
    let frustum = true;

    const depthTextureObj = createDepthTexture(gl);
    let texture;
    let objRenderingProgramInfo = programs.MyProgramInfo;

    this.getGL = function (){
        return gl;
    }

    this.getCamera = function (){
        return camera;
    }

    this.setCamera = function (newCamera) {
        camera = newCamera;
    }

    this.getCanvas = function (){
        return canvas;
    }

    this.enableCullFace = function (bool){
        cullFace = bool;
    }

    this.setLight = function (newLight){
        light = newLight;
    }

    this.getLight = function (){
        return light;
    }

    //MAIN FUNC DRAW
    this.drawSceneWObjects = function (objMeshList){
        //Pre Render
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        if(shadows){
            // draw to the depth texture
            gl.bindFramebuffer(gl.FRAMEBUFFER, depthTextureObj.depthFrameBuffer);
            gl.viewport(0, 0, depthTextureObj.depthTextureSize, depthTextureObj.depthTextureSize);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            objMeshList.forEach(objmesh => {
                if(objmesh.shadow)
                    drawShadows(gl, objmesh);
            })
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.drawSkybox();
        objMeshList.forEach(objmesh => {
            this.objDraw(objmesh);
        })

        if(frustum)
            this.drawFrustum();
    }

    //UNIFORM UPDATE
    function updateObjProgramUniforms(projectionMatrix, viewMatrix, textureMatrix){
        // let objProgramUniforms = {
        //     u_view: viewMatrix,
        //     u_projection: projectionMatrix,
        //     u_ambientLight: light.getAmbientLight(),
        //     u_colorLight: light.getDirectionalLightColor(),
        //     u_lightDirection: light.getLightDirection(),
        //     u_viewWorldPosition: camera.cameraPosition
        // }
        return {
            //Vertex
            u_lightWorldPosition: light.getLightPosition(),
            u_viewWorldPosition: camera.cameraMatrix.slice(12, 15), //camera.cameraPosition,
            u_projection: projectionMatrix,
            u_view: viewMatrix,
            u_textureMatrix: textureMatrix,
            //Fragment
            u_colorLight: light.getLightColorVec4(),
            u_texture: texture,
            u_projectedTexture: depthTextureObj.depthTexture,
            u_lightDirection: light.computeLightWorldMatrix().slice(8, 11).map(v => -v),
            u_innerLimit: light.innerLimit,
            u_outerLimit: light.outerLimit,
            u_ambientLight: light.getAmbientLight(),
            u_bias: light.bias,
            //Color shader
            u_color: [1, 1, 1, 1],
            //Shader 2
            u_reverseLightDirection: light.computeLightWorldMatrix().slice(8, 11)
        };
        // console.log("GLDrawer: Updating Unifroms");
        //console.log("Program uniform:");
        //console.log(objProgramUniforms);
        // console.log(camera);
    }

    function objWriteBuffers(gl, programInfo, positions, normals, texcoords){
        let program = programInfo.program;

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
        if(programInfo === programs.ColorProgramInfo){
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
            return;
        }

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

    this.objDraw = function (objMesh, programInfo = objRenderingProgramInfo){
        if(objMesh.textureImage !== null)
            this.loadObjTextureIntoBuffer(objMesh.textureImage);
        else
            this.loadDefaultTexture();

        drawObj(gl, objMesh, programInfo);
    }

    function drawObj(gl, objMesh, programInfo){
        let projectionMatrix, viewMatrix, textureMatrix = m4.identity();
        switch (programInfo) {
            case programs.ColorProgramInfo:
                projectionMatrix = light.computeLightProjectionMatrix();
                viewMatrix = m4.inverse(light.computeLightWorldMatrix());
                break;
            case programs.MyProgramInfo:
                projectionMatrix = camera.projectionMatrix;
                viewMatrix = camera.viewMatrix;
                textureMatrix = calculateTextureMatrix();
                break;
            default:
                projectionMatrix = camera.projectionMatrix;
                viewMatrix = camera.viewMatrix;
                break;
        }
        //Setting program and Uniforms
        gl.useProgram(programInfo.program);
        webglUtils.setUniforms(programInfo, updateObjProgramUniforms(projectionMatrix, viewMatrix, textureMatrix)); //TODO. do this uniform set in a init funct of the gl (update this only in case of background changes or camera changes)
        if(texture !== null)
            gl.uniform1i(gl.getUniformLocation(programInfo.program, "u_texture"), 0);  // Tell the shader to use texture unit 0 for diffuseMap
        webglUtils.setUniforms(programInfo, objMesh.getObjUniforms());

        objWriteBuffers(gl, programInfo, objMesh.positions, objMesh.normals, objMesh.texcoords);

        //DRAW the obj
        gl.drawArrays(gl.TRIANGLES, 0, objMesh.numVertices);
    }

    function drawShadows(gl, objMesh) {
        drawObj(gl, objMesh, programs.ColorProgramInfo);
    }


    this.preRender = function (){
        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        //Optimizing performance with Cull face (try to remove and see what happens)
        if(cullFace)
            gl.enable(gl.CULL_FACE);

        //gl.cullFace(gl.FRONT_AND_BACK);
        gl.enable(gl.DEPTH_TEST);

        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    this.loadObjTextureIntoBuffer = function (textureImage){
        let gl = this.getGL();

        texture = gl.createTexture();
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

        texture = gl.createTexture();
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
        this.preRender();
        this.skybox.drawSkybox(camera);
    }

    function createDepthTexture(gl){
        const depthTexture = gl.createTexture();
        const depthTextureSize = 4096;      //Set dephtTexture size to 4096 to upgrade the shadows definition
        gl.bindTexture(gl.TEXTURE_2D, depthTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,      // target
            0,                  // mip level
            gl.DEPTH_COMPONENT, // internal format
            depthTextureSize,   // width
            depthTextureSize,   // height
            0,                  // border
            gl.DEPTH_COMPONENT, // format
            gl.UNSIGNED_INT,    // type
            null);              // data
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        const depthFramebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,       // target
            gl.DEPTH_ATTACHMENT,  // attachment point
            gl.TEXTURE_2D,        // texture target
            depthTexture,         // texture
            0);              // mip level

        // create a color texture of the same size as the depth texture
        const unusedTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, unusedTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            depthTextureSize,
            depthTextureSize,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // attach it to the framebuffer
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,        // target
            gl.COLOR_ATTACHMENT0,  // attachment point
            gl.TEXTURE_2D,         // texture target
            unusedTexture,         // texture
            0);                    // mip level

        return {
            depthTexture: depthTexture,
            depthFrameBuffer: depthFramebuffer,
            depthTextureSize: depthTextureSize
        }
    }

    function calculateTextureMatrix(){
        let textureMatrix = m4.identity();
        textureMatrix = m4.translate(textureMatrix, 0.5, 0.5, 0.5);
        textureMatrix = m4.scale(textureMatrix, 0.5, 0.5, 0.5);
        textureMatrix = m4.multiply(textureMatrix, light.computeLightProjectionMatrix());
        // use the inverse of this world matrix to make
        // a matrix that will transform other positions
        // to be relative this world space.
        textureMatrix = m4.multiply(
            textureMatrix,
            m4.inverse(light.computeLightWorldMatrix()));

        return textureMatrix;
    }

    this.drawFrustum = function (){
        const viewMatrix = m4.inverse(camera.cameraMatrix);
        const colorProgramInfo = programs.ColorProgramInfo
        const cubeLinesBufferInfo = webglUtils.createBufferInfoFromArrays(gl, {
            position: [
                -1, -1, -1,
                1, -1, -1,
                -1,  1, -1,
                1,  1, -1,
                -1, -1,  1,
                1, -1,  1,
                -1,  1,  1,
                1,  1,  1,
            ],
            indices: [
                0, 1,
                1, 3,
                3, 2,
                2, 0,

                4, 5,
                5, 7,
                7, 6,
                6, 4,

                0, 4,
                1, 5,
                3, 7,
                2, 6,
            ],
        });

        gl.useProgram(colorProgramInfo.program);

        // Setup all the needed attributes.
        webglUtils.setBuffersAndAttributes(gl, colorProgramInfo, cubeLinesBufferInfo);

        // scale the cube in Z so it's really long
        // to represent the texture is being projected to
        // infinity
        const mat = m4.multiply(
            light.computeLightWorldMatrix(), m4.inverse(light.computeLightProjectionMatrix()));

        // Set the uniforms we just computed
        webglUtils.setUniforms(colorProgramInfo, {
            u_color: [1, 1, 1, 1],
            u_view: viewMatrix,
            u_projection: camera.projectionMatrix,
            u_world: mat,
        });

        // calls gl.drawArrays or gl.drawElements
        webglUtils.drawBufferInfo(gl, cubeLinesBufferInfo, gl.LINES);
    }


}