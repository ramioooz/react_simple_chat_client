import { useContext } from "react";
import { Messenger } from "./components/Messenger";
import { SocketContext } from "./context/WebSocketContext";

function App() {
  const clientSocket = useContext(SocketContext);

  return (
    <>
      <h1 style={{ marginTop: "20px", fontFamily: `"Lucida Console"` }}>
        React - NestJs websocket client concept app
      </h1>
      <div className="implementedByCont">
        <h3>Implemented by Eng.</h3>
        <h3>
          <a href="https://rami.sd" target="_blank" rel="noopener noreferrer">
            Rami Mohamed
          </a>
        </h3>
      </div>
      <div>
        <p
          style={{
            fontFamily: `"Lucida Console"`,
            fontSize: "14px",
            marginBottom: "10px",
          }}
        >
          * You can open two browser windows to simulate real time chat between
          two clients
        </p>
      </div>

      <Messenger socket={clientSocket} />
    </>
  );
}

export default App;
