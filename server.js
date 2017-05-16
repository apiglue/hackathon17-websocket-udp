require('dotenv').config();
require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss.l');
const util = require('util')

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
    
    //console.log("[MIDDLEWARE][SRC "+rinfo.address+"]");

    ws.send(msg.toString(),function(error){
        if(error != null) {
            //console.log('[MIDDLEWARE] UDP_TO_WS: SOCKET ERROR %s', error);
            //ws.close();
        } else {
            var wsPayload = JSON.parse(msg.toString());
            var type = wsPayload.name;
            var state = wsPayload.val;

            if(type=='moving' && state==true) {                
                console.log("[MIDDLEWARE] MOVEMENT STARTED => " + msg.toString());
            } else if(type=='moving' && state==false) {                
                console.log("[MIDDLEWARE] MOVEMENT STOPPED => " + msg.toString());
            } else if (type=='magnet' && state==true){
                console.log("[MIDDLEWARE] MAGNET DETECTED => " + msg.toString());
            } else if (type=='magnet' && state==false){
                console.log("[MIDDLEWARE] MAGNET GONE => " + msg.toString());
            }
         }
        });
    });
 
    //When a message is received from ws client send it to udp server.
    ws.on('message', function(message) {
        var msgBuff = new Buffer(message);

        if(msgBuff=='G') {
            console.log("[MIDDLEWARE] GO SIGNAL RECEIVED");
        } else if(msgBuff=='S') {
            console.log("[MIDDLEWARE] STOP SIGNAL RECEIVED");
        }

        udpClient.send(msgBuff, 0, msgBuff.length, SERVER_FWD_PORT, SERVER_FWD_IP);
    });
    ws.close;
});

udpServer.bind(SERVER_PORT, SERVER_IP);
console.log("UDP server listening on " + SERVER_IP + ":" + SERVER_PORT);