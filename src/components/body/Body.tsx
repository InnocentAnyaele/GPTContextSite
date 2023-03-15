import { useState, useRef, useEffect } from "react";
import DocumentSVG from "../../img/document.svg";
import RefreshImg from "../../img/RefreshSVG.svg";
import axios from "axios";

export default function Body() {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const inputRef = useRef<any>(null);
  const chatRef = useRef<any>(null);
  const [files, setFiles] = useState<any>([]);
  const [uploadError, setUploadError] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [disableChat, setDisableChat] = useState(true);
  const [disableUpload, setDisableUpload] = useState(false);

  const [chats, setChats] = useState([
    { sender: "user", message: "When did I spend the most?" },
    {
      sender: "AI",
      message:
        "According to your document, you spent the most on 4th April with an amount of GHC 5000",
    },
    { sender: "user", message: "How much did I spend on 16 March." },
    { sender: "AI", message: "On 16th March you spent nothing." },
    { sender: "user", message: "Can you summarize my statement for me?" },
  ]);

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  function handleDragOver(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragEnter(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragLeave(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function handleDrop(e: any) {
    e.preventDefault();
    e.stopPropagation();
    console.log("Dropped!!!!");
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // handleFiles(e.dataTransfer.files);
      console.log(e.dataTransfer.files);
      for (let i = 0; i < e.dataTransfer.files["length"]; i++) {
        setFiles((prevState: any) => [...prevState, e.dataTransfer.files[i]]);
      }
    }
  }

  // triggers when file is selected with click
  const handleChange = function (e: any) {
    e.preventDefault();
    console.log("File has been added");
    if (e.target.files && e.target.files[0]) {
      // handleFiles(e.target.files);
      console.log(e.target.files);
      for (let i = 0; i < e.target.files["length"]; i++) {
        setFiles((prevState: any) => [...prevState, e.target.files[i]]);
      }
    }
  };

  function removeFile(fileName: any) {
    setFiles((current: any) =>
      current.filter((file: any) => file.name !== fileName)
    );
  }

  function handleSubmitFile(e: any) {
    if (files.length === 0) {
      setUploadError("No file has been selected");
      return;
    }
  }

  function handleSend() {
    if (userMessage) {
      setChats((prevChats: any) => [
        ...prevChats,
        { sender: "user", message: userMessage },
      ]);
      setUserMessage("");
    }
  }

  function clearChat() {
    setChats([]);
    localStorage.clear();
    setDisableChat(true);
    setDisableUpload(false);
  }

  // triggers the input when the button is clicked
  const onButtonClick = () => {
    inputRef.current.click();
  };
  return (
    <div className="flex flex-col items-center h-screen">
      <form
        className={`border border-[#0c8ce9] p-3 w-[60%] h-auto bg-[#eff5f9] mt-6 text-center rounded-lg ${
          dragActive ? "border-2" : ""
        }`}
        onDragEnter={handleDragEnter}
        onSubmit={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
      >
        <input
          className="hidden"
          ref={inputRef}
          type="file"
          multiple={true}
          onChange={handleChange}
          accept=".xlsx,.xls,image/*,.doc, .docx,.ppt, .pptx,.txt,.pdf"
        />
        <label>
          <div className="flex justify-center items-center m-2">
            <img alt="documentSVG" src={DocumentSVG} className="h-10 w-10" />
          </div>
          <span className="text-[16px]">
            Drag & Drop or{" "}
            <span className="font-bold text-[#3038b0]" onClick={onButtonClick}>
              Choose file
            </span>{" "}
            to upload
          </span>
        </label>
        {/* {dragActive && (
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            ></div>
          )} */}
        <br></br>
        <button
          className={`${
            disableUpload ? "bg-[#bababa]" : "bg-black"
          } bg-black rounded-lg p-2 mt-3`}
          onClick={handleSubmitFile}
          disabled={disableUpload}
        >
          <span className="p-2 text-white">Submit files</span>
        </button>
        {uploadError && <p>{uploadError}</p>}
        <div className="flex flex-col items-center">
          {files.map((file: any, idx: any) => (
            <div key={idx} className="flex flex-row space-x-5">
              <span>{file.name}</span>
              <span
                className="text-red-500"
                onClick={() => removeFile(file.name)}
              >
                remove
              </span>
            </div>
          ))}
        </div>
      </form>
      <div className="flex flex-col w-[60%] h-[100vh]">
        <div className="overflow-y-auto h-full">
          <div className="rounded-lg mt-3 w-full h-full p-4 border border-[#ebebeb] flex flex-col justify-end">
            {chats.length > 0 ? (
              <div className="flex flex-col">
                <div className="flex flex-col space-y-4">
                  {chats.map((chat: any, idx: any) => (
                    <div
                      key={idx}
                      ref={chatRef}
                      className={`${
                        chat.sender === "user"
                          ? "bg-[#2460ba] ml-auto"
                          : "bg-[#ebebeb]"
                      } p-2 w-[50%] rounded-lg`}
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
              </div>
            ) : (
              // </div>
              <div className="flex justify-center mt-[10%]">
                <span className="text-[#bababa]">No chats yet</span>
              </div>
            )}
          </div>
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
            <button onClick={clearChat}>
              <img alt="refresh-logo" src={RefreshImg} className="w-4 h-4" />
            </button>
            <span className="text-[#949494]">Context will clear in 05:00 </span>
          </div>
          <button
            className={`${
              disableChat ? "bg-[#bababa]" : "bg-[#2460ba]"
            }  p-2 rounded-md h-10 w-28`}
            onClick={handleSend}
            disabled={disableChat}
          >
            <span className="text-white">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}