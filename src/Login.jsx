import { useCallback, useEffect, useState, useContext } from 'react';
import { SocketContext } from './context/socket';
import { useNavigate } from 'react-router-dom';
import LoadingBar from './Loadingbar';
function Login() {
    const navigate = useNavigate();
    const socket = useContext(SocketContext);
    const [state, setState] = useState("Create");
    const [username1, setUsername1] = useState("");
    const [password1, setPassword1] = useState("");
    const [username2, setUsername2] = useState("");
    const [password2, setPassword2] = useState("");
    const [loading, setLoading] = useState(false);
    const handleroomcreated = useCallback((data) => {
        setLoading(false);
        navigate('/room', { state: { 'users': data.users, "room_url": data.url } })
    }, []);
    const handleroomjoined = useCallback((data) => {
        // console.log(data);
        setLoading(false);
        navigate('/room', { state: { 'users': data.users, 'room_url': data.url } })
    }, []);
    useEffect(() => {
        socket.on('connection', (data) => {
            console.log("connected");
        });
        socket.on('room_created', handleroomcreated);
        socket.on('room_joined', handleroomjoined);
        return () => {
            socket.off('connection');
            socket.off('room_created', handleroomcreated);
            socket.off('room_joined', handleroomjoined);
            // const receiveFileData = ({ fileName, fileType, fileData }) => {
            //   console.log("mudit tiwari");
            //   const fileBlob = new Blob(fileData, { type: fileType });
            //   const downloadLink = URL.createObjectURL(fileBlob);
            //   const downloadElement = document.createElement('a');
            //   downloadElement.href = downloadLink;
            //   downloadElement.download = "downloaded_file";
            //   downloadElement.click();
            //   URL.revokeObjectURL(downloadLink);
            // };
            // socket.on('receive_file', receiveFileData);
            // }
        }
    }, [socket, handleroomcreated, handleroomjoined]);
    return (
        <>
        {loading && <LoadingBar/>}
            <div className="flex justify-center items-center h-screen" style={{ "backgroundColor": '#67539f' }}>
                <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-8 shadow-lg">

                    {state == "Create" ? <div>
                        <h2 className="text-2xl text-white mb-5 w-full text-center">Create Room</h2>
                        <div className="mb-4">
                            <label className="block text-white mb-2" htmlFor="username">
                                Username
                            </label>
                            <input
                                onChange={(e) => setUsername1(e.target.value)}
                                className="w-full px-3 py-2 rounded bg-gray-300 text-gray-800 focus:bg-white focus:outline-none"
                                type="text"
                                id="username"
                                value={username1}
                                placeholder="Enter your username"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-white mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                onChange={(e) => setPassword1(e.target.value)}
                                value={password1}
                                className="w-full px-3 py-2 rounded bg-gray-300 text-gray-800 focus:bg-white focus:outline-none"
                                type="password"
                                id="password"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            className="w-full mb-2 bg-purple-800 hover:bg-purple-700 text-white py-2 px-4 rounded focus:outline-none"
                            type="submit" onClick={(e) => {
                                e.preventDefault();
                                console.log(username1, password1)
                                if (username1.trim().length === 0) {
                                    alert("Please enter username and password");
                                    return;
                                }

                                else if (password1.trim().length === 0) {
                                    alert("Please enter password");
                                    return;
                                }
                                setLoading(true);
                                socket.emit("create_room", { "username": username1, "password": password1 });

                            }}
                        >
                            Create Room
                        </button>
                        <button
                            className="w-full bg-purple-800 hover:bg-purple-700 text-white py-2 px-4 rounded focus:outline-none"
                            type="submit" onClick={() => setState("Join")}
                        >
                            Join Room
                        </button>
                    </div> : <div>
                        <h2 className="text-2xl text-white mb-5 w-full text-center">Join Room</h2>
                        <div className="mb-4">
                            <label className="block text-white mb-2" htmlFor="username">
                                Username
                            </label>
                            <input
                                value={username2}
                                onChange={(e) => setUsername2(e.target.value)}
                                className="w-full px-3 py-2 rounded bg-gray-300 text-gray-800 focus:bg-white focus:outline-none"
                                type="text"
                                id="username"
                                placeholder="Enter your username"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-white mb-2" htmlFor="url">
                                Room URL
                            </label>
                            <input
                                value={password2}
                                onChange={(e) => setPassword2(e.target.value)}
                                className="w-full px-3 py-2 rounded bg-gray-300 text-gray-800 focus:bg-white focus:outline-none"
                                type="password"
                                id="url"
                                placeholder="Enter Room URL"
                            />
                        </div>

                        <button
                            className="w-full mb-2 bg-purple-800 hover:bg-purple-700 text-white py-2 px-4 rounded focus:outline-none"
                            type="submit"
                            onClick={(e) => {
                                e.preventDefault();
                                console.log(username2, password2)
                                if (username2.trim().length === 0) {
                                    alert("Please enter username and password");
                                    return;
                                }

                                else if (password2.trim().length === 0) {
                                    alert("Please enter password");
                                    return;
                                }
                                setLoading(true);
                                socket.emit("join_room", { "username": username2, "password": password2 });
                            }}
                        >
                            Join Room
                        </button>
                        <button
                            className="w-full bg-purple-800 hover:bg-purple-700 text-white py-2 px-4 rounded focus:outline-none"
                            type="submit" onClick={() => setState("Create")}
                        >
                            Create Room
                        </button>
                    </div>}
                </div>
            </div>
        </>
    );
}

export default Login;