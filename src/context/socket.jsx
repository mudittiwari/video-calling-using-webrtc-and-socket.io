import io from 'socket.io-client';
import React from 'react';
export const socket = io.connect("https://video-calling-using-webrtc-and-socketio-backend.mudittiwari2.repl.co/");
// export const socket = io.connect("http://localhost:5000");
export const SocketContext = React.createContext();
