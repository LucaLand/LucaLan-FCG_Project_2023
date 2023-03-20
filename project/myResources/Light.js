"use strict";


const Light = function () {
    let ambientLight = [0.2, 0.2, 0.2];
    let colorLight = [1.0, 1.0, 1.0];
    let colorLightVec4 = [1.0, 1.0, 1.0, 1.0];
    let lightPosition = [0, 10, 0];
    let lightTarget = [10, 0, 0];
    // Direction -> //m4.normalize([-1, 3, 5]);
    let lightFov = degToRad(100);

    let perspective = true;
    this.innerLimit = Math.cos(degToRad(lightFov / 2 - 10));
    this.outerLimit = Math.cos(degToRad(lightFov / 2));
    this.near = 0.4;
    this.far = 80;

    this.projWidth = 100;
    this.projHeight = 100;

    this.setLightTarget = function (x, y, z){
        lightTarget = [x,y,z];      //m4.normalize([x, y, z]); Direction
    }

    this.getLightTarget = function (){
        return lightTarget;
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
        return m4.lookAt(
            lightPosition,          // position
            lightTarget,         // target
            [0, 0, 1],              // up
        );
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