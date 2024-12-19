import { useRef, useEffect, useState } from "react";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { firestore } from "../../firebase/firebase/firebase.js";
import VideoDisplay from "../VideoDisplay/VideoDisplay.js";

import { servers } from "../../utils/servers.js";
import { deleteCallById } from "../../firebase/firebase/calls.js";
import { FaMicrophone, FaCamera } from "react-icons/fa";
import css from "./VideoCall.module.css";

const VideoCall = ({ link, close, join }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callId, setCallId] = useState(link);
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const pc = useRef(
    typeof window !== "undefined" ? new RTCPeerConnection(servers) : null
  );
  const [isJoinCall, setIsJoinCall] = useState(false);

  const webcamVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const startWebcam = async () => {
    if (typeof window === "undefined") return;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const remoteStream = new MediaStream();
    stream.getTracks().forEach((track) => pc.current.addTrack(track, stream));
    pc.current.ontrack = (event) => {
      event.streams[0]
        .getTracks()
        .forEach((track) => remoteStream.addTrack(track));
    };
    setLocalStream(stream);
    setRemoteStream(remoteStream);
    if (webcamVideoRef.current) webcamVideoRef.current.srcObject = stream;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
  };

  const createCall = async () => {
    await startWebcam();
    setIsCalling(true);

    const callDoc = doc(firestore, "calls", callId);
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    pc.current.onicecandidate = (event) => {
      if (event.candidate)
        setDoc(doc(offerCandidates), event.candidate.toJSON());
    };

    const offerDescription = await pc.current.createOffer();
    await pc.current.setLocalDescription(offerDescription);
    await setDoc(callDoc, { offer: offerDescription });

    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (pc.current && !pc.current.currentRemoteDescription && data?.answer) {
        pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.current.addIceCandidate(candidate);
        }
      });
    });
  };

  const answerCall = async () => {
    await startWebcam();
    setIsCalling(true);

    const callDoc = doc(firestore, "calls", callId);
    const answerCandidates = collection(callDoc, "answerCandidates");
    const offerCandidates = collection(callDoc, "offerCandidates");

    pc.current.onicecandidate = (event) => {
      if (event.candidate)
        setDoc(doc(answerCandidates), event.candidate.toJSON());
    };

    pc.current.onconnectionstatechange = () => {
      if (pc.current.connectionState === "disconnected") {
        handleEndCall();
      }
    };

    const callData = (await getDoc(callDoc)).data();
    const offerDescription = callData?.offer;
    await pc.current.setRemoteDescription(
      new RTCSessionDescription(offerDescription)
    );

    const answerDescription = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answerDescription);
    await setDoc(callDoc, { answer: answerDescription });

    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.current.addIceCandidate(candidate);
        }
      });
    });
  };

  const handleMute = () => {
    setIsMuted((prev) => {
      const newMuteState = !prev;
      localStream?.getAudioTracks().forEach((track) => {
        track.enabled = !newMuteState;
      });
      return newMuteState;
    });
  };

  const handleEndCall = async () => {
    const stopAndRemoveTracks = (stream) => {
      stream.getTracks().forEach((track) => {
        track.stop();
        stream.removeTrack(track);
      });
    };

    if (localStream) {
      stopAndRemoveTracks(localStream);
      setLocalStream(null);
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = null;
      }
    }

    if (remoteStream) {
      stopAndRemoveTracks(remoteStream);
      setRemoteStream(null);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    }

    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }

    setIsCalling(false);
    await deleteCallById(callId);
    setCallId("");
  };

  const handleVideoToggle = async () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        const track = videoTracks[0];
        const isEnabled = track.enabled;
        track.enabled = !isEnabled;
      } else {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const newVideoTrack = newStream.getVideoTracks()[0];
        localStream.addTrack(newVideoTrack);
      }
    }
  };

  useEffect(() => {
    let unsubscribe = () => {};

    if (callId) {
      const callDocRef = doc(firestore, "calls", callId);
      unsubscribe = onSnapshot(callDocRef, () => {});
    }

    return unsubscribe;
  }, [callId]);

  const handleAnswering = () => {
    if (setIsJoinCall) {
      setIsJoinCall(false);
    }
    answerCall();
  };

  return (
    <div>
      <VideoDisplay
        webcamVideoRef={webcamVideoRef}
        remoteVideoRef={remoteVideoRef}
      />

      <div className={css.controlButtons}>
        <div className={css.buttons}>
          <button className={css.button} onClick={handleMute}>
            <FaMicrophone className={css.icon} />
          </button>
          <button
            className={css.button}
            onClick={isCalling ? handleVideoToggle : undefined}
            disabled={!isCalling}
          >
            <FaCamera className={css.icon} />
          </button>
        </div>
        {!join && (
          <>
            <button className={css.button} onClick={createCall}>
              Start Call
            </button>
            <button
              className={css.button}
              disabled={!isCalling}
              onClick={() => {
                handleEndCall();
                close();
              }}
            >
              End Call
            </button>
          </>
        )}
        {!isCalling && (
          <button className={css.button} onClick={handleAnswering}>
            Join
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
