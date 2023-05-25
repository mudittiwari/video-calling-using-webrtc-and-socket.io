
import './App.css';
import { BrowserRouter,HashRouter ,Routes, Route } from 'react-router-dom';
import {SocketContext, socket} from './context/socket';
import Login from './Login';
import Room from './Room';
// const socket = io.connect("https://socket-io-file-sharing.onrender.com");
function App() {
 
 
  
  const sendFile = (file) => {
    const chunkSize = 64 * 1024; // Set the desired chunk size
    const totalChunks = Math.ceil(file.size / chunkSize);
    let chunkIndex = 0;
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result;
      const chunks = [];

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = buffer.slice(start, end);
        chunks.push(chunk);
      }

      socket.emit('fileData', { fileName: file.name, fileType: file.type, fileData: chunks });
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <SocketContext.Provider value={socket}>
     <HashRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/room" element={<Room/>}/>
      </Routes>
     </HashRouter>
  </SocketContext.Provider>
  );
}

export default App;
