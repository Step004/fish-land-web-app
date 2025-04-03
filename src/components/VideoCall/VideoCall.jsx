import { useRef, useEffect, useState } from "react";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase/firebase/firebase.js";
import VideoDisplay from "../VideoDisplay/VideoDisplay.jsx";

import { servers } from "../../utils/servers.js";
import { deleteCallById, endCall } from "../../firebase/firebase/calls.js";
import { FaMicrophone, FaCamera } from "react-icons/fa";
import { FaMicrophoneSlash } from "react-icons/fa6";

import css from "./VideoCall.module.css";
import { sendMessage } from "../../firebase/firebase/chats.js";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";
import { i18n } from "../../utils/i18n";

const VideoCall = ({ chatId, link, close }) => {
  const { currentUser } = useAuth();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callId, setCallId] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const pc = useRef(
    typeof window !== "undefined" ? new RTCPeerConnection(servers) : null
  );
  const webcamVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const startWebcam = async () => {
    if (typeof window === "undefined") return;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    const remoteStream = new MediaStream();

    stream.getTracks().forEach((track) => {
      pc.current.addTrack(track, stream);
    });
    // Прив'язка віддаленого потоку до відео
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.onloadedmetadata = () => {
        remoteVideoRef.current.play();
      };
    }

    pc.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        if (track.kind === "audio" || track.kind === "video") {
          remoteStream.addTrack(track);
        }
      });
    };

    setLocalStream(stream);
    setRemoteStream(remoteStream);

    if (webcamVideoRef.current) {
      webcamVideoRef.current.srcObject = stream;
      webcamVideoRef.current.muted = true; // Уникаємо дублювання звуку
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  };
  const createCall = async () => {
    await startWebcam();
    setIsCalling(true);

    const callDoc = doc(collection(firestore, "calls"));
    const callId = callDoc.id;

    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");
    setCallId(callId);
    const callMessage = `Link:${callId}`;

    try {
      await sendMessage(
        chatId,
        currentUser.displayName,
        currentUser.photoURL,
        currentUser.uid,
        callMessage
      );
    } catch (error) {
      console.error("Failed to send message:", error);
    }

    pc.current.onicecandidate = (event) => {
      setDoc(doc(offerCandidates), event.candidate.toJSON());
    };

    const offerDescription = await pc.current.createOffer();
    await pc.current.setLocalDescription(offerDescription);
    await setDoc(callDoc, {
      offer: offerDescription,
      status: "active",
    });
    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (pc.current && data?.answer) {
        pc.current
          .setRemoteDescription(new RTCSessionDescription(data.answer))
          .catch((error) =>
            console.error("Error setting remote description:", error)
          );
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

  const answerCall = async (callId) => {
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
    await updateDoc(callDoc, { answer: answerDescription });

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
  const signalTrackStateChange = async (isEnabled) => {
    const callDoc = doc(firestore, "calls", callId);
    await setDoc(callDoc, { videoEnabled: isEnabled }, { merge: true });
  };

  const signalNewTrack = async (track) => {
    const callDoc = doc(firestore, "calls", callId);

    const newTrackInfo = {
      trackId: track.id,
      trackKind: track.kind,
      trackLabel: track.label,
    };
    await setDoc(callDoc, { newTrack: newTrackInfo }, { merge: true });
  };
  const handleVideoToggle = async () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        const track = videoTracks[0];
        const isEnabled = track.enabled;
        track.enabled = !isEnabled;
        await signalTrackStateChange(!isEnabled);

        if (!isEnabled) {
          await signalNewTrack(track);
        }
      } else {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const newVideoTrack = newStream.getVideoTracks()[0];
        localStream.addTrack(newVideoTrack);
        signalNewTrack(newVideoTrack);
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

  return (
    <div>
      <VideoDisplay
        webcamVideoRef={webcamVideoRef}
        remoteVideoRef={remoteVideoRef}
      />

      <div className={css.controlButtons}>
        <div className={css.buttons}>
          <button className={css.button} onClick={handleMute}>
            {!isMuted ? (
              <FaMicrophone className={css.icon} />
            ) : (
              <FaMicrophoneSlash className={css.icon} />
            )}
          </button>
          <button
            className={css.button}
            onClick={isCalling ? handleVideoToggle : undefined}
            disabled={!isCalling}
          >
            <FaCamera className={css.icon} />
          </button>
        </div>
        {!link && (
          <button
            className={css.button}
            disabled={isCalling}
            onClick={createCall}
          >
            {i18n.t("videoCall.buttons.startCall")}
          </button>
        )}

        <button
          className={css.button}
          disabled={!isCalling}
          onClick={() => {
            handleEndCall();
            close();
            endCall(callId);
          }}
        >
          {i18n.t("videoCall.buttons.endCall")}
        </button>
        {link && (
          <>
            <button
              className={css.button}
              onClick={() => {
                answerCall(link);
              }}
            >
              {i18n.t("videoCall.buttons.join")}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
