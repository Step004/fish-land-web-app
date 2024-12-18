import { useRef, useEffect, useState } from 'react';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { firestore } from '@/firebase/config';
import ChatSection from '@/components/video-call-components/ChatSection';
import Header from '@/components/video-call-components/Header';
import CallButton from '@/components/video-call-components/CallButton';
import Controls from '@/components/video-call-components/Controls';
import VideoDisplay from '@/components/video-call-components/VideoDisplay';
import useRecordTimer from '@/hooks/useRecordTimer';

import { servers } from '@/utils/servers';
import { JoinCallLayout } from '@/components/video-call-components/joinCallLayout';
import { CopyTextComponent } from '@/components/video-call-components/copyTextComponent';
import {
  deleteCollectionCallChatById,
  deleteCallById,
} from '../../firebase/chat.js';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/firebase/context/authContext.jsx';
const VideoCall = () => {
  const router = useRouter();
  const query = useSearchParams();
  const { currentUser } = useAuth();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callId, setCallId] = useState(query.get('callId'));
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const pc = useRef<RTCPeerConnection | null>(
    typeof window !== 'undefined' ? new RTCPeerConnection(servers) : null
  );
  const [isJoinCall, setIsJoinCall] = useState(false);
  const [record, setRecord] = useState(false);
  const { startTimer, stopTimer, formattedTimer } = useRecordTimer();

  const webcamVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isCalling) {
      stopTimer();
    }
  }, [isCalling]);

  const startWebcam = async () => {
    if (typeof window === 'undefined') return;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const remoteStream = new MediaStream();
    stream.getTracks().forEach((track) => pc.current!.addTrack(track, stream));
    pc.current!.ontrack = (event) => {
      event.streams[0]
        .getTracks()
        .forEach((track) => remoteStream.addTrack(track));
    };
    setLocalStream(stream);
    setRemoteStream(remoteStream);
    webcamVideoRef.current!.srcObject = stream;
    remoteVideoRef.current!.srcObject = remoteStream;
  };

  const createCall = async () => {
    await startWebcam();

    setIsCalling(true);

    const callDoc = doc(firestore, 'calls', callId);
    const offerCandidates = collection(callDoc, 'offerCandidates');
    const answerCandidates = collection(callDoc, 'answerCandidates');
    // setCallId(callDoc.id);

    pc.current!.onicecandidate = (event) => {
      if (event.candidate)
        setDoc(doc(offerCandidates), event.candidate.toJSON());
    };

    const offerDescription = await pc.current!.createOffer();
    await pc.current!.setLocalDescription(offerDescription);
    await setDoc(callDoc, { offer: offerDescription });

    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (pc.current && !pc.current.currentRemoteDescription && data?.answer) {
        pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.current!.addIceCandidate(candidate);
        }
      });
    });
  };

  const answerCall = async () => {
    await startWebcam();
    setIsCalling(true);

    const callDoc = doc(firestore, 'calls', callId);
    const answerCandidates = collection(callDoc, 'answerCandidates');
    const offerCandidates = collection(callDoc, 'offerCandidates');

    pc.current!.onicecandidate = (event) => {
      if (event.candidate)
        setDoc(doc(answerCandidates), event.candidate.toJSON());
    };

    pc.current!.onconnectionstatechange = () => {
      if (pc.current!.connectionState === 'disconnected') {
        handleEndCall();
      }
    };

    const callData = (await getDoc(callDoc)).data();
    const offerDescription = callData?.offer;
    await pc.current!.setRemoteDescription(
      new RTCSessionDescription(offerDescription)
    );

    const answerDescription = await pc.current!.createAnswer();
    await pc.current!.setLocalDescription(answerDescription);
    await setDoc(callDoc, { answer: answerDescription });

    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.current!.addIceCandidate(candidate);
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

  const timerDoc = doc(firestore, 'timers', 'sharedTimer');

  const handleRecord = () => {
    setRecord(!record);
    if (!record) {
      startTimer();
    } else {
      stopTimer();
    }
  };

  const handleEndCall = async () => {
    const stopAndRemoveTracks = (stream: MediaStream) => {
      stream.getTracks().forEach((track) => {
        if (track.enabled) {
          track.enabled = false;
          track.stop();
          stream.removeTrack(track);
        }
      });
    };
    const customAttributes = currentUser.reloadUserInfo?.customAttributes;

    if (customAttributes) {
      const attributes = JSON.parse(customAttributes);
      if (attributes.role !== 'moderator' && attributes.role !== 'coach') {
        router.push('/dashboard');
        return;
      } else router.push('/portal');
    }
    if (!customAttributes) {
      router.push('/dashboard');
      return;
    }

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

    await deleteCollectionCallChatById(callId);
    await deleteCallById(callId);

    setCallId('');
  };

  const signalTrackStateChange = async (isEnabled: boolean) => {
    const callDoc = doc(firestore, 'calls', callId);
    await setDoc(callDoc, { videoEnabled: isEnabled }, { merge: true });
  };

  const signalNewTrack = async (track: MediaStreamTrack) => {
    const callDoc = doc(firestore, 'calls', callId);

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

  useEffect(() => {
    let unsubscribe = () => {};

    if (callId) {
      const callDocRef = doc(firestore, 'calls', callId);
      unsubscribe = onSnapshot(callDocRef, () => {});
    }

    return unsubscribe;
  }, [callId]);

  return (
    <main className="px-[100px] pt-[100px] bg4 background-style bg-background">
      <div className="max-w-[1240px] mx-auto">
        <Header />
        <div className="flex justify-between space-x-[24px] max-h-[761px]">
          <div className="relative w-full max-w-[904px] h-full ">
            <VideoDisplay
              webcamVideoRef={webcamVideoRef}
              remoteVideoRef={remoteVideoRef}
              recordTimer={formattedTimer}
            />

            <div className="flex justify-center items-center bg-background-second relative rounded-b-2xl">
              <Controls
                isCalling={isCalling}
                isMuted={isMuted}
                handleMute={handleMute}
                handleRecord={handleRecord}
                handleVideoToggle={handleVideoToggle}
              />

              {isJoinCall && !isCalling && (
                <JoinCallLayout
                  callId={callId}
                  onChangeCallId={setCallId}
                  onAnswerCall={answerCall}
                  onChangeIsJoin={setIsJoinCall}
                  onChangeIsCalling={setIsCalling}
                />
              )}
              {!isJoinCall && !isCalling && (
                <div className="flex justify-end space-x-2 items-center">
                  <CallButton
                    isCalling={isCalling}
                    handleCall={isCalling ? handleEndCall : createCall}
                  />
                  <p className="text-themetext font-bold text-[18px]">or</p>
                  <button
                    onClick={() => setIsJoinCall(true)}
                    className="font-bold text-white rounded-lg shadow py-[14px] px-[20px] right-4 bg-primary btn_green_hover"
                  >
                    Join call
                  </button>
                </div>
              )}

              {!isJoinCall && isCalling && (
                <div className="flex justify-end space-x-2 items-center">
                  <CopyTextComponent callId={callId} />
                  <CallButton
                    isCalling={isCalling}
                    handleCall={isCalling ? handleEndCall : createCall}
                  />
                </div>
              )}
            </div>
          </div>
          <ChatSection chatId={callId} isCalling={isCalling} />
        </div>
      </div>
    </main>
  );
};

export default VideoCall;
