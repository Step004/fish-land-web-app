import React from 'react';

interface CallButtonProps {
  isCalling: boolean;
  handleCall: () => void;
}

const CallButton: React.FC<CallButtonProps> = ({ isCalling, handleCall }) => {
  return (
    <button
      className={`font-bold text-white rounded-lg shadow py-[14px] px-[20px]  ${isCalling ? 'bg-red-500 hover:bg-red-700' : 'bg-primary btn_green_hover'}`}
      onClick={handleCall}
    >
      {isCalling ? 'End Call' : 'Start Call'}
    </button>
  );
};

export default CallButton;
