/** @param {GameBoyAdvanceSerial} serial */
function Multiplayer(serial) {
    this.serial = serial;
    this.gbaData = ["", null, null, null, null];
    this.ready = false;
    this.queue = [];
}

Multiplayer.prototype.updateData = function () {
    console.log("MP End");
    console.log(this.gbaData);
    if(this.gbaData[1]){
        this.serial.SIODATA_A = this.gbaData[1] | 0;
    } else {
        this.serial.SIODATA_A = 0xFFFF;
    }
    if(this.gbaData[2]){
        this.serial.SIODATA_B = this.gbaData[2] | 0;
    } else {
        this.serial.SIODATA_B = 0xFFFF;
    }
    if(this.gbaData[3]){
        this.serial.SIODATA_C = this.gbaData[3] | 0;
    } else {
        this.serial.SIODATA_C = 0xFFFF;
    }
    if(this.gbaData[4]){
        this.serial.SIODATA_D = this.gbaData[4] | 0;
    } else {
        this.serial.SIODATA_D = 0xFFFF;
    }

    if(this.playerId == 0){
        this.serial.RCNTDataBits = 0x9;
    } else {
        this.serial.RCNTDataBits = 0x8;
    }
    this.serial.SIOTransferStarted = false;
    //this.serial.IOCore.irq.requestIRQ(0x80);
};

Multiplayer.prototype.quit = function () {
    if (this.socket != null) {
        console.log("Goodbye!");
        this.socket.close();
        this.ready = false;
        this.socket = null;
    }
};

Multiplayer.prototype.start = function () {
    var data = this.serial.readSIODATA8_1() | 0;
    data = data << 8;
    data = data | this.serial.readSIODATA8_0();
    this.send("WRITE " + data);
    console.log("MP start");
};

Multiplayer.prototype.send = function (msg) {
    if (this.ready) {
        console.log("SENT " + msg);
        this.socket.send(msg);
    } else {
        this.queue.push(msg);
    }
};

Multiplayer.prototype.init = function (nPlayer) {
    var host = "ws://joaopluis.pt:9000/echobot"; // SET THIS TO YOUR SERVER
    this.playerId = nPlayer;
    this.serial.SIOMULT_PLAYER_NUMBER = this.playerId - 1;
    var mp = this;
    try {
        this.socket = new WebSocket(host);
        this.socket.onopen = function (msg) {
            mp.ready = true;
            mp.send("ID " + mp.playerId);
            while(mp.queue.length > 0){
                mp.send(mp.queue.shift());
            }
        };
        this.socket.onmessage = function (msg) {
            console.log(msg.data);
            var message = msg.data.split(" ");
            if (message[0] == "REQ") {
                this.gbaData = ["", null, null, null, null];
                mp.serial.SIOTransferStarted = true;
                var data = mp.serial.readSIODATA8_1() | 0;
                data = data << 8;
                data = data | mp.serial.readSIODATA8_0();
                mp.send("SEND " + mp.playerId + " " + data);
            } else if (message[0] == "DATA") {
                mp.gbaData = message;
                mp.updateData();
            } else if (message[0] == "ALLREADY"){
                mp.serial.SIOAllGBAsReady = true;
            } else if (message[0] == "NOTALLREADY"){
                mp.serial.SIOAllGBAsReady = false;
            }
        };
        this.socket.onclose = function (msg) {
            console.log("Disconnected - status " + this.readyState);
        };

        this.serial.RCNTDataBits = this.serial.RCNTDataBits | 0x2;
    }
    catch (ex) {
        console.log(ex);
    }
};