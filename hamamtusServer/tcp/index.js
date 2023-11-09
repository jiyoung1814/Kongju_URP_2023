const net = require('net');
const sleep = require('../sleep')

const tcp_ipaddr = "210.102.142.20";
const tcp_port = 9999;

const DeviceId = '01';

let receieve_packet = "";
let measuerment = {};

let tcp_state = false;

let server = net.createServer(function (socket) {
	console.log(socket.address().address + " connected.");
    tcp_state = true;

    // setInterval(checkConnection, 1000); // Check every 5 seconds

	// setting encoding
	socket.setEncoding('utf8');

    socket.on('data', function (data) {
        receieve_packet += data;
        console.log(data.length + "=> " + receieve_packet.length)
        // console.log(receieve_packet + " => " + receieve_packet.length);
        // console.log(data);console.log(data.length);console.log(receieve_packet.length);
        
        if(data == "03" && data.length ==2){
            if(receieve_packet.length == 1168){ //패킷 길이 확인
                console.log("정상 측정 완료")
                console.log(receieve_packet)
                measuerment = parsing(receieve_packet);
            }
        }
        
    });
    
    // print message for disconnection with client
    socket.on('close', function () {
        tcp_state = false;
        console.log('client disconnted.');
    });

    exports.writePacket = async(packet)=>{
        let hexBytePacket = convertHexByte(packet);
        console.log(hexBytePacket);
        socket.write(hexBytePacket);
    
        let cnt = 0;
        while(cnt<100){ //10s waiting

            await sleep(100) //0.1s
            cnt++;
    
            if(measuerment != undefined){
                if(measuerment.pixel != undefined){
                    if(Object.keys(measuerment.pixel).length == 288){
                        return measuerment;
                    }
                }
                
            }
        }
    
        return {};
    
    }

    // function checkConnection(){
    //     console.log(socket.writable)
    //     // if(socket.destroyed){
    //     //     console.log("client socket distroy")
    //     //     socket.destroy();
    //     // }
    // }

});



// print error message
server.on('error', function (err) {
    tcp_state = false;
    console.log("ssss")
	console.log('err: ', err.code);
});


// listening
server.listen(tcp_port, tcp_ipaddr, function () {
	console.log('TCP server listening on ' +tcp_port+ '...');
});




const convertHexByte =(packet) =>{
    let hexString = "";
    let  keys = Object.keys(packet);

    for(i =0; i<keys.length;i++){

        if(keys[i] == 'cmd'){
            packet[keys[i]] = packet[keys[i]].charCodeAt(0);
        }

        packet[keys[i]]  = Number(packet[keys[i]]).toString(16).toUpperCase();


        if(keys[i] == 'intgtime'){
            packet[keys[i]] = packet[keys[i]].padStart(8,"0");
        }
        else{
            packet[keys[i]] = packet[keys[i]].padStart(2,"0");
        }

        hexString += packet[keys[i]];
    }

    let byteArray = Buffer.from(hexString, 'hex');

    return byteArray;
}

const parsing = (receieve_packet) =>{
    let stx = receieve_packet.slice(0,2);
    let deviceId = receieve_packet.slice(2,4);
    let etx = receieve_packet.slice(receieve_packet.length-2, receieve_packet.length);

    if(stx === '02' && deviceId === DeviceId && etx == '03'){
        let cmd = String.fromCharCode(parseInt(receieve_packet.slice(4,6),16));
        let intgTime = parseInt(receieve_packet.slice(6,14),16);
        let pixel ={};
        for(let i=0;i<288;i++){
            pixel[i] = parseInt(receieve_packet.slice(i*4+14, i*4+18),16);
        }
    
        measuerment = {
            'cmd': cmd,
            'intgtime': intgTime,
            'pixel': pixel
        }

        console.log(measuerment.intgtime)
    
        return measuerment;
    }

    return {};
    
}

exports.getTcpState =() =>{
    return tcp_state;
}

exports.setinitValue =() =>{
    measuerment = {}
    receieve_packet = "";
}
