import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { copyText } from '@/utils/copyText';
import copy from '@/assets/icons/copy.svg';

interface Props {
  callId: string;
}

export const CopyTextComponent: React.FC<Props> = ({ callId }) => {
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (showNotification) {
      timer = setTimeout(() => {
        setShowNotification(false);
      }, 2000);
    }

    return () => clearTimeout(timer);
  }, [showNotification]);

  return (
    <div className="relative flex flex-col">
      <p className="ml-[2px] text-[12px] text-themetext font-semibold">
        ID to join your call:
      </p>
      <input
        type="text"
        readOnly
        value={callId}
        placeholder="Enter Call ID"
        className="input_text h-[43px] text-secondary max-w-[150px] pr-[40px] bg-white border border-light-gray"
      />
      {showNotification && <p className="text-success text-[12px] absolute bottom-[-18px]">Copied!</p>}

      <button
        onClick={() => copyText(callId, setShowNotification)}
        className="absolute p-2 rounded right-0 top-[23px]"
      >
        <Image src={copy} alt="copy text" width={20} />
      </button>
    </div>
  );
};
