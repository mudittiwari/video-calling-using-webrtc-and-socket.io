import { useContext, useEffect, useRef } from "react";
import ReactPlayer from 'react-player'
import { useLocation } from "react-router-dom";
import { useState } from "react";
import { useCallback } from "react";
import { BsFillMicFill, BsFillCameraVideoFill, BsFillCameraVideoOffFill, BsMicMuteFill } from "react-icons/bs";
import { PeerContext } from "./context/peer";
import { SocketContext } from './context/socket';
import toast, { Toaster } from 'react-hot-toast';
function Room() {
  const peer = useContext(PeerContext);
  const location = useLocation();
  const [videoicon, setVideoicon] = useState(<BsFillCameraVideoFill className="text text-xl" />);
  const [audioicon, setAudioicon] = useState(<BsFillMicFill className="text text-xl" />);
  const [mystream, setMystream] = useState(null);
  const [userstreamtoshow, setuserstreamtoshow] = useState(null);
  const [useraudiotoshow, setuseraudiotoshow] = useState(null);
  const [uservideotoshow, setuservideotoshow] = useState(null);
  const [useraudio, setuseraudio] = useState(true)
  const [uservideo, setuservideo] = useState(true)
  const [share, setShare] = useState('hidden');
  const [call, setCall] = useState('visible');
  const [audio, setAudio] = useState(true);
  const [video_, setVideo] = useState(true);
  const [userstream, setUserstream] = useState(null);
  const socket = useContext(SocketContext);
  const [users, setUsers] = useState([]);
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const notify = () => toast.success('File Received', {
    iconTheme: {
      primary: '#67539f',
      secondary: '#fff',
    },
  });
  const notify1 = (data) => toast(data + " Joined the Room", {
    iconTheme: {
      primary: '#67539f',
      secondary: '#fff',
    },
  });
  const notify2 = (data) => toast(data + " Left", {
    iconTheme: {
      primary: '#67539f',
      secondary: '#fff',
    },
  });
  const notify3=()=>toast("Url copied to clipboard",{iconTheme: {
      primary: '#67539f',
      secondary: '#fff',
  }})

  const createoffer = async (data) => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(new RTCSessionDescription(offer));
    console.log(offer);
    socket.emit("send_offer", { "offer": offer, "password": data.url });
  }
  const createanswer = async (offer) => {
    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    console.log(answer);
    await peer.setLocalDescription(new RTCSessionDescription(answer));
    socket.emit("send_answer", { "answer": answer, "password": location.state.room_url });
  }
  const handleofferreceived = useCallback(async (data) => {
    console.log("offer received");
    console.log(data);
    createanswer(data.offer);
    // setstream();
  });
  const handleanswerreceived = useCallback(async (data) => {
    console.log("answer received");
    await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
    setShare('visible');
    setCall('hidden');

    // sendmystream();       
  });
  function sendmystream() {
    navigator.mediaDevices.enumerateDevices()
      .then(function(devices) {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log(videoDevices);
        const selectedDevice = videoDevices[0]; // Index 1 represents the second camera

        if (selectedDevice) {
          const constraints = {
            video: { deviceId: selectedDevice.deviceId },
            audio: true
          };

          navigator.mediaDevices.getUserMedia(constraints)
            .then(function(stream) {
              console.log(stream);
              const tracks = stream.getTracks();
              let senders = []
              tracks.forEach((track) => {
                let sender = peer.addTrack(track, stream);
                console.log(sender);
                senders.push(sender);
              });
              setsenderid(senders);
            })
            .catch(function(error) {
              console.error('Error accessing media devices:', error);
            });
        } else {
          console.error('Camera with index 1 not found.');
        }
      })
      .catch(function(error) {
        console.error('Error enumerating media devices:', error);
      });
  }

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
  async function setuserstream(useraudio, uservideo) {
    // console.log(userstream_.getTracks())
    setuseraudio(useraudio)
    setuservideo(uservideo)
  }
  async function setstream() {
    setMystream(null);
    navigator.mediaDevices.enumerateDevices()
      .then(function(devices) {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const audiodevices = devices.filter(device => device.kind === 'audioinput');
        const selectedDevice = videoDevices[0];

        if (selectedDevice) {
          let constraints;
          if (video_ && audio) {
            console.log("mudit tiwari");
            constraints = {
              video: { deviceId: selectedDevice.deviceId },
              audio: true
            };
          }
          else if (video_ && !audio)
            constraints = {
              video: { deviceId: selectedDevice.deviceId },
              audio: false
            };
          else if (!video_ && audio)
            constraints = {
              video: false,
              audio: true
            };
          else
            constraints = {
              video: false,
              audio: false
            };
          console.log(constraints);
          navigator.mediaDevices.getUserMedia(constraints)
            .then(function(stream) {
              console.log(stream);
              setMystream(stream);
            })
            .catch(function(error) {
              console.error('Error accessing media devices:', error);
            });
        } else {
          console.error('Camera with index 1 not found.');
        }
      })
      .catch(function(error) {
        console.error('Error enumerating media devices:', error);
      });
  }
  const handlenegotiation = useCallback(async () => {
    console.log("hello nego");
    const offer = await peer.createOffer();
    await peer.setLocalDescription(new RTCSessionDescription(offer));
    socket.emit("send_offer", { "offer": offer, "password": location.state.room_url });
  }, [])
  const handletrack = useCallback((e) => {
    const remoteStream = e.streams;
    console.log(remoteStream);
    console.log("GOT TRACKS!!");
    // userstream_=remoteStream[0];
    setUserstream(remoteStream[0]);
    setuserstreamtoshow(remoteStream[0])
    let stream = remoteStream[0].clone();
    const video = stream.getVideoTracks()[0]
    stream.removeTrack(video)
    setuseraudiotoshow(stream);
    stream = remoteStream[0].clone();
    const audio = stream.getAudioTracks()[0]
    stream.removeTrack(audio)
    setuservideotoshow(stream);
  }, [])
  const handlesenddata = useCallback((data) => {
    console.log("Sending streams");
    sendmystream();
    sendmystream();
  });
  useEffect(() => {
    if (location.state) {
      let temp = [];
      for (let i = 0; i < location.state.users.length; i++) {
        temp.push(location.state.users[i][0]);
      }
      setUsers(temp);
      console.log(temp);
      setUrl(location.state.room_url);
      // setmine()


    }
  }, []);


  const handleuserstreamchanged = useCallback((data) => {
    const { audio, video } = data;
    console.log(data)
    setuserstream(audio, video);
  }, []);
  useEffect(() => {
    setstream();
  }, [audio, video_]);
  useEffect(() => {
    socket.on('room_data', handleroomjoined);
    socket.on('user_joined', handleuserjoined);
    socket.on('user_disconnected', handleuserleft);
    // socket.on('send_data_again', handlesenddataagain);
    socket.on('offer_received', handleofferreceived);
    socket.on('answer_received', handleanswerreceived);
    socket.on('userstream_changed', handleuserstreamchanged);
    socket.on("send_data", handlesenddata);
    peer.addEventListener('negotiationneeded', handlenegotiation);
    peer.addEventListener("track", handletrack)
    // peer.ontrack = handletrack;
    return () => {
      socket.off('room_data', handleroomjoined);
      peer.removeEventListener('negotiationneeded', handlenegotiation);
      peer.removeEventListener('track', handletrack);
      socket.off('userstream_changed', handleuserstreamchanged);
      socket.off('user_joined', handleuserjoined);
      socket.off('user_disconnected', handleuserleft);
      // socket.off('send_data_again', handlesenddataagain);
      socket.off('offer_received', handleofferreceived);
      socket.off('answer_received', handleanswerreceived);
      socket.off("send_data", handlesenddata);
    }
  }, [userstream]);
  return (
    <>
      <Toaster />

      <div className="flex flex-col justify-evenly items-center h-max py-10 main">
        <div className='flex justify-between items-center mb-2'>
          <h2 className="text-xs text w-full text-center">URL: {url.slice(0, 15)}...... </h2>
          <button
            className="w-24 text main py-1 px-2 rounded focus:outline-none"
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              navigator.clipboard.writeText(url);
              notify3()
            }}
          >
            Copy
          </button>
        </div>
        <div className="w-full flex flex-col mt-10  md:flex-row items-center md:items-start justify-evenly">
          <div className="bg-white w-4/5 md:w-2/5 h-max bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-8 main" >


            <div className="w-full" style={{'height':'400px','overflow':'hidden'}}>
              {location.state.type === "owner" ? <h2 className="text-2xl text mb-5 w-full text-center">{users[0]}</h2> : <h2 className="text-2xl text mb-5 w-full text-center">{users[1]}</h2>}
             <div className='hidden md:block'> <ReactPlayer url={mystream} width="100%" height="400px" muted playing={true} controls={false} /></div>
              <div className='block md:hidden'> <ReactPlayer url={mystream} width="100%" height="300px" muted playing={true} controls={false} /></div>

            </div>

          </div>
          <div className="bg-white mt-5 md:mt-0 w-4/5 md:w-2/5 h-max bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-8 main" >


            <div className="w-full" style={{'height':'400px'}}>

              {users.length > 1 && (location.state.type === "participant" ? <h2 className="text-2xl text mb-5 w-full text-center">{users[0]}</h2> : <h2 className="text-2xl text mb-5 w-full text-center">{users[1]}</h2>)}
              {console.log(useraudio, uservideo)}
              {useraudio && uservideo && <ReactPlayer url={userstreamtoshow} playing={true} controls={false} width="100%" height="80%" />}
              {!useraudio && uservideo && <ReactPlayer url={uservideotoshow} playing={true} controls={false} width="100%" height="80%"/>}
              {useraudio && !uservideo && <ReactPlayer url={useraudiotoshow} playing={true} controls={false} width="100%" height="80%" />}
              {users.length > 1 && (location.state.type == "owner" && (userstream == null ? <div className="w-full flex"><h2 className="text-2xl text mb-5 w-full text-center">waiting for {users[1]} to join</h2></div> : <h1></h1>))}

              
             

            </div>
            
             
          </div>
          
          {users.length > 1 && (location.state.type == "participant" && (userstream == null ? <div className="w-full flex justify-center mt-5">
                <button
                  className={share + " w-24 text main py-1 px-2 rounded focus:outline-none"}
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    socket.emit("send_streams", { "password": location.state.room_url });
                  }}
                >
                  share
                </button>
                <button
                  className={call + " w-24 text main py-1 px-2 rounded focus:outline-none"}
                  type="submit"
                  onClick={(e) => {
                    let data = { 'url': location.state.room_url };
                    createoffer(data);


                  }}
                >
                  call
                </button></div> : <h1></h1>))}
        </div>
                    {users.length>1 && <div className="w-full flex justify-center items-center mt-10">
          <div onClick={() => {
            if (audio)
              setAudioicon(<BsMicMuteFill className="text text-xl" />);
            else
              setAudioicon(<BsFillMicFill className="text text-xl" />);
            setAudio(!audio);

            socket.emit("userstream_changed", { "audio": !audio, "video": video_, "password": location.state.room_url })
          }} className="bg-white flex items-center justify-center w-14 mx-5 h-14 rounded-full bg-opacity-20 backdrop-filter backdrop-blur-lg main" >
            {audioicon}
          </div>
          <div onClick={(e) => {
            if (video_)
              setVideoicon(<BsFillCameraVideoOffFill className="text text-xl" />);
            else
              setVideoicon(<BsFillCameraVideoFill className="text text-xl" />);
            setVideo(!video_);
            socket.emit("userstream_changed", { "audio": audio, "video": !video_, "password": location.state.room_url })

          }} className="bg-white flex items-center justify-center w-14 mx-5 h-14 rounded-full bg-opacity-20 backdrop-filter backdrop-blur-lg main" >
            {videoicon}
          </div>
        </div>}
      </div>
    </>
  );
}
export default Room;