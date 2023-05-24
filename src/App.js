import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from 'react';
import io from 'socket.io-client';
import { useRef } from 'react';
const socket = io.connect("http://https://socket-io-file-sharing.onrender.com");
function App() {
  const socketRef = useRef(null);
  useEffect(() => {
    socket.on('connection', (data) => {
      console.log("connected");
    });
    const receiveFileData = ({ fileName, fileType, fileData }) => {
      console.log("mudit tiwari");
      const fileBlob = new Blob(fileData, { type: fileType });
      const downloadLink = URL.createObjectURL(fileBlob);
      const downloadElement = document.createElement('a');
      downloadElement.href = downloadLink;
      downloadElement.download = "downloaded_file";
      downloadElement.click();
      URL.revokeObjectURL(downloadLink);
    };
    socket.on('receive_file', receiveFileData);
    // socketRef.current = io.connect("https://socket-io-file-sharing.onrender.com");
    // socketRef.current.on('receive_file', receiveFileData);
    // return () => {
    //   socket.disconnect();
    // }
  },[socket]);
  
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
  
  
  const [file,setFile]=useState(null);
  return (
    <div className="App">
      <input onChange={(e)=>{
        setFile(e.target.files[0]);
      }} type="file" placeholder='select file to share' />
      <button onClick={(e)=>{
        e.preventDefault();
    if (file) {
      // sendChunks(file);
      sendFile(file);
      }}}>Share</button>
    </div>
  );
}

export default App;
