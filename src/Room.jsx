import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useCallback } from "react";
import { SocketContext } from './context/socket';
import toast, { Toaster } from 'react-hot-toast';
function Room() {
    const location = useLocation();
    const socket = useContext(SocketContext);
    const [users, setUsers] = useState([]);
    const [url, setUrl] = useState("");
    const [file, setFile] = useState(null);
    const notify = () => toast.success('File Received',{
        iconTheme: {
            primary: '#67539f',
            secondary: '#fff',
          },
    });
    const notify1 = (data) => toast(data+" Joined the Room",{
        iconTheme: {
            primary: '#67539f',
            secondary: '#fff',
          },
    });
    const notify2 = (data) => toast(data+" Left",{
        iconTheme: {
            primary: '#67539f',
            secondary: '#fff',
          },
    });
    const handleroomjoined = useCallback((data) => {
        // console.log(data.users);
        let temp = [];
        for (let i = 0; i < data.users.length; i++) {
            temp.push(data.users[i][0]);
        }
        setUsers(temp);
    }, []);
    const handleuserjoined = useCallback((data) => {
        notify1(data.user);
    }, []);
    const handleuserleft = useCallback((data) => {
        notify2(data.user);
    }, []);
    const handlefilereceive = useCallback(({ fileName, fileType, fileData }) => {
        const fileBlob = new Blob(fileData, { type: fileType });
          const downloadLink = URL.createObjectURL(fileBlob);
          const downloadElement = document.createElement('a');
          downloadElement.href = downloadLink;
          downloadElement.download = fileName;
          downloadElement.click();
          URL.revokeObjectURL(downloadLink);
        notify();
    }, []);
    const sendFile = (file) => {
        const chunkSize = 64 * 1024;
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
    
          socket.emit('fileData', { fileName: file.name, fileType: file.type, fileData: chunks,url:url });
        };
    
        reader.readAsArrayBuffer(file);
      };
    useEffect(() => {
        if (location.state) {
            let temp = [];
            for (let i = 0; i < location.state.users.length; i++) {
                temp.push(location.state.users[i][0]);
            }
            setUsers(temp);
            console.log(temp);
            setUrl(location.state.room_url);



        }
        socket.on('room_data', handleroomjoined);
        socket.on('receive_file', handlefilereceive);
        socket.on('user_joined', handleuserjoined);
        socket.on('user_disconnected', handleuserleft);
        return () => {

            socket.off('room_data', handleroomjoined);
            socket.off('receive_file', handlefilereceive);
            socket.off('user_joined', handleuserjoined);
            socket.off('user_disconnected', handleuserleft);
            // }
        }
    }, []);
    return (
        <>
            <Toaster />
            <div className="flex justify-center items-center h-screen" style={{ "backgroundColor": '#67539f' }}>
                <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-8 shadow-lg" style={{"maxWidth":"90vw"}}>
                    <div className='flex justify-between items-center mb-2'>
                        <h2 className="text-xs text-white w-full text-center">URL: {url.slice(0, 15)}...... </h2>
                        <button
                            className="w-24 bg-purple-800 hover:bg-purple-700 text-white py-1 px-2 rounded focus:outline-none"
                            type="submit"
                            onClick={(e) => {
                                e.preventDefault();
                                navigator.clipboard.writeText(url);
                            }}
                        >
                            Copy
                        </button>
                    </div>
                    <h2 className="text-2xl text-white mb-5 mt-5 w-full text-center">Room Members</h2>
                    <div className="overflow-y-auto h-32">

                        {users.map((user, index) => {
                            return (
                                <div key={index} className="flex justify-between items-center mb-2">
                                    <h2 className="text-xs text-white w-full my-1 text-start">{user}</h2>
                                </div>
                            );
                        })}

                    </div>
                    <div className="flex">
                    <input accept="" className="text-white" onChange={(e) => {
                        setFile(e.target.files[0]);
                    }} type="file" placeholder='select file to share' />
                    <button
                        className="w-24 bg-purple-800 hover:bg-purple-700 text-white py-1 px-2 rounded focus:outline-none"
                        type="submit"
                        onClick={(e) => {
                            e.preventDefault();
                            if(file)
                                sendFile(file);
                            else
                                alert('Please select a file');
                        }}
                    >
                        share
                    </button>
                    </div>
                </div>
            </div>
        </>
    );
}
export default Room;