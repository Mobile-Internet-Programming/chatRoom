"use strict"

function DOMUtil (){
    this.dom = document;

    this.setValue = (id, value) => {
        if(!this.elementExists(id)) return;
        this.dom.getElementById(id).value = value;
    };
    this.getValue = (id) => {
        if(!this.elementExists(id)) return;
        return this.dom.getElementById(id).value;
    };
    this.elementExists = (id) => {
        return (this.dom.getElementById(id) == undefined ? false : true)
    };
    this.setFormValue = (obj) => {
       for(let key in obj){
           if(this.dom.getElementById(key)){
               this.dom.getElementById(key).value = obj[key];
           }
       } 
    };
    this.getFormValue = (obj) => {
        for(let key in obj){
            if(this.dom.getElementById(key)){
                obj[key] = this.dom.getElementById(key).value;
            }
        } 
        return obj;
    };
}