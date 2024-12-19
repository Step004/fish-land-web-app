import React from "react";
import css from "./VideoDisplay.module.css";

type VideoDisplayProps = {
  webcamVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
};

const VideoDisplay: React.FC<VideoDisplayProps> = ({
  webcamVideoRef,
  remoteVideoRef,
}) => {
  const handleFullScreen = () => {
    const videoContainer = document.getElementById("video-container");
    if (videoContainer) {
      if (!document.fullscreenElement) {
        videoContainer.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className={css.videoCont}>
      <video
        ref={webcamVideoRef}
        controls={false}
        autoPlay
        playsInline
        className={css.video}
      />

      <div className={css.friendVideoCont}>
        <video
          ref={remoteVideoRef}
          controls={false}
          autoPlay
          muted
          playsInline
          className={css.friendVideo}
        />
      </div>
    </div>
  );
};

export default VideoDisplay;
