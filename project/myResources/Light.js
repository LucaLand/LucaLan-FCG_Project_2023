"use strict";


const Light = function () {
    let ambientLight = [0.2, 0.2, 0.2];
    let colorLight = [1.0, 1.0, 1.0];
    let colorLightVec4 = [1.0, 1.0, 1.0, 1.0];
    let lightPosition = [0, 30, 0];
    let lightDirection = [50, 0, 0]; //Target
    // Direction -> //m4.normalize([-1, 3, 5]);
    let lightFov = degToRad(160);

    let perspective = true;
    this.innerLimit = Math.cos(degToRad(lightFov / 2 - 10));
    this.outerLimit = Math.cos(degToRad(lightFov / 2));
    this.near = 0.4;
    this.far = 80;

    this.projWidth = 100;
    this.projHeight = 100;

    this.setLightDirection = function (x, y, z){
        lightDirection = m4.normalize([x, y, z]);
    }

    this.getLightDirection = function (){
        return lightDirection;
    }

    this.setAmbientLight = function (R = 0.2, G= 0.2, B = 0.2){
        ambientLight = [R, G, B];
    }

    this.getAmbientLight = function (){
        return ambientLight;
    }

    this.setDirectionalLightColor = function (R = 1.0, G=1.0, B=1.0){
        colorLight = [R, G, B];
    }

    this.getDirectionalLightColor = function (){
        return colorLight;
    }

    this.getLightColorVec4 = function (){
        return colorLightVec4;
    }

    this.getLightPosition = function (){
        return lightPosition;
    }

    this.getLightFov = function () {
        return lightFov;
    }

    this.setLightFov = function (newDegFov){
        lightFov = degToRad(newDegFov);
    }

    this.setPerspective = function (bool){
        perspective = bool;
    }

    this.getPerspective = function (){
        return perspective;
    }

    this.computeLightWorldMatrix = function (){
        // first draw from the POV of the light
        let lightWorldMatrix = m4.lookAt(
            lightPosition,          // position
            lightDirection,         // target
            [0, 1, 0]                       // up
        );
        return lightWorldMatrix;
    }

    this.computeLightProjectionMatrix = function (){
        let lightProjectionMatrix = perspective
            ? m4.perspective(
                lightFov,
                this.projWidth / this.projHeight,
                this.near,  // near
                this.far)   // far
            : m4.orthographic(
                -this.projWidth / 2,   // left
                this.projWidth / 2,   // right
                -this.projHeight / 2,  // bottom
                this.projHeight / 2,  // top
                this.near,                      // near
                this.far);                      // far
        return lightProjectionMatrix;
    }
}