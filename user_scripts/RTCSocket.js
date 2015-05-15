function RTCSocket(id) {
    this.connA = null;
    this.connB = null;
    this.id = id;
    
    //debug only
    window.RTCLog = [];
    window.RTCSocket = this;

    if (id > 1) this.startRemote();
    else this.startLocal();
}

RTCSocket.prototype.close = function () {};

RTCSocket.prototype.send = function (data) {
    data = this.id + " " + data;
    window.RTCLog.push("-> " + data);
    console.log("RTCSocket: Sending: ", data);
    try {
        if (this.connA && this.connA.chan && this.connA.chan.readyState == 'open') this.connA.chan.send(data);
        if (this.connB && this.connB.chan && this.connB.chan.readyState == 'open') this.connB.chan.send(data);
    } catch (e) {
        console.log("RTCSocket: Error sending:", data);
    }
};

RTCSocket.prototype.onMessage = function (data) {
    window.RTCLog.push("<- " + data);
    console.log("RTCSocket: Received:", data);
    this.onmessage(data);
};

RTCSocket.prototype.startRemote = function () {
    parent = this;
    this.connB = new RTC.createRemoteConnection(this.id - 1, function (e) {
        if (!e) return;
        //console.log("RTCSocket: Server - Received: " + e.data);
        parent.onMessage(e.data);
        if (parent.connA && parent.connA.chan && parent.connA.chan.readyState == 'open') parent.connA.chan.send(e.data);
    }, this.startLocal(this.id));
};

RTCSocket.prototype.startLocal = function () {
    parent = this;
    this.connA = new RTC.createLocalConnection(this.id, function (e) {
        if (!e) return;
        //console.log("RTCSocket: Client - Received: " + e.data);
        parent.onMessage(e.data);
        if (parent.connB && parent.connB.chan && parent.connB.chan.readyState == 'open') parent.connB.chan.send(e.data);
    });
};
