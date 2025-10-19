// hooks/useVideoCall.ts
import { useState, useEffect, useRef } from "react";
import * as mediasoupClient from "mediasoup-client";

interface UseVideoCallProps {
  roomId: string;
  socket: any;
  connected: boolean;
  emit: (event: string, payload?: any, callback?: (...args: any[]) => void) => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler: (...args: any[]) => void) => void;
  username: string;
  displayName?: string;
  language?: string;
}

export interface RemotePeer {
  socketId: string;
  username: string;
  stream: MediaStream;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  screenStream?: MediaStream;
}

export function useVideoCall({
  roomId,
  // socket,
  connected,
  emit,
  on,
  off,
  username,
  displayName,
  language = 'en'
}: UseVideoCallProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remotePeers, setRemotePeers] = useState<Map<string, RemotePeer>>(new Map());
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  const deviceRef = useRef<mediasoupClient.Device | null>(null);
  const producerTransportRef = useRef<any>(null);
  const consumerTransportRef = useRef<any>(null);
  const consumersRef = useRef<Map<string, Map<string, any>>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const remoteScreenStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const pendingProducersRef = useRef<any[]>([]);
  const isReadyRef = useRef(false);

  const audioProducerRef = useRef<any>(null);
  const videoProducerRef = useRef<any>(null);
  const screenVideoProducerRef = useRef<any>(null);
  const screenAudioProducerRef = useRef<any>(null);

  // Initialize local media stream
  useEffect(() => {
    let stopped = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (stopped) return;
        setLocalStream(stream);
      } catch (err) {
        console.error("getUserMedia error:", err);
      }
    })();
    return () => {
      stopped = true;
    };
  }, []);

  // WebRTC setup and event handlers
  useEffect(() => {
    if (!connected || !localStream) return;

    const handleRouterCapabilities = async ({ rtpCapabilities }: any) => {
      try {
        const device = new mediasoupClient.Device();
        await device.load({ routerRtpCapabilities: rtpCapabilities });
        deviceRef.current = device;

        await createSendTransport();
        await createRecvTransport();

        isReadyRef.current = true;

        if (pendingProducersRef.current.length > 0) {
          for (const { producerId, socketId } of pendingProducersRef.current) {
            await consume(producerId, socketId);
          }
          pendingProducersRef.current = [];
        }
      } catch (error) {
        console.error("Error loading device:", error);
      }
    };

    const handleExistingProducers = async (producers: any[]) => {
      if (!isReadyRef.current) {
        pendingProducersRef.current.push(...producers);
        return;
      }

      for (const { producerId, socketId, appData } of producers) {
        await consume(producerId, socketId, appData);
      }
    };

    const handleNewProducer = async ({ producerId, socketId, appData }: any) => {
      if (!isReadyRef.current) {
        pendingProducersRef.current.push({ producerId, socketId, appData });
        return;
      }
      await consume(producerId, socketId, appData);
    };

    const handlePeerLeft = ({ socketId }: any) => {
      removeRemotePeer(socketId);
    };

    const handlePeerMediaStatus = ({
      socketId,
      // username,
      isAudioMuted,
      isVideoMuted,
    }: any) => {
      setRemotePeers(prev => {
        const newPeers = new Map(prev);
        const peer = newPeers.get(socketId);
        if (peer) {
          peer.isAudioMuted = isAudioMuted;
          peer.isVideoMuted = isVideoMuted;
          newPeers.set(socketId, peer);
        }
        return newPeers;
      });
    };

    const handleExistingPeerStatuses = (statuses: any[]) => {
      statuses.forEach(({ socketId, username, isAudioMuted, isVideoMuted }) => {
        username
        setRemotePeers(prev => {
          const newPeers = new Map(prev);
          const peer = newPeers.get(socketId);
          if (peer) {
            peer.isAudioMuted = isAudioMuted;
            peer.isVideoMuted = isVideoMuted;
            newPeers.set(socketId, peer);
          }
          return newPeers;
        });
      });
    };

    on('router-rtp-capabilities', handleRouterCapabilities);
    on('existing-producers', handleExistingProducers);
    on('new-producer', handleNewProducer);
    on('peer-left', handlePeerLeft);
    on('peer-media-status', handlePeerMediaStatus);
    on('existing-peer-statuses', handleExistingPeerStatuses);

    emit('join-room', {
      roomId,
      username,
      displayName: displayName || username,
      language,
    });

    return () => {
      off('router-rtp-capabilities', handleRouterCapabilities);
      off('existing-producers', handleExistingProducers);
      off('new-producer', handleNewProducer);
      off('peer-left', handlePeerLeft);
      off('peer-media-status', handlePeerMediaStatus);
      off('existing-peer-statuses', handleExistingPeerStatuses);
    };
  }, [connected, roomId, username, displayName, language, localStream]);

  const createSendTransport = async () => {
    return new Promise((resolve, reject) => {
      emit('create-webrtc-transport', { direction: 'send' }, async (data: any) => {
        if (data.error) {
          reject(data.error);
          return;
        }

        const transport = deviceRef.current!.createSendTransport(data);
        producerTransportRef.current = transport;

        transport.on('connect', async ({ dtlsParameters }: any, callback: any, errback: any) => {
          try {
            emit('connect-transport', { transportId: transport.id, dtlsParameters }, (response: any) => {
              if (response.error) {
                errback(new Error(response.error));
              } else {
                callback();
              }
            });
          } catch (error) {
            errback(error);
          }
        });

        transport.on('produce', async ({ kind, rtpParameters, appData }: any, callback: any, errback: any) => {
          try {
            emit('produce', { transportId: transport.id, kind, rtpParameters, appData }, (response: any) => {
              if (response.error) {
                errback(new Error(response.error));
              } else {
                callback({ id: response.id });
              }
            });
          } catch (error) {
            errback(error);
          }
        });

        if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0];
          const audioTrack = localStream.getAudioTracks()[0];

          if (videoTrack) {
            const videoProducer = await transport.produce({ track: videoTrack });
            videoProducerRef.current = videoProducer;
          }
          if (audioTrack) {
            const audioProducer = await transport.produce({ track: audioTrack });
            audioProducerRef.current = audioProducer;
          }
        }

        resolve(transport);
      });
    });
  };

  const createRecvTransport = async () => {
    return new Promise((resolve, reject) => {
      emit('create-webrtc-transport', { direction: 'recv' }, async (data: any) => {
        if (data.error) {
          reject(data.error);
          return;
        }

        const transport = deviceRef.current!.createRecvTransport(data);
        consumerTransportRef.current = transport;

        transport.on('connect', async ({ dtlsParameters }: any, callback: any, errback: any) => {
          try {
            emit('connect-transport', { transportId: transport.id, dtlsParameters }, (response: any) => {
              if (response.error) {
                errback(new Error(response.error));
              } else {
                callback();
              }
            });
          } catch (error) {
            errback(error);
          }
        });

        resolve(transport);
      });
    });
  };

  const consume = async (producerId: string, socketId: string, appData: any = {}) => {
    if (!consumerTransportRef.current) return;

    try {
      emit('consume', {
        producerId,
        rtpCapabilities: deviceRef.current!.rtpCapabilities,
      }, async (response: any) => {
        if (response.error) {
          console.error("Failed to consume:", response.error);
          return;
        }

        const consumer = await consumerTransportRef.current.consume({
          id: response.id,
          producerId: response.producerId,
          kind: response.kind,
          rtpParameters: response.rtpParameters,
        });

        if (!consumersRef.current.has(socketId)) {
          consumersRef.current.set(socketId, new Map());
        }
        consumersRef.current.get(socketId)!.set(consumer.id, consumer);

        emit('resume-consumer', { consumerId: consumer.id }, (resumeResponse: any) => {
          if (resumeResponse?.error) {
            console.error("Failed to resume consumer:", resumeResponse.error);
          }
        });

        const mediaType = response.appData?.mediaType || appData?.mediaType || 'camera';
        addTrackToRemoteStream(socketId, consumer.track, mediaType);
      });
    } catch (error) {
      console.error("Error in consume:", error);
    }
  };

  const addTrackToRemoteStream = (socketId: string, track: MediaStreamTrack, mediaType: string = 'camera') => {
    const isScreenShare = mediaType === 'screen' || mediaType === 'screen-audio';

    if (isScreenShare) {
      let screenStream = remoteScreenStreamsRef.current.get(socketId);
      if (!screenStream) {
        screenStream = new MediaStream();
        remoteScreenStreamsRef.current.set(socketId, screenStream);
      }
      screenStream.addTrack(track);
      updateRemotePeers();
    } else {
      let stream = remoteStreamsRef.current.get(socketId);
      if (!stream) {
        stream = new MediaStream();
        remoteStreamsRef.current.set(socketId, stream);
      }
      stream.addTrack(track);
      updateRemotePeers();
    }
  };

  const updateRemotePeers = () => {
    setRemotePeers(prev => {
      const newPeers = new Map(prev);
      
      remoteStreamsRef.current.forEach((stream, socketId) => {
        const existing = newPeers.get(socketId);
        newPeers.set(socketId, {
          socketId,
          username: existing?.username || 'Unknown',
          stream,
          isAudioMuted: existing?.isAudioMuted || false,
          isVideoMuted: existing?.isVideoMuted || false,
          screenStream: remoteScreenStreamsRef.current.get(socketId),
        });
      });
      
      return newPeers;
    });
  };

  const removeRemotePeer = (socketId: string) => {
    const consumers = consumersRef.current.get(socketId);
    if (consumers) {
      consumers.forEach((consumer) => consumer.close());
      consumersRef.current.delete(socketId);
    }

    const stream = remoteStreamsRef.current.get(socketId);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      remoteStreamsRef.current.delete(socketId);
    }

    const screenStream = remoteScreenStreamsRef.current.get(socketId);
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      remoteScreenStreamsRef.current.delete(socketId);
    }

    setRemotePeers(prev => {
      const newPeers = new Map(prev);
      newPeers.delete(socketId);
      return newPeers;
    });
  };

  const toggleAudio = () => {
    if (!localStream) return;

    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      const muted = !audioTrack.enabled;
      setIsAudioMuted(muted);

      emit('update-media-status', {
        isAudioMuted: muted,
        isVideoMuted: isVideoMuted,
      });
    }
  };

  const toggleVideo = () => {
    if (!localStream) return;

    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      const muted = !videoTrack.enabled;
      setIsVideoMuted(muted);

      emit('update-media-status', {
        isAudioMuted: isAudioMuted,
        isVideoMuted: muted,
      });
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
        audio: true,
      });

      setScreenStream(stream);

      const transport = producerTransportRef.current;
      if (!transport) throw new Error("No producer transport available");

      const screenVideoTrack = stream.getVideoTracks()[0];
      if (screenVideoTrack) {
        const screenVideoProducer = await transport.produce({
          track: screenVideoTrack,
          appData: { mediaType: "screen" },
        });
        screenVideoProducerRef.current = screenVideoProducer;

        screenVideoTrack.onended = () => {
          stopScreenShare();
        };
      }

      const screenAudioTrack = stream.getAudioTracks()[0];
      if (screenAudioTrack) {
        const screenAudioProducer = await transport.produce({
          track: screenAudioTrack,
          appData: { mediaType: "screen-audio" },
        });
        screenAudioProducerRef.current = screenAudioProducer;
      }

      setIsScreenSharing(true);
    } catch (error) {
      console.error("Error starting screen share:", error);
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }

    if (screenVideoProducerRef.current) {
      screenVideoProducerRef.current.close();
      screenVideoProducerRef.current = null;
    }

    if (screenAudioProducerRef.current) {
      screenAudioProducerRef.current.close();
      screenAudioProducerRef.current = null;
    }

    setIsScreenSharing(false);
  };

  const toggleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      producerTransportRef.current?.close();
      consumerTransportRef.current?.close();
      localStream?.getTracks().forEach((track) => track.stop());
      screenStream?.getTracks().forEach((track) => track.stop());
      remoteStreamsRef.current.forEach((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });
      remoteScreenStreamsRef.current.forEach((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });
    };
  }, []);

  return {
    localStream,
    remotePeers,
    isAudioMuted,
    isVideoMuted,
    isScreenSharing,
    screenStream,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  };
}