"use strict";


const Light = function () {
    let ambientLight = [0.2, 0.2, 0.2];
    let colorLight = [1.0, 1.0, 1.0];
    let lightDirection = m4.normalize([-1, 3, 5]);
    let lightPosition = [0, 1000, 0];
    let perspective = false;
    let lightFov = degToRad(60);
    let lightProjectionMatrix;
    let lightWorldMatrix;

    this.innerLimit = 1.0;
    this.outerLimit = 100.0;

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
        lightWorldMatrix = m4.lookAt(
            this.getLightPosition(),          // position
            this.getLightDirection(), // target
            [0, 1, 0],                                              // up
        );
        return lightWorldMatrix;
    }

    this.computeLightProjectionMatrix = function (){
        lightProjectionMatrix = this.getPerspective()
            ? m4.perspective(
                degToRad(this.getLightFov()),
                this.projWidth / this.projHeight,
                0.5,  // near
                10)   // far
            : m4.orthographic(
                -this.projWidth / 2,   // left
                this.projWidth / 2,   // right
                -this.projHeight / 2,  // bottom
                this.projHeight / 2,  // top
                0.5,                      // near
                10);                      // far
        return lightProjectionMatrix;
    }
}