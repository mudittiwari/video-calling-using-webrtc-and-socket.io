
import './App.css';
import { BrowserRouter,HashRouter ,Routes, Route } from 'react-router-dom';
import {SocketContext, socket} from './context/socket';
import {PeerContext, peer} from './context/peer';
import Login from './Login';
import Room from './Room';
function App() {
  return (
    <PeerContext.Provider value={peer}>
    <SocketContext.Provider value={socket}>
     <HashRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/room" element={<Room/>}/>
      </Routes>
     </HashRouter>
  </SocketContext.Provider>
  </PeerContext.Provider>
  );
}

export default App;
