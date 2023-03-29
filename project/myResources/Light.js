"use strict";


const Light = function () {
    let ambientLight = [0.2, 0.2, 0.2];
    let colorLight = [1.0, 1.0, 1.0];
    let colorLightVec4 = [1.0, 1.0, 1.0, 1.0];
    let lightPosition = [0, 50, 0];
    let lightTarget = [10, 0, 0];
    // Direction -> //m4.normalize([-1, 3, 5]);
    let lightFov = degToRad(80);

    let perspective = false;
    this.enabledShadows = true;
    this.innerLimit = 0.9999;
    this.outerLimit = 0.1;
    this.near = 0.4;
    this.far = 80;
    this.bias = -0.01;

    this.projWidth = 80;
    this.projHeight = 80;

    this.setLightTarget = function (x, y, z){
        let x2 = lightTarget[0], y2 = lightTarget[1], z2 = lightTarget[2];
        x2 = (x!==null) ? x : x2;
        y2 = (x!==null) ? y : y2;
        z2 = (x!==null) ? z : z2;
        lightTarget = [x2, y2, z2];
        //m4.normalize([x, y, z]); Direction
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

    this.setLightPosition = function (x = null, y = null, z = null){
        let x2 = lightPosition[0], y2=lightPosition[1], z2=lightPosition[2];
        x2 = (x!==null) ? x : x2;
        y2 = (x!==null) ? y : y2;
        z2 = (x!==null) ? z : z2;
        lightPosition = [x2, y2, z2];
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

    this.setSunLight = function (){
        perspective = false;
        this.bias = -0.007;
        this.setLightPosition(0, 100, 0);
        this.setLightTarget(0,0,0);
        this.near = 0.1;
        this.far = 150;
        this.projHeight = 150;
        this.projWidth = 150;
        colorLightVec4 = [1.0, 0.95, 0.85, 1.0];
        this.innerLimit = 0.9999;
        this.outerLimit = 0.1;
    }

    this.updateTime = function (time){
        if(!perspective) {
            this.setLightPosition(-(time * 2 - 25 * 2), 100, -50 + Math.abs(time - 25));
            this.setLightTarget(time * 4 - 25 * 4, 0, 0);
        }
    }


    this.setSpotLight = function (number = 1){
        perspective = true;
        this.bias = -0.0001;
        this.near = 0.4;
        this.far = 100;
        this.projHeight = 80;
        this.projWidth = 80;
        this.innerLimit = 0.999999999;
        this.outerLimit = 0.80;
        switch (number) {
            case "1": //Lampione alto sulla Torre Eiffel
                this.setLightPosition(-5, 20, 20);
                this.setLightTarget(60, 6, 10);
                this.setLightFov(120);
                colorLightVec4 = [1.0, 0.95, 0.90, 1.0];
                this.outerLimit = 0.91;
                break;
            case "2": //Lampione 2 basso
                this.setLightPosition(-5, 20, 20);
                this.setLightTarget(-5, 0, 20);
                this.setLightFov(130);
                colorLightVec4 = [0.8, 0.70, 0.6, 1.0];
                this.outerLimit = 0.5;
                break;
            case "3": //Lampione 3 basso
                this.setLightPosition(-5, 20, 20);
                this.setLightTarget(0, 0, 0);
                this.setLightFov(130);
                colorLightVec4 = [0.6, 0.5, 0.4, 1.0];
                this.outerLimit = 0.5;
                break;
        }


    }
}