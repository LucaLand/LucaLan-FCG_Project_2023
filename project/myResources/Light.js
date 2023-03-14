"use strict";


const Light = function () {
    let ambientLight = [0.2, 0.2, 0.2];
    let colorLight = [1.0, 1.0, 1.0];
    let lightDirection = m4.normalize([-1, 3, 5]);
    let lightPosition = [0, 1000, 0];
    let perspective = false;
    let lightFov = degToRad(60);

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
}