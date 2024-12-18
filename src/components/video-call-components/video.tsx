import React, { useEffect, useRef } from "react"

interface Props {
  remoteVideo: MediaStream;
}

export const VideoForOne: React.FC<Props> = ({ remoteVideo }) => {
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    remoteVideoRef.current!.srcObject = remoteVideo;
  }, []);

  return (
    <div className="items-center bg-gray-800 p-1 rounded-2xl ">
    <video
      ref={remoteVideoRef}
      controls={false}
      autoPlay
      muted
      playsInline
      className="lg:w-[300px] lg:h-[180px] rounded-2xl object-cover"
    />
    <p className="absolute bottom-4 left-4 py-2 px-6 text-center text-white text-[20px] font-semibold bg-neutral2 bg-opacity-50 rounded-full">
      Cassie Jung
    </p>
  </div>
  )
}