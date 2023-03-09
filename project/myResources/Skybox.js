"use strict";
let Skybox = function (gl, SkyBoxProgramInfo) {
    this.skyboxProgramInfo = SkyBoxProgramInfo;
    this.texture = null;

    this.loadSkybox = function(){
        const faceInfos = [
            {
                target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                url: 'assets/city-sky/bologna-divided-1-x1.jpg',
            },
            {
                target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                url: 'assets/city-sky/bologna-divided-1-x2.jpg',
            },
            {
                target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                url: 'assets/city-sky/bologna-divided-1-y2.jpg',
            },
            {
                target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
                url: 'assets/city-sky/bologna-divided-1-y1.jpg',
            },
            {
                target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                url: 'assets/city-sky/bologna-divided-1-z1.jpg',
            },
            {
                target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                url: 'assets/city-sky/bologna-divided-1-z2.jpg',
            },
        ];

        // Create a texture.
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

        faceInfos.forEach((faceInfo) => {
            const {target, url} = faceInfo;

            // Upload the canvas to the cubemap face.
            const level = 0;
            const internalFormat = gl.RGBA;
            const width = 512;
            const height = 512;
            const format = gl.RGBA;
            const type = gl.UNSIGNED_BYTE;

            // setup each face so it's immediately renderable
            gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

            // Asynchronously load an image
            const image = new Image();
            image.src = url;
            image.addEventListener('load', function () {
                // Now that the image has loaded make copy it to the texture.
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.texImage2D(target, level, internalFormat, format, type, image);
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            });
        });
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

        this.texture = texture;
        return texture;
    }
    //Loading the Skybox textures when created
    this.loadSkybox();

    function createXYQuadVertices() {
        let xOffset = 0;
        let yOffset = 0;
        let size = 10;
        return {
            position: {
                numComponents: 2,
                data: [
                    xOffset + -1 * size, yOffset + -1 * size,
                    xOffset + 1 * size, yOffset + -1 * size,
                    xOffset + -1 * size, yOffset + 1 * size,
                    xOffset + 1 * size, yOffset + 1 * size,
                ],
            },
            normal: [
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
            ],
            texcoord: [
                0, 0,
                1, 0,
                0, 1,
                1, 1,
            ],
            indices: [0, 1, 2, 2, 1, 3],
        };
    }

    this.drawSkybox = function (camera){
        let viewMatrix = camera.viewMatrix, projectionMatrix = camera.projectionMatrix;
        if(this.texture == null)
            console.log("Skybox non initialized! (loadSkybox()!)")

        const arrays2 = createXYQuadVertices.apply(null, Array.prototype.slice.call(arguments, 1));
        const quadBufferInfo = webglUtils.createBufferInfoFromArrays(gl, arrays2);

        //Draw Skybox
        // let our quad pass the depth test at 1.0
        gl.depthFunc(gl.LEQUAL);

        // We only care about direction so remove the translation
        let viewDirectionMatrix = m4.copy(viewMatrix);
        viewDirectionMatrix[12] = 0;
        viewDirectionMatrix[13] = 0;
        viewDirectionMatrix[14] = 0;

        let viewDirectionProjectionMatrix = m4.multiply(projectionMatrix, viewDirectionMatrix);
        let viewDirectionProjectionInverseMatrix = m4.inverse(viewDirectionProjectionMatrix);

        gl.useProgram(this.skyboxProgramInfo.program);
        webglUtils.setBuffersAndAttributes(gl, this.skyboxProgramInfo, quadBufferInfo);
        webglUtils.setUniforms(this.skyboxProgramInfo, {
            u_viewDirectionProjectionInverse: viewDirectionProjectionInverseMatrix,
            u_skybox: this.texture,
        });
        webglUtils.drawBufferInfo(gl, quadBufferInfo);
    }
}