import React from 'react';
import cn from 'classnames';

interface Props {
  callId: string;
  onAnswerCall: () => void;
  onChangeCallId: (value: string) => void;
  onChangeIsJoin?: (value: boolean) => void;
  onChangeIsCalling: (value: boolean) => void;
}

export const JoinCallLayout: React.FC<Props> = ({
  callId,
  onChangeCallId,
  onAnswerCall,
  onChangeIsCalling,
  onChangeIsJoin,
}) => {
  const handleAnswering = () => {
    onChangeIsCalling(true);

    if (onChangeIsJoin) {
      onChangeIsJoin(false);
    }
    onAnswerCall();
  };

  return (
    <div className="flex space-x-2 items-end">
      <div className='flex flex-col'>
        <p className='ml-[2px] text-[12px] text-themetext font-semibold'>Enter call ID to join:</p>
        <input
          value={callId}
          onChange={(e) => onChangeCallId(e.target.value)}
          placeholder="Enter Call ID"
          className="input_text h-[43px] text-secondary w-full bg-white border border-light-gray"
        />
      </div>

      <button
        onClick={handleAnswering}
        disabled={!callId}
        className={`max-h-[52px] font-bold text-white rounded-lg shadow py-[14px] px-[20px] right-4 ${callId ? 'bg-primary btn_green_hover' : 'bg-gray-400 cursor-not-allowed'}`}
      >
        ENTER
      </button>
    </div>
  );
};
