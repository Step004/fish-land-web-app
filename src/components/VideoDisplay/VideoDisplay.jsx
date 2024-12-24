import css from "./VideoDisplay.module.css";

const VideoDisplay = ({ webcamVideoRef, remoteVideoRef }) => {

  return (
    <div className={css.videoCont}>
      <video
        ref={webcamVideoRef}
        controls={false}
        autoPlay
        muted
        playsInline
        className={css.video}
      />

      <div className={css.friendVideoCont}>
        <video
          ref={remoteVideoRef}
          controls={false}
          autoPlay
          playsInline
          className={css.friendVideo}
        />
      </div>
    </div>
  );
};

export default VideoDisplay;
