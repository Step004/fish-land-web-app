import Image from 'next/image';
import addFile from '@/assets/icons/add_file.svg';
import sendMessageIcon from '@/assets/icons/send_message.svg';
import { useState, useRef, useEffect } from 'react';
import { auth, firestore } from '@/firebase/config';
import {
  collection,
  query as fbQuery,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import ChatMessage from './ChatMessage';
import { useAuth } from '@/firebase/context/authContext';

const ChatSection = ({ chatId, isCalling }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messagesRef, setMessagesRef] = useState(null);
  const [messagesQuery, setMessagesQuery] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (chatId) {
      setMessagesRef(
        collection(firestore, 'callChat', String(chatId), 'messages')
      );
    } else {
      setMessagesRef(null);
    }
  }, [chatId]);
  useEffect(() => {
    if (messagesRef) {
      setMessagesQuery(
        fbQuery(messagesRef, orderBy('createdAt', 'asc'), limit(25))
      );
    } else {
      setMessagesQuery(null);
    }
  }, [messagesRef]);
  const chatRef = useRef<HTMLDivElement>(null);

  const [messages] = useCollectionData(messagesQuery, { idField: 'id' });
  const [formValue, setFormValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileInfo(
        `File name: ${file.name}, type: ${file.type}, size: ${file.size} bytes`
      );
    }
  };

  const handleFileClick = () => {
    fileInputRef.current!.click();
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const { uid, displayName, photoURL } = currentUser;

    if (selectedFile) {
      console.log('Handle file upload here');
    }

    if (formValue.trim()) {
      await addDoc(messagesRef, {
        text: formValue,
        createdAt: serverTimestamp(),
        photoURL: currentUser.photoURL,
        senderId: currentUser.uid,
        senderName: currentUser.displayName
          ? currentUser.displayName
          : currentUser.email.split('@')[0],
      });
    }

    setFormValue('');
    setSelectedFile(null);
    setFileInfo('');
  };

  useEffect(() => {
    if (chatRef.current && messages && messages.length) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);
  return (
    <div className="flex flex-col justify-end bg-background-second p-3 rounded-2xl">
      <div ref={chatRef} className="flex flex-col overflow-y-auto space-y-2 ">
        {messages &&
          messages.map((msg, index) => (
            <ChatMessage key={msg.id || index} message={msg} />
          ))}
      </div>
      <form
        onSubmit={(e) => sendMessage(e)}
        className="flex items-center space-x-2 relative w-full mt-3"
      >
        <button
          type="button"
          onClick={handleFileClick}
          className="absolute left-5 transform hover:scale-90 transition-transform duration-300"
        >
          <Image src={addFile} alt="Add File" width={24} />
        </button>
        <input
          type="file"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        <input
          className="flex-grow py-2 pl-[46px] rounded-xl pr-[50px] max-w-[288px] input_text text-black bg-neutral3"
          placeholder="Type something nice"
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          disabled={isCalling == ''}
        />
        <button
          type="submit"
          className="absolute rounded-full right-2 btn_green_hover"
          disabled={isCalling == ''}
        >
          <Image src={sendMessageIcon} alt="Send Message" width={40} />
        </button>
      </form>
      {fileInfo && <p className="text-white text-sm">{fileInfo}</p>}
    </div>
  );
};

export default ChatSection;
