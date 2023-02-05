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

    this.prepareObjDraw = function(gl, camera, program){
        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);

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
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positions), gl.STATIC_DRAW);

        // Create a buffer for normals
        let normalsBuffer = gl.createBuffer();
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER mormalsBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
        // Put the normals in the buffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);

        // provide texture coordinates
        let texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
        // Set Texcoords
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texcoords), gl.STATIC_DRAW);


        let ambientLight=[0.2,0.2,0.2];
        let colorLight=[1.0,1.0,1.0];

        gl.uniform3fv(gl.getUniformLocation(program, "diffuse"), this.diffuse);
        gl.uniform3fv(gl.getUniformLocation(program, "ambient" ), this.ambient);
        gl.uniform3fv(gl.getUniformLocation(program, "specular"), this.specular);
        gl.uniform3fv(gl.getUniformLocation(program, "emissive"), this.emissive);
        //gl.uniform3fv(gl.getUniformLocation(program, "u_lightDirection" ), xxx );
        gl.uniform3fv(gl.getUniformLocation(program, "u_ambientLight" ), ambientLight);
        gl.uniform3fv(gl.getUniformLocation(program, "u_colorLight" ), colorLight);

        gl.uniform1f(gl.getUniformLocation(program, "shininess"), this.shininess);
        gl.uniform1f(gl.getUniformLocation(program, "opacity"), this.opacity);

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


        let matrixLocation = gl.getUniformLocation(program, "u_world");
        let textureLocation = gl.getUniformLocation(program, "diffuseMap");
        let viewMatrixLocation = gl.getUniformLocation(program, "u_view");
        let projectionMatrixLocation = gl.getUniformLocation(program, "u_projection");
        let lightWorldDirectionLocation = gl.getUniformLocation(program, "u_lightDirection");
        let viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition");

        gl.uniformMatrix4fv(viewMatrixLocation, false, camera.viewMatrix);
        gl.uniformMatrix4fv(projectionMatrixLocation, false, camera.projectionMatrix);

        // set the light position
        gl.uniform3fv(lightWorldDirectionLocation, m4.normalize([-1, 3, 5]));

        // set the camera/view position
        gl.uniform3fv(viewWorldPositionLocation, camera.cameraPosition);

        // Tell the shader to use texture unit 0 for diffuseMap
        gl.uniform1i(textureLocation, 0);

        let matrix = m4.identity();
        matrix = m4.xRotate(matrix, degToRad(0));
        matrix = m4.yRotate(matrix, degToRad(0));

        // Set the matrix.
        gl.uniformMatrix4fv(matrixLocation, false, matrix);
    }
}