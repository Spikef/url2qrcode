;(function ($) {
    function getLocalIP(callback) {
        return new Promise(function (resolve, reject) {
            const ips = [];

            const peer = new RTCPeerConnection({
                // Don't specify any stun/turn servers, otherwise you will
                // also find your public IP addresses.
                iceServers: []
            });

            // Add a media line, this is needed to activate candidate gathering.
            peer.createDataChannel('');

            // onicecandidate is triggered whenever a candidate has been found.
            peer.onicecandidate = function(e) {
                // Candidate gathering completed.
                if (!e.candidate) {
                    peer.close();
                    const ip = ips[0];
                    resolve(ip);
                    callback && typeof callback === 'function' && callback(ip);
                    return;
                }

                // avoid duplicate entries (tcp/udp)
                const ip = /^candidate:.+ (\S+) \d+ typ/.exec(e.candidate.candidate)[1];
                if (ips.indexOf(ip) === -1) ips.push(ip);
            };

            peer.createOffer()
                .then(function(sdp) {
                    return peer.setLocalDescription(sdp);
                })
                .catch(function(err) {
                    reject(err);
                });
        });
    }

    $.extend({ getLocalIP });
}(window.jQuery));
