var RTC = {
    firebase: new Firebase("https://incandescent-torch-6805.firebaseio.com/"),
    PeerConnection: window.RTCPeerConnection || window.mozRTCPeerConnection
            || window.webkitRTCPeerConnection,
    SessionDescription: window.RTCSessionDescription || window.mozRTCSessionDescription
            || window.webkitRTCSessionDescription,
    IceCandidate: window.RTCIceCandidate || window.mozRTCIceCandidate || window.RTCIceCandidate,
    configuration: {
        iceServers: [{
            url: "stun:numb.viagenie.ca",
            credential: "x0hMsl9RaoFkrYWtutC0yLuCIEDUn5Op",
            username: "dinismadeira%40gmail.com"
        }]
    },
    options: {optional: [{RtpDataChannels: true}]},
    
    //local connection
    createLocalConnection: function (room, onMessage, onOpen) {
        var firebase = RTC.firebase.child(room);
    
        var pc = new RTC.PeerConnection(RTC.configuration, RTC.options);
        console.log("local connection created");

        //create data channel
        var chan = this.chan = pc.createDataChannel("GBA", {reliable: true});
        chan.onmessage = onMessage;
        console.log("local data channel created");
        
        //data channel opened
        chan.onopen = function(e) {
            if (chan.readyState == "open") {
                console.log("local data channel open");
                firebase.child('remoteicecandidates').remove();
                if (onOpen) onOpen(e);
            }
        };
        
        //send an offer to the other peer
        pc.createOffer(function(desc) {
            pc.setLocalDescription(desc);
            firebase.child('offer').set(JSON.stringify(desc));
            
            //received answer from the other peer
            firebase.child('answer').on('value', function (answer) {
                if (answer.val() != null) {
                    console.log("received answer");
                    firebase.child('answer').remove();
                    answer = new RTC.SessionDescription(JSON.parse(answer.val()));
                    pc.setRemoteDescription(answer);
                }
            });
        }, RTC.errorHandler);
        console.log("sent offer");
        
        //clear previous ice candidates
        firebase.child('localicecandidates').remove();
        
        //generated ice candidate
        pc.onicecandidate = function(e) {
            //console.log("generated local ice candidate: ", e.candidate);
            if (e.candidate) {
                //send ice candidate to the other peer
                //firebase.child('localicecandidate').set(JSON.stringify(e.candidate));
                firebase.child('localicecandidates').push(JSON.stringify(e.candidate));
                //pc.onicecandidate = null;
            }
        };
        
        //received ice candidate from the other peer
        firebase.child('remoteicecandidates').on('child_added', function (icecandidate) {
            //console.log("received remote icecandidate:", icecandidate.val());
            if (icecandidate.val() != null) {
                firebase.child('remoteicecandidate').remove();
                pc.addIceCandidate(new RTC.IceCandidate(JSON.parse(icecandidate.val())));
            }
        });
    },
    
    //remote connection
    createRemoteConnection: function (room, onMessage, onOpen) {
        var firebase = RTC.firebase.child(room);
        var pc = new RTC.PeerConnection(RTC.configuration, RTC.options);
        console.log("remote connection created");
        
        //data channel created
        var parent = this;
        pc.ondatachannel = function(e) {
            console.log("remote data channel created");
            var chan = parent.chan = e.channel;
            chan.onmessage = onMessage;
            
            //data channel opened
            chan.onopen = function(e) {
                if (chan.readyState == "open") {
                    console.log("remote data channel open");
                    firebase.child('localicecandidates').remove();
                    if (onOpen) onOpen(e);
                }
            };
        };
        
        //received an offer from the other peer
        firebase.child('offer').on('value', function (offer) {
            if (offer.val() != null) {
                console.log("received offer");
                firebase.child('offer').remove();
                offer = new RTC.SessionDescription(JSON.parse(offer.val()));
                pc.setRemoteDescription(offer);
                
                //send an answer to the other peer
                pc.createAnswer(function (answer) {
                    pc.setLocalDescription(answer);
                    firebase.child('answer').set(JSON.stringify(answer));
                }, RTC.errorHandler);
                console.log("sent answer");
            }
        });
        
        //clear previous ice candidates
        firebase.child('remoteicecandidate').remove();
        
        //generated ice candidate
        pc.onicecandidate = function(e) {
            //console.log("generated remote ice candidate: ", e.candidate);
            if (e.candidate) {
                //send ice candidate to the other peer
                //firebase.child('remoteicecandidate').set(JSON.stringify(e.candidate));
                firebase.child('remoteicecandidates').push(JSON.stringify(e.candidate));
                //pc.onicecandidate = null;
            }
        };
        
        //received ice candidate from the other peer
        firebase.child('localicecandidates').on('child_added', function (icecandidate) {
            //console.log("received local icecandidate:", icecandidate.val());
            if (icecandidate.val() != null) {
                firebase.child('localicecandidate').remove();
                pc.addIceCandidate(new RTC.IceCandidate(JSON.parse(icecandidate.val())));
            }
        });
        
    },
    errorHandler: function (err) {
        console.error(err);
    },
};
