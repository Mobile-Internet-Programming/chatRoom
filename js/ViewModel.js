"use strict";
class ViewModel {
    
    domUtils;
    messageLog = [];
    sendObj = {
        user: "",
        msg: ""
    }
    intervalID;

    constructor() {
        this.messageLog = [];
        this.domUtils = new DOMUtil();      
        this.getMessageLog();
        this.refresh();
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
    };
    bindOpenSettingsModal (btnSelector) {
        document.querySelector(btnSelector).onclick = () => {
            this.settingModal();
        }
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
            "http://localhost:8080" + "/createMessage",
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
            (messages) => {
                let lastLog = this.messageLog.length;
                this.messageLog = messages;

                if(lastLog != this.messageLog.length){
                    this.render();
                }
                this.setServerState("connected", {color: "green"})
            },
            (e) => {this.setServerState("offline", {color: "red"})}
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
            (messages) => {
                this.messageLog = messages; 
                this.render();
            }
        );
    }
    sendRequest (method, urlP, searchParams, body, callback, errorFunc) {
        
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
        request.onerror = function (e) {
            if(typeof errorFunc === "function"){
                errorFunc();
            }
        };
        if(body != String)
            body = JSON.stringify(body);

        if(method === "GET" || method === "DELETE"){
            request.send();
        }else{
            request.send(body);
        }
    };
    refresh () {

        if(!Settings.refresh){
            clearInterval(this.intervalID);
            return;
        }
        this.intervalID = setInterval( () => {
                this.getMessageLog();
        }, Number(Settings.refreshTime));
    };
    setServerState (state, style) {
        let stateObj = document.getElementById("state");
        if(stateObj.innerHTML != state) {
            stateObj.innerHTML = state;
            for(let key in style) {
                stateObj.style[key] = style[key];
            }
        }
    }
    settingModal () {
        let modal = document.getElementById("settingsModalBody");
        modal.innerHTML = "";

        modal.innerHTML = `
        <div class="mb-3 row">
            <label for="modalDate" class="col-sm-4 col-form-label">RefreshRate:</label>
            <div class="col-sm-5">
                <input type="number" id="modalRefreshRate" class="form-control input-dark" value=${Settings.refreshTime} min=1000>
            </div>
        </div>
        <div class="mb-3 row">
            <label for="modalDate" class="col-sm-4 col-form-check-label">Refresh</label>
            <div class="col-sm-7">
                <input type="checkbox" id="modalRefresh" class="form-check-input">
            </div>
        </div>
        `;

        modal.querySelector("#modalRefresh").checked = Settings.refresh;

        document.querySelector("#settingsModalBtnSave").onclick = () => {
            Settings.refreshTime = Number(modal.querySelector("#modalRefreshRate").value);
            if(Settings.refreshTime < 1000) {
                Settings.refreshTime = 1000;
            }
            Settings.refresh = modal.querySelector("#modalRefresh").checked;
            clearInterval(this.intervalID);
            this.refresh();
        }
    }
}

let viewModel = new ViewModel();

viewModel.bindSend("#send");
viewModel.bindRefresh("#refresh");
viewModel.bindOpenSettingsModal("#openSettingsModal");

viewModel.render();