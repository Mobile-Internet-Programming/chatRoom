let http = require('http');
const url = require('url');
const Message = require("./modules/Message");
const ChatObject = require("./modules/ChatObject");
const fs = require('fs');

const PORT = 8080;


http.createServer((req, res) => {
    
    if ((req.url.split("?")[0]) === "/deleteMessage") {
        fs.readFile("../../_Data/chatRoom/messageLog.json", (err, data) => {
            if(err) throw err;
            
            res.writeHead(200, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
            let chatObj;
            let q = url.parse(req.url, true);

            chatObj = JSON.parse(data);

            for(let i = 0; i < chatObj.messages.length; i++){
                if(Number(chatObj.messages[i].id) === Number(q.query.id)){
                    chatObj.messages.splice(i, 1);
                }
            }
            fs.writeFile("../../_Data/chatRoom/messageLog.json", JSON.stringify(chatObj), (err) => {
                if(err) throw err;
            })
            res.write(JSON.stringify(chatObj.messages));
            res.end();
        }) 
    } else if(req.url === "/getMessageLog") {
        fs.readFile("../../_Data/chatRoom/messageLog.json", (err, data) => {
            res.writeHead(200, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
            let chatObj;

            if(err) {
                chatObj = new ChatObject();
                fs.writeFile("../../_Data/chatRoom/messageLog.json", JSON.stringify(chatObj), (err) => {
                    if(err) throw err;
                })
            }else {
                chatObj = JSON.parse(data);

            }
            res.write(JSON.stringify(chatObj.messages));
            res.end();
        })
    }else {
        fs.readFile("../../_Data/chatRoom/messageLog.json", (err, data) => {
            res.writeHead(200, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
            let q = url.parse(req.url, true);
            let chatObj;

            if(err) {
                chatObj = new ChatObject();
            }else {
                chatObj = JSON.parse(data);

            }
            chatObj.messages.push(new Message(chatObj.id++, q.query.user, q.query.msg));

            fs.writeFile("../../_Data/chatRoom/messageLog.json", JSON.stringify(chatObj), (err) => {
                if(err) throw err;
            })
            res.write(JSON.stringify(chatObj.messages));
            res.end();
        })
    }
    //res.write(JSON.stringify(new Message(0, q.query.user, q.query.msg)));
}).listen(PORT, () => {
    console.log("Server started at port: " + PORT + " | http://localhost:" + PORT);
});

