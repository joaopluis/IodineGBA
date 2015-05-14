/** @param {GameBoyAdvanceSerial} serial */
function RTCMultiplayer(serial) {
    console.log("RTCMultiplayer loaded");
    this.serial = serial;
    this.gbaData = ["", null, null, null, null];
    window.multiplayerLog = []; //FIXME: debug only
}

RTCMultiplayer.prototype.updateData = function () {
    console.log("UPDATE:", this.gbaData);
    window.multiplayerLog.push('[' + this.gbaData.join(', ') + ']');
    
    if(this.gbaData[1]) {
        this.serial.SIODATA_A = this.gbaData[1] | 0;
    } else {
        this.serial.SIODATA_A = 0xFFFF;
    }
    if(this.gbaData[2]) {
        this.serial.SIODATA_B = this.gbaData[2] | 0;
    } else {
        this.serial.SIODATA_B = 0xFFFF;
    }
    if(this.gbaData[3]) {
        this.serial.SIODATA_C = this.gbaData[3] | 0;
    } else {
        this.serial.SIODATA_C = 0xFFFF;
    }
    if(this.gbaData[4]) {
        this.serial.SIODATA_D = this.gbaData[4] | 0;
    } else {
        this.serial.SIODATA_D = 0xFFFF;
    }

    if(this.playerId == 0) {
        this.serial.RCNTDataBits = 0x9;
    } else {
        this.serial.RCNTDataBits = 0x8;
    }
    this.serial.SIOTransferStarted = false;
    this.serial.IOCore.irq.requestIRQ(0x80);
    
};

RTCMultiplayer.prototype.quit = function () {};

RTCMultiplayer.prototype.start = function () {
    //var data = this.serial.readSIODATA8_1() | 0;
    //data = data << 8;
    //data = data | this.serial.readSIODATA8_0();
    var data = this.serial.SIODATA8 | 0;
    
    this.gbaData = ["", null, null, null, null];
    this.gbaData[this.playerId] = data;
    this.send("WRITE " + data);
};

RTCMultiplayer.prototype.send = function (msg) {
    if (msg.match(/ALLREADY/)) return;
    this.socket.send(msg);
};

RTCMultiplayer.prototype.init = function (nPlayer) {
    this.playerId = nPlayer;
    this.serial.SIOMULT_PLAYER_NUMBER = this.playerId - 1;
    var mp = this;
    try {
        this.socket = new RTCSocket(this.playerId);
        this.socket.onmessage = function (msg) {
            var message = msg.split(" ");
            
            if (message[1] == "WRITE") {
                this.gbaData = ["", null, null, null, null];
                mp.serial.SIOTransferStarted = true;
                //var data = mp.serial.readSIODATA8_1() | 0;
                //data = data << 8;
                //data = data | mp.serial.readSIODATA8_0();
                var data = mp.serial.SIODATA8 | 0;
                mp.send("SEND " + data);
                
                //fixme (only works with 2)
                mp.gbaData[message[0]] = Number(message[2]);
                mp.gbaData[nPlayer] = data;
                mp.updateData();
            } else if (message[1] == "SEND") {
                mp.gbaData[message[0]] = Number(message[2]);
                mp.updateData(); //fixme (only works with 2)
            }
        };
        this.serial.RCNTDataBits = this.serial.RCNTDataBits | 0x2;
    }
    catch (ex) {
        console.log(ex);
    }
};