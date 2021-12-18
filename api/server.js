let http = require('http');
const url = require('url');
const Message = require("./modules/Message");
const ChatObject = require("./modules/ChatObject");
const fs = require('fs');

const PORT = 8080;

function Result(req, res, file, chat) {
    this.req = req;
    this.res = res;
    this.file = file;
    this.chatObj = chat;
}

const FILENAME = "../../_Data/chatRoom/messageLog.json";

http.createServer((req, res) => {
    
    if ((req.url.split("?")[0]) === "/deleteMessage") {
        readFile(req, res, FILENAME)
        .then(deleteMessage)
        .then(writeMessage)
        .then(sendData)
        .then(res => res.end())
        .catch(err => console.log(err));
    } else if(req.url === "/getMessageLog") {
        readFile(req, res, FILENAME)
        .then(sendData)
        .then(res => res.end())
        .catch(err => console.log(err));
    }else if (req.url.split("?")[0] === "/createMessage"){
        readFile(req, res, FILENAME)
        .then(addMessage)
        .then(writeMessage)
        .then(sendData)
        .then(res => res.end())
        .catch(err => console.log(err));
        
    }
}).listen(PORT, () => {
    console.log("Server started at port: " + PORT + " | http://localhost:" + PORT);
});


function readFile(req, res, file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if(err) {
                reject(err);
            }
            if(!data.length)
                resolve(new Result(req, res, file, new ChatObject()))
            else
                resolve(new Result(req, res, file, JSON.parse(data)));
        })
    })
}
function writeMessage(result) {
    return new Promise((resolve, reject) => {
        fs.writeFile(result.file, JSON.stringify(result.chatObj), (err, data) => {
            err ? reject(err) : resolve(new Result(result.req, result.res, result.file, result.chatObj));
        })
    })
}
function addMessage(result) {
    return new Promise((resolve, reject) => {
        let q = url.parse(result.req.url, true);
        result.chatObj.messages.push(new Message(result.chatObj.id++, q.query.user, q.query.msg));
        resolve(new Result(result.req, result.res, result.file, result.chatObj));
    })
}
function sendData(result) {
    return new Promise((resolve, reject) => {
        result.res.writeHead(200, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
        result.res.write(JSON.stringify(result.chatObj.messages));
        resolve(result.res);
    })
}
function deleteMessage (result) {
    return new Promise((resolve, reject) => {
        let q = url.parse(result.req.url, true);
        for(let i = 0; i < result.chatObj.messages.length; i++){
            if(Number(result.chatObj.messages[i].id) === Number(q.query.id)){
                result.chatObj.messages.splice(i, 1);
            }
        }
        resolve(new Result(result.req, result.res, result.file, result.chatObj));
    })
} 