import { useEffect, useId, useRef, useState } from "react";
import { msgType, typingObjType, userType } from "../types/types";
import { Socket } from "socket.io-client";
import dayjs from "dayjs";
import { capitalizeFirstLetter } from "../utils/methods";
// import * as dayjs from 'dayjs'

type componentPropsType = {
  socket: Socket;
};

var typingTimeoutId: any;

export const Messenger: React.FC<componentPropsType> = ({ socket }) => {
  const [msg, setMsg] = useState("");
  const [userName, setUserName] = useState("");
  const [joined, setJoined] = useState(false);

  const [messages, setMessages] = useState<msgType[]>([]);
  const [isTypingObj, setIsTypingObj] = useState<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<userType[]>([]);
  const [joinError, setJoinError] = useState("");
  const [loading, setIsLoading] = useState(false);
  const username_inputRef = useRef<HTMLInputElement>(null);
  // const msgInputID = useId();
  // const myFormRef = useRef(null);

  // console.log("onlineUsers: ", JSON.stringify(onlineUsers));

  useEffect(() => {
    // socket.emit("findAllMessages", {}, (response: msgType[]) => {
    //   // console.log("found messages: ");
    //   // response.forEach((msg) => {
    //   //   console.log(msg);
    //   // });
    //   setMessages(response);
    // });

    socket.on("message", (msg: msgType) => {
      // setMessages((prev) => [...prev, msg]);
      setMessages((prev) => [msg, ...prev]);
    });

    socket.on("typing", (typingObj: typingObjType) => {
      console.log(`typingObj: ${JSON.stringify(typingObj)}`);

      setIsTypingObj(typingObj);
      // if(typingObj.isTyping) {
      //   setSomeoneIsTyping(true);
      // } else {
      //   setSomeoneIsTyping(false);
      // }

      // new mod
      // add (typing) next to user name
      // in onlineUsers list
    });

    socket.on("joined", (user: userType) => {
      // update online users
      console.log(`event: (joined) - ${JSON.stringify(user)}`);
      setOnlineUsers((prev) => [user, ...prev]);
    });

    socket.on("clientRemoved", (returnObj: { clientId: string }) => {
      console.log(`event: (clientRemoved) - (${returnObj.clientId})`);
      // remove disconnected client form online clinets list
      setOnlineUsers((prev) =>
        prev.filter((user) => user.clientId !== returnObj.clientId)
      );
    });

    socket.on("connect_error", (error) => {
      console.log(error.message);
      setJoinError("connection error!");
      setIsLoading(false);
    });
  }, []);

  // useEffect(() => {
  //   console.log("onlineUsers: ", JSON.stringify(onlineUsers));
  // }, [onlineUsers]);

  const sendMsgFn = (
    e: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLElement>
  ) => {
    e.preventDefault();

    fff();
  };

  const fff = () => {
    if (msg.trim() == "") {
      return;
    }
    // prepare msg obj
    const msgObj = {
      clientId: socket.id,
      content: msg.trim(),
      dateTime: new Date(),
    };
    // send msg to server
    socket.emit("createMessage", msgObj, () => {
      setMsg("");
    });
  };

  const onEnterPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {

    if (e.key == "Enter" && e.shiftKey == false) {
      e.preventDefault();
      // myFormRef.requestSubmit();
      // msgInputID.
      console.log('Enter key pressed!');
      fff();
    }
  };

  const joinFn = (
    e: React.MouseEvent<HTMLElement> | React.FormEvent<HTMLElement>
  ) => {
    console.log("calling joinFn");

    e.preventDefault();

    setJoinError("");

    if (userName.trim().length < 1) {
      let msg = "Your name cant be empty!";
      console.log(msg);
      setJoinError(msg);
      return;
    }
    if (userName.trim().length < 3) {
      let msg = "Your name is very short!";
      console.log(msg);
      setJoinError(msg);
      return;
    }

    type returnObjType = {
      status: number;
      msg: string;
      data?: {
        users: userType[];
        messages: msgType[];
      };
    };

    if (socket.disconnected) {
      socket.connect();
    }

    setIsLoading(true);

    socket.emit("join", { name: userName }, (returnObj: returnObjType) => {
      if (returnObj.status == 200) {
        setOnlineUsers(returnObj.data!.users);
        setMessages(returnObj.data!.messages);
        setJoined(true);
      } else {
        setJoinError(returnObj.msg);
        setUserName("");
        if (username_inputRef.current) {
          username_inputRef.current.focus();
        }
      }
      setIsLoading(false);
    });
  };

  const emitTypingFn = () => {
    clearTimeout(typingTimeoutId);

    socket.emit("typing", { isTyping: true });
    typingTimeoutId = setTimeout(() => {
      socket.emit("typing", { isTyping: false });
    }, 2000);

    // return () => {
    //   clearTimeout(typingTimeoutId);
    // };
  };

  const logoutFn = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    try {
      socket.disconnect();
    } catch (error) {}
    setJoined(false);
    setUserName("");
  };

  return (
    <>
      {/* <h1>Messenger</h1> */}
      {!joined ? (
        <form onSubmit={joinFn} className="joinCont">
          <label>Please enter your name</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            ref={username_inputRef}
          />
          {joinError && (
            <div className="joinError">
              <pre>{joinError}</pre>
            </div>
          )}
          <button
            onClick={joinFn}
            style={{ marginTop: "10px" }}
            disabled={loading}
          >
            {loading ? "loading.." : "Send"}
          </button>
        </form>
      ) : (
        <div className="messengerContainer">
          <div className="loggedInUserCont">
            <p>Logged in as ({capitalizeFirstLetter(userName)})</p>
            <button onClick={logoutFn}>Logout</button>
          </div>
          <div className="messagesCont">
            <div className="messagesCont_header">
              <h3>Messages</h3>
            </div>
            {messages.length > 0 && (
              <div className="messagesArea">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.userName.toLowerCase() == userName.toLowerCase()
                        ? "ownMsgDiv"
                        : ""
                    }
                  >
                    <div
                      className={`msgCont ${
                        m.userName.toLowerCase() == userName.toLowerCase()
                          ? "ownMsgBGColor"
                          : ""
                      }`}
                      key={i}
                    >
                      <h5>{capitalizeFirstLetter(m.userName)}</h5>
                      <p>{m.content}</p>
                      <div className="msgDateTimeCont">
                        {dayjs(m.dateTime).format("hh:mm A")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* {isTypingObj && isTypingObj.isTyping && (
              <div className="typingIndicatorCont">
                <h3>({isTypingObj.clientName}) is typing...</h3>
              </div>
            )} */}
            <div className="sendMsgCont">
              <form
                className="inputAndSendBtn"
                // onSubmit={sendMsgFn}
                // id={msgInputID}
                // ref={el => myFormRef = el}
              >
                <textarea
                  // type="textarea"
                  // name="textValue"

                  // id={msgInputID}
                  rows={3}
                  onChange={(e) => {
                    setMsg(e.target.value);
                    emitTypingFn();
                  }}
                  value={msg}
                  style={{ flex: 1 }}
                  onKeyDown={onEnterPress}
                ></textarea>
                <button onClick={sendMsgFn}>SEND</button>
              </form>
            </div>
          </div>
          <div className="onlineUsersCont">
            <div className="onlineUsersCont_header">
              <h3>Online Users</h3>
            </div>
            {onlineUsers.length > 0 && (
              <div className="onlineUsersScroll">
                {onlineUsers.map(function (obj, i) {
                  var addIsTyping = false;
                  if (isTypingObj && isTypingObj.clientName == obj.userName) {
                    if (isTypingObj.isTyping) {
                      addIsTyping = true;
                    } else {
                      addIsTyping = false;
                    }
                  }
                  return (
                    <div key={i}>
                      <h5>
                        {/* {i + 1} - {obj.userName} ({obj.clientId}) */}
                        {/* {"==>"} {obj.userName}{" "} */}
                        {"◾"} {capitalizeFirstLetter(obj.userName)}{" "}
                        {addIsTyping ? "(is typing..)" : ""}
                      </h5>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
