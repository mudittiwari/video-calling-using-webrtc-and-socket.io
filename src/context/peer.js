
import React from 'react';
export const peer =new RTCPeerConnection(
    {
        iceServers: [
            {
                urls: ["stun:stun.l.google.com:19302", "stun:gobal.stun.twillo.com:3478"]
            },
        ],
    }
);
export const PeerContext = React.createContext();