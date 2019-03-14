;(function (window) {
    window.getLocalIP = function getLocalIP(callback) {
        var ips = [];

        var pc = new RTCPeerConnection({
            // Don't specify any stun/turn servers, otherwise you will
            // also find your public IP addresses.
            iceServers: []
        });

        // Add a media line, this is needed to activate candidate gathering.
        pc.createDataChannel('');
        
        // onicecandidate is triggered whenever a candidate has been found.
        pc.onicecandidate = function(e) {
            if (!e.candidate) { // Candidate gathering completed.
                pc.close();
                callback(ips[0]);
                return;
            }
            var ip = /^candidate:.+ (\S+) \d+ typ/.exec(e.candidate.candidate)[1];
            if (ips.indexOf(ip) == -1) // avoid duplicate entries (tcp/udp)
                ips.push(ip);
        };

        pc.createOffer(function(sdp) {
            pc.setLocalDescription(sdp);
        }, function onerror() {});
    }
}(window));