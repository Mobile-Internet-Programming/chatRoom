"use strict";
class ViewModel {
    
    domUtils;
    messageLog = [];
    sendObj = {
        user: "",
        msg: ""
    }

    constructor() {
        this.messageLog = [];
        this.domUtils = new DOMUtil();      
        this.getMessageLog();
    }

    render () {
        document.getElementById("messages").innerHTML = "";
        for(let idx = 0; idx < this.messageLog.length; idx++){
            document.getElementById("messages").append(this.createMessage(this.messageLog[idx].id, this.messageLog[idx].user, this.messageLog[idx].msg))
        }
    };
    bindSend (btnSelector) {
        document.querySelector(btnSelector).onclick = () => {
            this.sendMessage();
        };
    };
    bindRefresh (btnSelector) {
        document.querySelector(btnSelector).onclick = () => {
            this.getMessageLog();        
        }; 
    }
    checkValidInput (obj) {
        let valid = true;
        for(let key in obj){
            if(!obj[key]){
                document.getElementById(key).classList.add("is-invalid");
                valid = false;
            }else {
                document.getElementById(key).classList.remove("is-invalid");
            }
        }
        return valid;
    }
    sendMessage () {
        
        this.domUtils.getFormValue(this.sendObj);
        
        if(!this.checkValidInput(this.sendObj)) return;
        this.domUtils.setValue("msg", "");
        
        if(!this.checkValidInput()) return;
        this.sendRequest(
            "GET", 
            "http://localhost:8080",
            this.sendObj,
            {},
            (messages) => {this.messageLog = messages; this.render()}
        );
    };
    getMessageLog () {
        this.sendRequest(
            "GET", 
            "http://localhost:8080" + "/getMessageLog",
            {},
            {},
            (messages) => {this.messageLog = messages; this.render()}
        );
    }
    createMessage (id, user, msg) {
        let message = document.createElement("div");
        message.classList.add("message");
        message.setAttribute("id", id);

        message.innerHTML = `
            <div class="message-header">
                ${user}
                <button class="message-delete">X</button>
            </div>
            <div class="message-body">${msg}</div>
        `
        message.querySelector("button").onclick = () => {
            this.deleteMessage(id);
        }
        return message;
    };
    deleteMessage (id) {
        this.sendRequest(
            "GET", 
            "http://localhost:8080" + "/deleteMessage",
            {id: id},
            {},
            (messages) => {this.messageLog = messages; this.render()}
        );
    }
    sendRequest (method, urlP, searchParams, body, callback) {
        
        let lookUpTable = ["GET", "PUT", "POST", "DELETE"];

        if(!lookUpTable.includes(method)){
            alert("The method: " + method + " is not valid!");
            return;
        }
        
        let request = new XMLHttpRequest();
        request.responseType = "json";

        let url = new URL(urlP);

        for (let key in searchParams) {
            url.searchParams.set(key, searchParams[key]);
        }

        request.open(method, url);

        if(method === "POST" || method === "PUT"){
            request.setRequestHeader("Content-Type", "application/json");
        }

        request.onload = function () {
            if(request.status === 200){
                callback(request.response); 
            }else{
                alert(`Error ${request.status}: ${request.statusText}`);
            }
        }
        if(body != String)
            body = JSON.stringify(body);

        if(method === "GET" || method === "DELETE"){
            request.send();
        }else{
            request.send(body);
        }
    }
}

let viewModel = new ViewModel();

viewModel.bindSend("#send");
viewModel.bindRefresh("#refresh");

viewModel.render();

setInterval(() => {
    viewModel.getMessageLog();
}, 2000)