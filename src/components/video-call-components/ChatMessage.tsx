import { useAuth } from '@/firebase/context/authContext';
import { IMessage } from '@/types/messages';
import Image from 'next/image';

interface Props {
  message: IMessage;
}

const ChatMessage: React.FC<Props> = ({ message }) => {
  const { currentUser } = useAuth();

  const { text, senderId, photo, senderName } = message;
  const isSent = senderId === currentUser.uid;
  const textAlignClass = isSent ? 'text-right' : 'text-left';

  return (
    <div
      className={`flex gap-1 shadow-md items-center bg-opacity-gray p-2 rounded-lg my-1 mx-3 max-w-xs md:max-w-md lg:max-w-lg ${isSent ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
    >
      <div className='rounded-full w-10 h-10 object-cover'>
        {photo ? (
          <Image
            src={photo}
            width={42}
            height={42}
            alt="avatar"
            className="w-full h-full rounded-full"
          />
        ) : (
          <div
            className={
              'bg-[rgb(212,0,255)] rounded-full min-w-[40px] min-h-[40px] text-2xl flex justify-center items-center'
            }
          >
            {senderName && senderName[0]}
          </div>
        )}
      </div>
      <div>
        <p
          className={`flex-1 text-sm text-themetext ${textAlignClass} max-w-[170px] break-words mx-2`}
        >
          {text}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
