import { useContext, useState, useEffect, useRef } from "react";
import RefreshImg from "../../img/RefreshSVG.svg";
import { SessionContext } from "../body/Body";
import axios from "axios";

export default function Chat() {
  // Destructuring values from the SessionContext
  const {
    disableChat,
    setDisableChat,
    setDisableUpload,
    chats,
    setChats,
    responseLoading,
    setResponseLoading,
    setFiles,
  } = useContext(SessionContext);

  const [userMessage, setUserMessage] = useState("");

  const chatRef = useRef<any>(null);
  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  // resets the chat on timeout, disables chat and enables upload
  function reset() {
    setChats([]); // Clears chat messages
    localStorage.clear(); // Clears local storage
    setDisableChat(true); // Disables chat
    setDisableUpload(false); // Enables upload
    setFiles([]); // Clears uploaded files
    // setChats((prevChats: any) => [
    //   ...prevChats,
    //   {
    //     sender: "AI",
    //     message: "Context has been cleared",
    //   },
    // ]);
    window.location.reload();
  }

  function handleSend() {
    // localStorage.setItem("indexKey", "3580a917-c353-11ed-9225-20c19bff2da4");
    // Checks if indexKey is null, which indicates that chat context has expired
    if (localStorage.getItem("indexKey") === null) {
      setChats((prevChats: any) => [
        ...prevChats,
        {
          sender: "AI",
          message:
            "Chat context has expired after 5 mins. Clear context and upload new files.",
        },
      ]);
      return;
    }
    if (userMessage) {
      // Sends user's input message to the chat
      setChats((prevChats: any) => [
        ...prevChats,
        { sender: "user", message: userMessage },
      ]);
      setUserMessage("");
      setResponseLoading(true);
      let indexKey: any = localStorage.getItem("indexKey");
      let fileType: any = localStorage.getItem("fileType");
      let fileName: any = localStorage.getItem("fileName");
      let prompt = userMessage;
      let data = new FormData();
      data.append("prompt", prompt);
      data.append("indexKey", indexKey);
      data.append("fileType", fileType);
      data.append("fileName", fileName);
      // console.log(data);
      // Sends a POST request to the backend API to get response from the AI
      axios
        // .post(" http://127.0.0.1:5000/api/getResponse", data, {
        .post(" https://1nnocent.pythonanywhere.com/api/getResponse", data, {
          // withCredentials: true,
          headers: {
            // "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${process.env.REACT_APP_BEARER_TOKEN}`,
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          setResponseLoading(false);
          setChats((prevState: any) => [
            ...prevState,
            { sender: "AI", message: res.data },
          ]); // Appends AI's response to the chat
          // console.log(res);
          // console.log(res.data);
        })
        .catch((err) => {
          // Handles error response
          setResponseLoading(false); // Sets response loading state to false
          // alert("Something went wrong");
          // console.log(err);
          // console.log(err.response.data);
          // console.log(err.response.status);
          setChats((prevState: any) => [
            ...prevState,
            {
              sender: "AI",
              message:
                "Sorry something went wrong. Try again later or restart context",
            },
          ]);
        });
    }
  }

  return (
    <div className="flex flex-col md:w-[60%] lg:w-[60%] w-[100%]  h-[100vh]">
      <div className="rounded-lg mt-3 w-full h-full p-4 border border-[#ebebeb] flex flex-col justify-end overflow-y-auto">
        {/* <div className="rounded-lg mt-3 w-full h-full p-4 border border-[#ebebeb] flex flex-col justify-end "> */}
        {chats.length > 0 ? (
          <div className="flex flex-col overflow-y-auto">
            <div className="flex flex-col space-y-4">
              {chats.map((chat: any, idx: any) => (
                <div
                  key={idx}
                  ref={chatRef}
                  className={`${
                    chat.sender === "user"
                      ? "bg-[#2460ba] ml-auto"
                      : "bg-[#ebebeb] mr-auto"
                  } p-3 max-w-[70%] rounded-lg`}
                >
                  <span
                    className={`${
                      chat.sender === "user" ? "text-white" : "text-black"
                    } break-all`}
                  >
                    {chat.message}
                  </span>
                </div>
              ))}
            </div>
            {responseLoading && (
              <div className="text-center mt-3">
                <span className="text-[#bababa]">Loading response...</span>
              </div>
            )}
          </div>
        ) : (
          // </div>
          <div className="flex justify-center mt-[10%]">
            <span className="text-[#bababa]">No chats yet</span>
          </div>
        )}
        {/* </div> */}
      </div>

      <input
        className="w-full h-[10vh] mt-2 p-3 bg-[#f1f1f1] rounded-lg"
        placeholder="Ask me anything about your documents..."
        type="textarea"
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
      ></input>
      <div className="flex flex-row mt-2 justify-between">
        <div className="flex flex-row space-x-4 items-center">
          <button onClick={reset}>
            <img alt="refresh-logo" src={RefreshImg} className="w-4 h-4" />
          </button>
          <span className="text-[#949494] italic text-[12px]">
            Session will expire 5 minutes after creation <br></br>
            This is to control any high demand / no. of requests.
          </span>
        </div>
        <button
          className={`${
            disableChat ? "bg-[#bababa]" : "bg-[#2460ba]"
          }  p-2 rounded-md h-10 w-28`}
          onClick={handleSend}
          disabled={disableChat}
          // disabled={false}
        >
          <span className="text-white">Send</span>
        </button>
      </div>
    </div>
  );
}
