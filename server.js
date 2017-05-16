require('dotenv').config();


var Buffer = require('buffer').Buffer;
var dgram = require('dgram');
var WebSocketServer = require('ws').Server;
 
var wss = new WebSocketServer({port: process.env.WEB_SOCKET_PORT});
 
//SDK IP and PORT (MOCK=> PacketSender IP and PORT)
var SERVER_FWD_IP =  process.env.SERVER_FWD_IP; 
var SERVER_FWD_PORT = process.env.SERVER_FWD_PORT; 

//THIS NODEJS UDP SERVER 
var SERVER_IP = process.env.SERVER_IP; 
var SERVER_PORT = process.env.SERVER_PORT; 

var udpServer = dgram.createSocket('udp4');
 
wss.on('connection', function(ws) {
    //Create a udp socket for this websocket connection
    var udpClient = dgram.createSocket('udp4');

    //When a message is received from udp server send it to the ws client
    udpServer.on('message', function(msg, rinfo) {
        console.log("UDP TO WS -> " + msg.toString());
       ws.send(msg.toString(),function(error){
         if(error != null) 
            {
                console.log('UDP_TO_WS: SOCKET ERROR %s', error);
                //ws.close();
         }
    });
    });
 
    //When a message is received from ws client send it to udp server.
    ws.on('message', function(message) {
        var msgBuff = new Buffer(message);
        console.log("WS TO UDP -> " + msgBuff);
        udpClient.send(msgBuff, 0, msgBuff.length, SERVER_FWD_PORT, SERVER_FWD_IP);
    });
});

udpServer.bind(SERVER_PORT, SERVER_IP);
console.log("UDP server listening on " + SERVER_IP + ":" + SERVER_PORT);