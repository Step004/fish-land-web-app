// import { createRoom } from "@/utils/createRoom";

interface Props {
  roomId: string;
  handleCreateRoom: () => void;
  onChangeRoomId: (value: string) => void;
  handleJoinRoom: () => void;
}

export const ControlsGroup: React.FC<Props> = ({
  roomId,
  handleCreateRoom,
  onChangeRoomId,
  handleJoinRoom,
}) => {
  return (
    <div className="flex gap-5 items-end mb-5">
      <button
        className="font-main text-white  max-h-[52px] rounded-lg font-bold py-[14px] px-[20px] bg-primary btn_green_hover"
        onClick={() => handleCreateRoom()}
      >
        Create room
      </button>
      <div className="flex flex-col truncate">
        <p className="ml-[2px] text-[12px] text-themetext font-semibold truncate">
          Enter call ID to join:
        </p>
        <input
          value={roomId}
          onChange={(e) => onChangeRoomId(e.target.value)}
          placeholder="Enter Call ID"
          className="input_text h-[43px] text-secondary w-full bg-white border border-light-gray"
        />
      </div>

      <button
        onClick={handleJoinRoom}
        disabled={!roomId}
        className={`max-h-[52px] font-bold text-white rounded-lg shadow py-[14px] px-[20px] ${roomId ? 'bg-primary btn_green_hover' : 'bg-dark-gray cursor-not-allowed'}`}
      >
        Join
      </button>
    </div>
  );
};
