import { useEffect, useRef } from 'react';
import Peer from 'simple-peer';

interface Props {
  peer: Peer.Instance;
}

export const VideoGroup: React.FC<Props> = ({ peer }) => {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    ref.current!.srcObject = peer.streams[0];
  }, []);

  return (
    <video
      playsInline
      autoPlay
      ref={ref}
      className="h-full w-full rounded-2xl bg-dark object-cover"
    />
  );
};
