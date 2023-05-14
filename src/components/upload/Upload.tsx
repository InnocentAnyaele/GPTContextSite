import { useState, useRef, useContext } from "react";
import DocumentSVG from "../../img/document.svg";
import axios from "axios";
import { SessionContext } from "../body/Body";
import { api } from "../../utils/api";

export default function Upload() {
  const {
    setDisableChat,
    disableUpload,
    setDisableUpload,
    setChats,
    files,
    setFiles,
  } = useContext(SessionContext);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const inputRef = useRef<any>(null);
  const [uploadError, setUploadError] = useState("");
  //   const [disableChat, setDisableChat] = useState(true);
  //   const [disableUpload, setDisableUpload] = useState(false);

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

  // Function to clear chat
  function clearChat() {
    // setChats([]);
    localStorage.clear();
    setDisableChat(true);
    setDisableUpload(false);

    setFiles([]);
    setChats((prevChats: any) => [
      ...prevChats,
      {
        sender: "system",
        message: "Context has been cleared",
      },
      ]);
    // window.location.reload();
  }

  // Function to handle drag over event
  function handleDragOver(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  // Function to handle drag enter event
  function handleDragEnter(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  // Function to handle drag leave event
  function handleDragLeave(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  // Function to handle drag drop event
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

  // Function to track files selected
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

  // Function to remove file from list
  function removeFile(fileName: any, idx: any) {
    // console.log("this is the old arr", files);
    const newArr = [...files];
    newArr.splice(idx, 1);
    setFiles([]);
    setFiles(newArr);
  }

  // Function to track files selected
  function handleSubmitFile(e: any) {
    if (files.length === 0) {
      setUploadError("No file has been selected");
      return;
    }
    setChats((prevChats: any) => [
      ...prevChats,
      {
        sender: "system",
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
      .post(`${api}/api/addContext`, data, {
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
        localStorage.setItem("fileName", files[files.length - 1].name);
        setFiles([]);
        setDisableChat(false);
        setTimeout(clearChat, 300000);
        // setTimeout(clearChat, 5000);
        setChats((prevChats: any) => [
          ...prevChats,
          {
            sender: "system",
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
            sender: "system",
            message:
              "Sorry something went wrong. Try again later or restart context",
          },
          ]);
      });
  }

  // triggers the input when the button is clicked
  const onButtonClick = () => {
    inputRef.current.value = "";
    inputRef.current.click();
  };
  return (
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
//        accept=".xlsx,.xls,.doc, .docx,.ppt, .pptx,.txt, .pdf, .csv"
         accept=".pdf"
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
          <p className="text-[#c6392b]">(accepts only pdf)</p>
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
    );
}
