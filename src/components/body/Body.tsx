import Chat from "../chat/Chat";
import Upload from "../upload/Upload";
import { createContext, useState } from "react";

export const SessionContext = createContext<any>(null);

export default function Body() {
  // these states are shared between the upload files component and the chat component
  const [disableChat, setDisableChat] = useState(true); // state to disable chat when file have not been submitted and or session has expired
  const [disableUpload, setDisableUpload] = useState(false); // state to disable upload when file has been submitted and or session is still valid
  const [chats, setChats] = useState<any[]>([]);
  const [responseLoading, setResponseLoading] = useState(false);
  const [files, setFiles] = useState<any>([]);

  return (
    <SessionContext.Provider
      value={{
        disableChat,
        setDisableChat,
        disableUpload,
        setDisableUpload,
        chats,
        setChats,
        responseLoading,
        setResponseLoading,
        files,
        setFiles,
      }}
    >
      <div className="flex flex-col items-center h-screen">
        <Upload />
        <Chat />
      </div>
    </SessionContext.Provider>
  );
}
