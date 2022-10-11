import { useEffect, useState } from "react";
import io from "socket.io-client";
import { v4 } from "uuid";
import "./App.css";

const PORT = 3001;
const socket = io(`http://localhost:${PORT}`);

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState("");
  const [room, setRoom] = useState("");
  const [chatIsVisible, setChatIsVisible] = useState(false);
  const [messages, setMessages] = useState("");

  useEffect(() => {
    console.log("connect", () => {
      setIsConnected(true);
    });
    socket.on("disconnect", () => {
      setIsConnected(false);
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [isConnected]);

  useEffect(() => {
    socket.on("receive_msg", ({ user, message }) => {
      const msg = `${user} : ${message}`;
      setMessages((prevState) => [msg, ...prevState]);
    });
  }, [socket]);

  const handleEnterChatRoom = () => {
    if (user !== "" && room !== "") {
      setChatIsVisible(true);
      socket.emit("join_room", { user, room });
    }
  };

  const handleSendMessage = () => {
    const newMsgData = {
      room: room,
      user: user,
      message: newMessage,
    };
    socket.emit("send_msg", newMsgData);
    const msg = `${user} : ${newMessage}`;
    setMessages((prevState) => [msg, ...prevState]);
    setNewMessage("");
  };

  return (
    <div>
      {!chatIsVisible ? (
        <>
          <div class="fullscreen-container">
            <div class="main-container">
              <h1>Start Chat</h1>
              <div class="form">
                <div class="input-group">
                  <input
                    type="text"
                    placeholder="Username"
                    class="input-username"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                  ></input>
                </div>
                <div class="input-group">
                  <input
                    type="text"
                    placeholder="Room ID"
                    class="input-password"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                  ></input>
                </div>
                <button onClick={handleEnterChatRoom}>Enter</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div class="fullscreen-container">
            <div class="main-container">
              <div class="chat-details">
                <h5>
                  Room: {room} | User: {user}
                </h5>
              </div>
              <div class="input-group">
                <div
                  class="chat-container"
                  style={{ overflowY: "scroll", height: 250 }}
                >
                  {Object.keys(messages).map((key) => (
                    <div className="message" key={v4()}>
                      {messages[key]}
                    </div>
                  ))}
                </div>
              </div>
              <form class="form">
                <div class="input-group">
                  <input
                    type="text"
                    placeholder="message"
                    class="input-username"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    required
                  />
                </div>

                <button
                  onClick={() =>
                    newMessage.length > 0 ? handleSendMessage() : null
                  }
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
