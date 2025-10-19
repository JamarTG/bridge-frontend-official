import { useEffect, useRef, useState } from "react";
import type { JSX } from "react";
import * as mediasoupClient from "mediasoup-client";
import { Device } from "mediasoup-client";
import type { Transport, Producer, Consumer } from "mediasoup-client/types";
import NavbarLayout from "@/components/features/navbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ChatControls from "@/components/features/controls/chat-controls";
import ChatTab from "@/components/features/panel/chat-tab";
import AITab from "@/components/features/panel/ai-tab";
import DocsTab from "@/components/features/panel/doc-tab";
import TranscriptTab from "@/components/features/panel/transcript-tab";
import { Bot, FileText, Folder, MessageCircle } from "lucide-react";
import DynamicVideoGrid from "@/components/features/video/video-grid";
import { useSocket } from "@/hooks/useSocket";
import { useTranscription } from "@/hooks/useTranscription";
import { Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { useRoomId } from "@/context/RoomIDContext";

// Type definitions
interface Message {
  username: string;
  message: string;
  timestamp: string;
  socketId: string;
  isSystem: boolean;
}

interface VideoTileData {
  name: string;
  hasHandRaised: boolean;
  hasVideoOn: boolean;
  isSpeaking: boolean;
  isMicOff: boolean;
  stream: MediaStream | null;
  isLocal: boolean;
}

interface PeerStatus {
  isAudioMuted: boolean;
  isVideoMuted: boolean;
}

interface PeerMediaStatus extends PeerStatus {
  username: string;
}

// interface Language {
//   code: string;
//   name: string;
//   flag: string;
// }

interface PendingProducer {
  producerId: string;
  socketId: string;
  appData?: Record<string, any>;
}

interface RouterCapabilitiesData {
  rtpCapabilities: mediasoupClient.types.RtpCapabilities;
}

interface TransportData {
  id: string;
  iceParameters: mediasoupClient.types.IceParameters;
  iceCandidates: mediasoupClient.types.IceCandidate[];
  dtlsParameters: mediasoupClient.types.DtlsParameters;
  error?: string;
}

interface ProduceResponse {
  id: string;
  error?: string;
}

interface ConsumeResponse {
  id: string;
  producerId: string;
  kind: mediasoupClient.types.MediaKind;
  rtpParameters: mediasoupClient.types.RtpParameters;
  appData?: Record<string, any>;
  error?: string;
}

interface ResumeResponse {
  error?: string;
}

const startTimestamp = "2025-10-17T01:00:00";

const Meeting = (): JSX.Element => {
  // Get roomId from URL or use default
  //https://134.199.193.207:3000

  const rId: string = window.location.pathname.split('/').pop() || 'default-room';

  const { setRoomId } = useRoomId();

  useEffect(() => {

    setRoomId(rId);
  }, [])

      //import.meta.env.VITE_SOCKET_URL || "ws://134.199.193.207:3000/",


  const { user } = useAuth();
  const { connected, emit, on, off } = useSocket(
    import.meta.env.VITE_SOCKET_URL || "http://localhost:3000/",
    // wss://134.199.193.207:3001/


    { withCredentials: false }
  );

  // Video refs
  const myVideoRef = useRef<HTMLVideoElement | null>(null);
  // const remoteContainerRef = useRef<HTMLDivElement | null>(null);
  const screenShareRef = useRef<HTMLVideoElement | null>(null);
  const myStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Mediasoup refs
  const deviceRef = useRef<Device | null>(null);
  const producerTransportRef = useRef<Transport | null>(null);
  const consumerTransportRef = useRef<Transport | null>(null);
  const consumersRef = useRef<Map<string, Map<string, Consumer>>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const remoteScreenStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const peerMediaStatusRef = useRef<Map<string, PeerMediaStatus>>(new Map());
  const pendingProducersRef = useRef<PendingProducer[]>([]);
  const isReadyRef = useRef<boolean>(false);

  const audioProducerRef = useRef<Producer | null>(null);
  const videoProducerRef = useRef<Producer | null>(null);
  const screenVideoProducerRef = useRef<Producer | null>(null);
  const screenAudioProducerRef = useRef<Producer | null>(null);

  // UI state
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [peerStatuses, setPeerStatuses] = useState<Record<string, PeerStatus>>({});
  const [videoTileData, setVideoTileData] = useState<VideoTileData[]>([]);
  const [localStreamReady, setLocalStreamReady] = useState<boolean>(false);


  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);

  // User settings
  const [username] = useState<string>(
    user?.name ||
    localStorage.getItem("displayName") ||
    `User-${Math.floor(Math.random() * 1000)}`
  );

  const [displayName] = useState<string>(
    user?.name ||
    localStorage.getItem("displayName") ||
    ""
  );

  const [language, setLanguage] = useState<string>(
    localStorage.getItem("language") || "en"
  );
  const [_showSettings, _setShowSettings] = useState<boolean>(false);

  // Streaming translation UI states
  const [streamingTranslation, setStreamingTranslation] = useState<string>("");
  const [currentTranslatingId, setCurrentTranslatingId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const transcriptionEndRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, _setActiveTab] = useState<string>("chat");

  const {
    isTranscribing,
    isSpeaking,
    transcriptions,
    toggleTranscription,
  } = useTranscription(emit as Socket["emit"], on as Socket["on"], off as Socket["off"], connected as Socket["connected"], rId as string, language as string);

  // const languages: Language[] = [
  //   { code: "en", name: "English", flag: "🇺🇸" },
  //   { code: "es", name: "Spanish", flag: "🇪🇸" },
  //   { code: "fr", name: "French", flag: "🇫🇷" },
  //   { code: "de", name: "German", flag: "🇩🇪" },
  //   { code: "it", name: "Italian", flag: "🇮🇹" },
  //   { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  //   { code: "ru", name: "Russian", flag: "🇷🇺" },
  //   { code: "ja", name: "Japanese", flag: "🇯🇵" },
  //   { code: "zh", name: "Chinese", flag: "🇨🇳" },
  //   { code: "ko", name: "Korean", flag: "🇰🇷" },
  //   { code: "ar", name: "Arabic", flag: "🇸🇦" },
  //   { code: "hi", name: "Hindi", flag: "🇮🇳" },
  // ];

  // Add this useEffect after the other useEffects in Meeting.tsx
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent<string>) => {
      const newLanguage = event.detail;
      console.log('Language changed to:', newLanguage);
      setLanguage(newLanguage);
      
      // Notify the backend of the language change
      if (connected) {
        emit("update-language", {
          language: newLanguage,
        });
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, [connected, emit]);
  useEffect(() => {
    const tiles: VideoTileData[] = Array.from(remoteStreamsRef.current.entries()).map(([socketId, stream]) => {
      const status = peerMediaStatusRef.current.get(socketId);
      return {
        name: status?.username || socketId,
        hasHandRaised: false,
        hasVideoOn: !status?.isVideoMuted,
        isSpeaking: false,
        isMicOff: status?.isAudioMuted || false,
        stream: stream,
        isLocal: false,
      };
    });

    if (localStreamReady && myStreamRef.current) {
      tiles.unshift({
        name: displayName || username,
        hasHandRaised: false,
        hasVideoOn: !isVideoMuted,
        isSpeaking: isSpeaking,
        isMicOff: isAudioMuted,
        stream: myStreamRef.current,
        isLocal: true,
      });
    }

    setVideoTileData(tiles);
  }, [peerStatuses, isAudioMuted, isVideoMuted, isSpeaking, displayName, username, localStreamReady]);
  // Add this after the videoTileData update effect:
  useEffect(() => {
    console.log('📹 Video tile data updated:', {
      tileCount: videoTileData.length,
      tiles: videoTileData.map(t => ({
        name: t.name,
        hasVideoOn: t.hasVideoOn,
        hasStream: !!t.stream,
        isLocal: t.isLocal
      }))
    });
  }, [videoTileData]);

  // Add this in addTrackToRemoteStream:
  console.log('📹 Remote streams map size:', remoteStreamsRef.current.size);
  console.log('📹 All remote streams:', Array.from(remoteStreamsRef.current.keys()));

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (activeTab === "transcription") {
      transcriptionEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcriptions, activeTab]);

  useEffect(() => {
    let stopped = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (stopped) return;

        myStreamRef.current = stream;

        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
          myVideoRef.current.muted = true;
          await myVideoRef.current.play().catch(() => { });
        }
        console.log("Local stream obtained");
        setLocalStreamReady(true);
      } catch (err) {
        console.error("getUserMedia error:", err);
      }
    })();
    return () => {
      stopped = true;
    };
  }, []);

  useEffect(() => {
    if (!connected) return;

    console.log("Registering event handlers...");

    const handleRouterCapabilities = async ({ rtpCapabilities }: RouterCapabilitiesData): Promise<void> => {
      try {
        console.log("Received router RTP capabilities");
        const device = new mediasoupClient.Device();
        await device.load({ routerRtpCapabilities: rtpCapabilities });
        deviceRef.current = device;
        console.log("Device loaded");

        await createSendTransport();
        await createRecvTransport();

        isReadyRef.current = true;
        console.log("Ready to consume producers");

        if (pendingProducersRef.current.length > 0) {
          console.log(
            "Processing",
            pendingProducersRef.current.length,
            "pending producers"
          );
          for (const { producerId, socketId } of pendingProducersRef.current) {
            await consume(producerId, socketId);
          }
          pendingProducersRef.current = [];
        }
      } catch (error) {
        console.error("Error loading device:", error);
      }
    };

    const handleExistingProducers = async (producers: PendingProducer[]): Promise<void> => {
      console.log("Existing producers received:", producers);

      if (!isReadyRef.current) {
        console.log("Not ready yet, queueing", producers.length, "producers");
        pendingProducersRef.current.push(...producers);
        return;
      }

      for (const { producerId, socketId, appData } of producers) {
        await consume(producerId, socketId, appData);
      }
    };

    const handleNewProducer = async ({ producerId, socketId, appData }: PendingProducer): Promise<void> => {
      console.log(
        "New producer event:",
        producerId,
        "from",
        socketId,
        "appData:",
        appData
      );

      if (!isReadyRef.current) {
        console.log("Not ready yet, queueing producer");
        pendingProducersRef.current.push({ producerId, socketId, appData });
        return;
      }

      console.log("Consuming new producer immediately");
      await consume(producerId, socketId, appData);
    };

    const handlePeerLeft = ({ socketId }: { socketId: string }): void => {
      console.log("Peer left:", socketId);
      removeRemoteVideo(socketId);
    };

    const handleChatMessage = ({
      username,
      message,
      timestamp,
      socketId,
      isSystem,
    }: Message): void => {
      setMessages((prev) => [
        ...prev,
        { username, message, timestamp, socketId, isSystem },
      ]);
    };

    const handleTranslationChunk = ({
      socketId,
      timestamp,
      chunk,
      isComplete,
    }: {
      socketId: string;
      timestamp: string;
      chunk: string;
      isComplete: boolean;
    }): void => {
      const translationId = `${socketId}-${timestamp}`;

      if (isComplete) {
        setStreamingTranslation("");
        setCurrentTranslatingId(null);
      } else {
        setCurrentTranslatingId(translationId);
        setStreamingTranslation((prev) => prev + chunk);
      }
    };

    const handlePeerMediaStatus = ({
      socketId,
      username,
      isAudioMuted,
      isVideoMuted,
    }: {
      socketId: string;
      username: string;
      isAudioMuted: boolean;
      isVideoMuted: boolean;
    }): void => {
      console.log(
        `Peer ${socketId} media status: audio ${isAudioMuted ? "muted" : "unmuted"
        }, video ${isVideoMuted ? "off" : "on"}`
      );
      peerMediaStatusRef.current.set(socketId, {
        isAudioMuted,
        isVideoMuted,
        username,
      });
      setPeerStatuses((prev) => ({
        ...prev,
        [socketId]: { isAudioMuted, isVideoMuted },
      }));
    };

    const handleExistingPeerStatuses = (statuses: Array<{
      socketId: string;
      username: string;
      isAudioMuted: boolean;
      isVideoMuted: boolean;
    }>): void => {
      console.log("Received existing peer statuses:", statuses);
      statuses.forEach(({ socketId, username, isAudioMuted, isVideoMuted }) => {
        peerMediaStatusRef.current.set(socketId, {
          isAudioMuted,
          isVideoMuted,
          username,
        });
        setPeerStatuses((prev) => ({
          ...prev,
          [socketId]: { isAudioMuted, isVideoMuted },
        }));
      });
    };

    on("router-rtp-capabilities", handleRouterCapabilities);
    on("existing-producers", handleExistingProducers);
    on("new-producer", handleNewProducer);
    on("peer-left", handlePeerLeft);
    on("chat-message", handleChatMessage);
    on("translation-chunk", handleTranslationChunk);
    on("peer-media-status", handlePeerMediaStatus);
    on("existing-peer-statuses", handleExistingPeerStatuses);

   
  const checkAndJoin = (): void => {
    if (myStreamRef.current) {
      console.log("Joining room:", rId, "as", displayName || username);
      emit("join-room", {
        roomId: rId,
        username,
        displayName: displayName || username,
        language,
      });
    } else {
      console.log("Waiting for local stream before joining...");
      setTimeout(checkAndJoin, 100);
    }
  };
  checkAndJoin();

    return () => {
      console.log("Cleaning up event handlers");
      off("router-rtp-capabilities", handleRouterCapabilities);
      off("existing-producers", handleExistingProducers);
      off("new-producer", handleNewProducer);
      off("peer-left", handlePeerLeft);
      off("chat-message", handleChatMessage);
      off("translation-chunk", handleTranslationChunk);
      off("peer-media-status", handlePeerMediaStatus);
      off("existing-peer-statuses", handleExistingPeerStatuses);
    };
  }, [connected, rId, username, displayName]);

  const createSendTransport = async (): Promise<Transport> => {
    console.log("Creating send transport...");
    return new Promise((resolve, reject) => {
      emit("create-webrtc-transport", { direction: "send" }, async (data: TransportData) => {
        if (data.error) {
          console.error("Failed to create send transport:", data.error);
          reject(data.error);
          return;
        }

        console.log("Send transport created:", data.id);
        const transport = deviceRef.current!.createSendTransport(data);
        producerTransportRef.current = transport;

        transport.on("connectionstatechange", (state: any) => {
          console.log(`🔌 SEND transport connection state: ${state}`);
        });

        transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
          try {
            emit(
              "connect-transport",
              {
                transportId: transport.id,
                dtlsParameters,
              },
              (response: { error?: string }) => {
                if (response.error) {
                  console.error(
                    "Failed to connect send transport:",
                    response.error
                  );
                  errback(new Error(response.error));
                } else {
                  console.log("Send transport connected");
                  callback();
                }
              }
            );
          } catch (error) {
            errback(error as any);
          }
        });

        transport.on(
          "produce",
          async ({ kind, rtpParameters, appData }, callback, errback) => {
            try {
              emit(
                "produce",
                {
                  transportId: transport.id,
                  kind,
                  rtpParameters,
                  appData,
                },
                (response: ProduceResponse) => {
                  if (response.error) {
                    console.error("Failed to produce:", response.error);
                    errback(new Error(response.error));
                  } else {
                    console.log(`Producer created: ${response.id} (${kind})`);
                    callback({ id: response.id });
                  }
                }
              );
            } catch (error) {
              errback(error as any);
            }
          }
        );

        const myStream = myStreamRef.current;
        if (myStream) {
          const videoTrack = myStream.getVideoTracks()[0];
          const audioTrack = myStream.getAudioTracks()[0];

          if (videoTrack) {
            console.log("Producing video track...");
            const videoProducer = await transport.produce({ track: videoTrack });
            videoProducerRef.current = videoProducer;
          }
          if (audioTrack) {
            console.log("Producing audio track...");
            const audioProducer = await transport.produce({ track: audioTrack });
            audioProducerRef.current = audioProducer;
          }
        }

        resolve(transport);
      });
    });
  };

  const createRecvTransport = async (): Promise<Transport> => {
    console.log("Creating recv transport...");
    return new Promise((resolve, reject) => {
      emit("create-webrtc-transport", { direction: "recv" }, async (data: TransportData) => {
        if (data.error) {
          console.error("Failed to create recv transport:", data.error);
          reject(data.error);
          return;
        }

        console.log("Recv transport created:", data.id);
        const transport = deviceRef.current!.createRecvTransport(data);
        consumerTransportRef.current = transport;

        transport.on("connectionstatechange", (state) => {
          console.log(`🔌 RECV transport connection state: ${state}`);
        });

        transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
          try {
            emit(
              "connect-transport",
              {
                transportId: transport.id,
                dtlsParameters,
              },
              (response: { error?: string }) => {
                if (response.error) {
                  console.error(
                    "Failed to connect recv transport:",
                    response.error
                  );
                  errback(new Error(response.error));
                } else {
                  console.log("Recv transport connected");
                  callback();
                }
              }
            );
          } catch (error) {
            errback(error as any);
          }
        });

        resolve(transport);
      });
    });
  };

  const consume = async (producerId: string, socketId: string, appData: Record<string, any> = {}): Promise<void> => {
    console.log(
      `Starting consume for producer ${producerId} from ${socketId}`,
      appData
    );

    if (!consumerTransportRef.current) {
      console.error("No consumer transport available");
      return;
    }

    try {
      emit(
        "consume",
        {
          producerId,
          rtpCapabilities: deviceRef.current!.rtpCapabilities,
        },
        async (response: ConsumeResponse) => {
          if (response.error) {
            console.error("Failed to consume:", response.error);
            return;
          }

          console.log("Consuming:", response);
          const consumer = await consumerTransportRef.current!.consume({
            id: response.id,
            producerId: response.producerId,
            kind: response.kind,
            rtpParameters: response.rtpParameters,
          });

          if (!consumersRef.current.has(socketId)) {
            consumersRef.current.set(socketId, new Map());
          }
          consumersRef.current.get(socketId)!.set(consumer.id, consumer);

          console.log("Resuming consumer:", consumer.id);
          emit(
            "resume-consumer",
            { consumerId: consumer.id },
            (resumeResponse: ResumeResponse) => {
              if (resumeResponse?.error) {
                console.error(
                  "Failed to resume consumer:",
                  resumeResponse.error
                );
              } else {
                console.log("Consumer resumed successfully");
              }
            }
          );

          const mediaType =
            response.appData?.mediaType || appData?.mediaType || "camera";
          addTrackToRemoteStream(socketId, consumer.track, mediaType);
        }
      );
    } catch (error) {
      console.error("Error in consume:", error);
    }
  };

  const addTrackToRemoteStream = (socketId: string, track: MediaStreamTrack, mediaType: string = "camera"): void => {
    console.log(`Adding ${track.kind} track (${mediaType}) for peer:`, socketId);

    const isScreenShare = mediaType === "screen" || mediaType === "screen-audio";

    if (isScreenShare) {
      let screenStream = remoteScreenStreamsRef.current.get(socketId);
      if (!screenStream) {
        screenStream = new MediaStream();
        remoteScreenStreamsRef.current.set(socketId, screenStream);
      }
      screenStream.addTrack(track);
      console.log(
        `Screen stream for ${socketId} now has ${screenStream.getTracks().length} tracks`
      );
    } else {
      let stream = remoteStreamsRef.current.get(socketId);
      if (!stream) {
        stream = new MediaStream();
        remoteStreamsRef.current.set(socketId, stream);
      }
      stream.addTrack(track);
      console.log(
        `Stream for ${socketId} now has ${stream.getTracks().length} tracks`
      );

      // Force update video tiles when new tracks are added
      setPeerStatuses((prev) => ({ ...prev, [socketId]: prev[socketId] || {} }));
    }
  };

  const removeRemoteVideo = (socketId: string): void => {
    console.log("Removing remote video for:", socketId);

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

    peerMediaStatusRef.current.delete(socketId);
    setPeerStatuses((prev) => {
      const newStatuses = { ...prev };
      delete newStatuses[socketId];
      return newStatuses;
    });
  };


  const sendChatMessage = (message: string): void => {
    if (!connected || !message.trim()) return;

    emit("send-chat-message", {
      roomId: rId,
      username: displayName || username,
      message: message.trim(),
    });
  };
  // const savePreferences = (): void => {
  //   if (displayName.trim()) {
  //     setUsername(displayName);
  //     localStorage.setItem("displayName", displayName);
  //   }
  //   localStorage.setItem("language", language);

  //   emit("update-preferences", {
  //     displayName: displayName || username,
  //     language: language,
  //   });

  //   setShowSettings(false);
  // };

  const toggleAudio = (): void => {
    if (!myStreamRef.current) return;

    const audioTrack = myStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      const muted = !audioTrack.enabled;
      setIsAudioMuted(muted);
      console.log(`Audio ${audioTrack.enabled ? "unmuted" : "muted"}`);

      emit("update-media-status", {
        isAudioMuted: muted,
        isVideoMuted: isVideoMuted,
      });
    }
  };

  const toggleVideo = (): void => {
    if (!myStreamRef.current) return;

    const videoTrack = myStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      const muted = !videoTrack.enabled;
      setIsVideoMuted(muted);
      console.log(`Video ${videoTrack.enabled ? "enabled" : "disabled"}`);

      emit("update-media-status", {
        isAudioMuted: isAudioMuted,
        isVideoMuted: muted,
      });
    }
  };

  const startScreenShare = async (): Promise<void> => {
    try {
      console.log("Starting screen share...");

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      });

      screenStreamRef.current = screenStream;

      if (screenShareRef.current) {
        screenShareRef.current.srcObject = screenStream;
        screenShareRef.current
          .play()
          .catch((err) => console.error("Error playing screen share:", err));
      }

      const transport = producerTransportRef.current;
      if (!transport) {
        throw new Error("No producer transport available");
      }

      const screenVideoTrack = screenStream.getVideoTracks()[0];
      if (screenVideoTrack) {
        console.log("Producing screen video track...");
        const screenVideoProducer = await transport.produce({
          track: screenVideoTrack,
          appData: { mediaType: "screen" },
        });
        screenVideoProducerRef.current = screenVideoProducer;

        screenVideoTrack.onended = () => {
          console.log("Screen share stopped by user");
          stopScreenShare();
        };
      }

      const screenAudioTrack = screenStream.getAudioTracks()[0];
      if (screenAudioTrack) {
        console.log("Producing screen audio track...");
        const screenAudioProducer = await transport.produce({
          track: screenAudioTrack,
          appData: { mediaType: "screen-audio" },
        });
        screenAudioProducerRef.current = screenAudioProducer;

        screenAudioTrack.onended = () => {
          console.log("Screen audio stopped");
        };
      }

      setIsScreenSharing(true);
      console.log("Screen share started successfully");
    } catch (error) {
      console.error("Error starting screen share:", error);
      alert("Failed to start screen sharing. Please try again.");
    }
  };
  

  const stopScreenShare = (): void => {
    console.log("Stopping screen share...");

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      screenStreamRef.current = null;
    }

    if (screenShareRef.current) {
      screenShareRef.current.srcObject = null;
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
    console.log("Screen share stopped");
  };

  const toggleScreenShare = (): void => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      producerTransportRef.current?.close();
      consumerTransportRef.current?.close();
      myStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      remoteStreamsRef.current.forEach((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });
      remoteScreenStreamsRef.current.forEach((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });
    };
  }, []);

  return (
    <NavbarLayout>
      <div className="relative flex-1 flex overflow-hidden">
        <div className="flex justify-center items-center w-screen md:w-[70vw] h-[80vh] md:h-[80vh]" >
          <DynamicVideoGrid videoTileData={videoTileData} />
        </div>

        <div className="hidden md:block w-md h-lg border-l border-border bg-surface flex-col">
          <Tabs defaultValue="ai" className="h-full flex-1 flex flex-col">
            <TabsList className="mx-4 mt-4 grid w-[calc(100%-2rem)] grid-cols-4">
              <TabsTrigger value="chat"><MessageCircle />Chat</TabsTrigger>
              <TabsTrigger value="ai"><Bot /> AI</TabsTrigger>
              <TabsTrigger value="docs"><Folder /> Docs</TabsTrigger>
              <TabsTrigger value="transcript"><FileText></FileText>Transcript</TabsTrigger>
            </TabsList>

            <div className="flex-1 flex flex-col">
              <TabsContent value="chat">
              <TabsContent value="chat">
               <ChatTab
                  messages={messages}
                  onSendMessage={sendChatMessage}
                  connected={connected}
                  username={displayName || username}
                  emit={emit}  // Pass emit function directly
                  userLanguage={language} // Pass user's language preference
                />
            </TabsContent>
              </TabsContent>
              <TabsContent value="ai"><AITab meetingId={rId} /></TabsContent>
              <TabsContent value="docs"><DocsTab /></TabsContent>
              <TabsContent value="transcript">
                <TranscriptTab
                  transcriptions={transcriptions}
                  language={language}
                  streamingTranslation={streamingTranslation}
                  currentTranslatingId={currentTranslatingId}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <ChatControls
        meetingStartTime={startTimestamp}
        isAudioMuted={isAudioMuted}
        isVideoMuted={isVideoMuted}
        isScreenSharing={isScreenSharing}
        isTranscribing={isTranscribing}
        isSpeaking={isSpeaking}
        connected={connected}
        toggleAudio={toggleAudio}
        toggleVideo={toggleVideo}
        toggleScreenShare={toggleScreenShare}
        toggleTranscription={toggleTranscription}
      />
    </NavbarLayout>
  );
};

export default Meeting;