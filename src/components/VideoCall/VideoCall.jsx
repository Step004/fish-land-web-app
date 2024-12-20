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
import { deleteCallById } from "../../firebase/firebase/calls.js";
import { FaMicrophone, FaCamera } from "react-icons/fa";
import { FaMicrophoneSlash } from "react-icons/fa6";

import css from "./VideoCall.module.css";
import { sendMessage } from "../../firebase/firebase/chats.js";
import { useAuth } from "../../firebase/contexts/authContexts/index.jsx";

const VideoCall = ({ link, close, join }) => {
  console.log(link);
  
  const { currentUser } = useAuth();
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
    console.log("createCall: ", callId);

    const callDoc = doc(firestore, "calls", callId);
    // console.log("Fetched call data:", callDoc);
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
      console.log("Firestore snapshot data:", data);
      if (pc.current && data?.answer) {
        pc.current
          .setRemoteDescription(new RTCSessionDescription(data.answer))
          .then(() => console.log("Remote description set successfully"))
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
  // const createCall = async () => {
  //   await startWebcam();
  //   setIsCalling(true);

  //   const callDoc = doc(collection(firestore, "calls")); // Генерується унікальний callId
  //   const callId = callDoc.id; // Зберігаємо callId
  //   setCallId(callId);

  //   const offerCandidates = collection(callDoc, "offerCandidates");
  //   const answerCandidates = collection(callDoc, "answerCandidates");

  //   pc.current.onicecandidate = (event) => {
  //     if (event.candidate)
  //       setDoc(doc(offerCandidates), event.candidate.toJSON());
  //   };

  //   const offerDescription = await pc.current.createOffer();
  //   await pc.current.setLocalDescription(offerDescription);

  //   // Зберігаємо offer у Firestore
  //   await setDoc(callDoc, { offer: offerDescription });

  //   // Надсилаємо посилання іншому користувачеві
  //   const callMessage = `Link:${callId}`;
  //   await sendMessage(
  //     callId,
  //     currentUser.displayName,
  //     currentUser.photoURL,
  //     currentUser.uid,
  //     callMessage
  //   );

  //   // Слухаємо зміни документа для answer
  //   onSnapshot(callDoc, (snapshot) => {
  //     const data = snapshot.data();
  //     if (pc.current && data?.answer) {
  //       pc.current
  //         .setRemoteDescription(new RTCSessionDescription(data.answer))
  //         .catch((error) =>
  //           console.error("Error setting remote description:", error)
  //         );
  //     }
  //   });

  //   // Слухаємо кандидатів answer
  //   onSnapshot(answerCandidates, (snapshot) => {
  //     snapshot.docChanges().forEach((change) => {
  //       if (change.type === "added") {
  //         const candidate = new RTCIceCandidate(change.doc.data());
  //         pc.current.addIceCandidate(candidate);
  //       }
  //     });
  //   });
  // };

  const answerCall = async () => {
    await startWebcam();
    setIsCalling(true);

    console.log("answerCall: ", callId);

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
    console.log("Fetched call data:", callData);
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
  // const answerCall = async () => {
  //   try {
  //     await startWebcam();
  //     setIsCalling(true);

  //     const callDoc = doc(firestore, "calls", callId);
  //     const answerCandidates = collection(callDoc, "answerCandidates");

  //     pc.current.onicecandidate = (event) => {
  //       if (event.candidate) {
  //         setDoc(doc(answerCandidates), event.candidate.toJSON());
  //       }
  //     };

  //     const callSnap = await getDoc(callDoc);
  //     if (!callSnap.exists()) {
  //       console.error(`Call document with ID ${callId} does not exist.`);
  //       return;
  //     }

  //     const callData = callSnap.data();
  //     const offerDescription = callData?.offer;
  //     if (
  //       !offerDescription ||
  //       !offerDescription.type ||
  //       !offerDescription.sdp
  //     ) {
  //       console.error(
  //         "Invalid or missing offer description:",
  //         offerDescription
  //       );
  //       return;
  //     }

  //     // Встановлюємо offer як remote description
  //     await pc.current.setRemoteDescription(
  //       new RTCSessionDescription(offerDescription)
  //     );

  //     // Створюємо answer
  //     const answerDescription = await pc.current.createAnswer();
  //     await pc.current.setLocalDescription(answerDescription);

  //     // Зберігаємо answer у Firestore
  //     await updateDoc(callDoc, { answer: answerDescription });
  //   } catch (error) {
  //     console.error("Error during answerCall:", error);
  //   }
  // };

  const handleMute = () => {
    // setIsMuted(true)
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
        // updateVideoSources(localStream);
      }
    }
  };


  // const handleVideoToggle = async () => {
  //   if (localStream) {
  //     const videoTracks = localStream.getVideoTracks();
  //     if (videoTracks.length > 0) {
  //       const track = videoTracks[0];
  //       const isEnabled = track.enabled;
  //       track.enabled = !isEnabled;
  //     } else {
  //       const newStream = await navigator.mediaDevices.getUserMedia({
  //         video: true,
  //       });
  //       const newVideoTrack = newStream.getVideoTracks()[0];
  //       localStream.addTrack(newVideoTrack);
  //     }
  //   }
  // };

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
        {/* {!isCalling && ( */}
        <input
          value={callId}
          onChange={(e) => setCallId(e.target.value)}
          placeholder="Enter Call ID"
          className="input_text h-[43px] text-secondary w-full bg-white border border-light-gray"
        />
        <button className={css.button} onClick={handleAnswering}>
          Join
        </button>
        {/* )} */}
      </div>
    </div>
  );
};

export default VideoCall;
