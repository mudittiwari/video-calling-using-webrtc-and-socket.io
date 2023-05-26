import io from 'socket.io-client';
import React from 'react';
export const socket = io.connect("https://socket-io-file-sharing.onrender.com");
// export const socket = io.connect("http://localhost:5000");
export const SocketContext = React.createContext();
