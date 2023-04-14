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
  const [responseLoading, setResponseLoading] = useState(false);

  // const [chats, setChats] = useState([
  //   { sender: "user", message: "When did I spend the most?" },
  //   {
  //     sender: "AI",
  //     message:
  //       "According to your document, you spent the most on 4th April with an amount of GHC 5000",
  //   },
  //   { sender: "user", message: "How much did I spend on 16 March." },
  //   { sender: "AI", message: "On 16th March you spent nothing." },
  //   { sender: "user", message: "Can you summarize my statement for me?" },
  // ]);

  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  function clearChat() {
    // setChats([]);
    localStorage.clear();
    setDisableChat(true);
    setDisableUpload(false);
    setFiles([]);
    setChats((prevChats: any) => [
      ...prevChats,
      {
        sender: "AI",
        message: "Context has been cleared",
      },
    ]);
    // window.location.reload();
  }

  function reset() {
    setChats([]);
    localStorage.clear();
    setDisableChat(true);
    setDisableUpload(false);
    setFiles([]);
    // setChats((prevChats: any) => [
    //   ...prevChats,
    //   {
    //     sender: "AI",
    //     message: "Context has been cleared",
    //   },
    // ]);
    window.location.reload();
  }

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
    // console.log("Dropped!!!!");
    setDragActive(false);
    if (files.length < 1) {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        // handleFiles(e.dataTransfer.files);
        // console.log(e.dataTransfer.files);
        for (let i = 0; i < e.dataTransfer.files["length"]; i++) {
          setFiles((prevState: any) => [...prevState, e.dataTransfer.files[i]]);
        }
      }
    }
  }

  const handleChange = function (e: any) {
    e.preventDefault();
    // console.log("File has been added");
    if (files.length < 1) {
      if (e.target.files && e.target.files[0]) {
        // handleFiles(e.target.files);
        // console.log(e.target.files);
        for (let i = 0; i < e.target.files["length"]; i++) {
          setFiles((prevState: any) => [...prevState, e.target.files[i]]);
        }
      }
    }
  };

  function removeFile(fileName: any, idx: any) {
    // console.log("this is the old arr", files);
    const newArr = [...files];
    newArr.splice(idx, 1);
    setFiles([]);
    setFiles(newArr);
  }

  function handleSubmitFile(e: any) {
    if (files.length === 0) {
      setUploadError("No file has been selected");
      return;
    }
    setChats((prevChats: any) => [
      ...prevChats,
      {
        sender: "AI",
        message: "Reading your document...",
      },
    ]);
    setDisableUpload(true);

    let data = new FormData();
    data.append("fileLength", files.length);

    for (let i = 0; i < files.length; i++) {
      data.append("file" + i.toString(), files[i]);
    }

    const splitLastFileName = files[files.length - 1].name.split(".");
    const lastFileExtension = splitLastFileName[splitLastFileName.length - 1];

    // console.log(`Bearer ${process.env.REACT_APP_BEARER_TOKEN}`);

    axios
      .post(" http://127.0.0.1:5000/api/addContext", data, {
        // .post(" https://1nnocent.pythonanywhere.com/api/addContext", data, {
        // withCredentials: true,
        headers: {
          // "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${process.env.REACT_APP_BEARER_TOKEN}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        // console.log(res);
        localStorage.setItem("indexKey", res.data);
        localStorage.setItem("fileType", lastFileExtension);
        setFiles([]);
        setDisableChat(false);
        setTimeout(clearChat, 300000);
        // setTimeout(clearChat, 5000);
        setChats((prevChats: any) => [
          ...prevChats,
          {
            sender: "AI",
            message:
              "Context has been uploaded. Ask away!! NB: Session will expire after 5 mins.",
          },
        ]);
      })
      .catch((err) => {
        // console.log(err);
        setDisableUpload(false);
        setChats((prevChats: any) => [
          ...prevChats,
          {
            sender: "AI",
            message:
              "Sorry something went wrong. Try again later or restart context",
          },
        ]);
      });
  }

  function handleSend() {
    // localStorage.setItem("indexKey", "3580a917-c353-11ed-9225-20c19bff2da4");
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
      setChats((prevChats: any) => [
        ...prevChats,
        { sender: "user", message: userMessage },
      ]);
      setUserMessage("");
      setResponseLoading(true);
      let indexKey: any = localStorage.getItem("indexKey");
      let fileType: any = localStorage.getItem("fileType");
      let prompt = userMessage;
      let data = new FormData();
      data.append("prompt", prompt);
      data.append("indexKey", indexKey);
      data.append("fileType", fileType);
      // console.log(data);
      axios
        .post(" http://127.0.0.1:5000/api/getResponse", data, {
          // .post(" https://1nnocent.pythonanywhere.com/api/getResponse", data, {
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
          ]);
          // console.log(res);
          // console.log(res.data);
        })
        .catch((err) => {
          setResponseLoading(false);
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

  // triggers the input when the button is clicked
  const onButtonClick = () => {
    inputRef.current.value = "";
    inputRef.current.click();
  };
  return (
    <div className="flex flex-col items-center h-screen">
      <form
        className={`border border-[#0c8ce9] p-3 md:w-[60%] lg:w-[60%] w-[100%] h-auto bg-[#eff5f9] mt-6 text-center rounded-lg ${
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
          // multiple={true}
          max={1}
          onChange={handleChange}
          // accept=".xlsx,.xls,image/*,.doc, .docx,.ppt, .pptx,.txt, .pdf, .csv"
          accept=".doc, .docx, .txt, .pdf, .csv"
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
            <p className="text-[#c6392b]">(.pdf, .docx, .txt, .csv)</p>
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
          } rounded-lg p-2 mt-3`}
          onClick={handleSubmitFile}
          disabled={disableUpload}
        >
          <span className="p-2 text-white">Submit</span>
        </button>
        {uploadError && <p>{uploadError}</p>}
        <div className="flex flex-col items-center">
          {files.map((file: any, idx: any) => (
            <div key={idx} className="flex flex-row space-x-5">
              <span>{file.name}</span>
              <span
                className="text-red-500"
                onClick={() => removeFile(file.name, idx)}
              >
                remove
              </span>
            </div>
          ))}
        </div>
      </form>
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
    </div>
  );
}
