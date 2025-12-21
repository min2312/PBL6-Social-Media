import React, {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
	useCallback,
} from "react";
import { io } from "socket.io-client";
// Use pre-built browser bundle to minimize Node core usage
import SimplePeer from "simple-peer/simplepeer.min.js";
import CallModal from "../components/Call/CallModal";
import { UserContext } from "./UserProvider";

/*
CallContext: cung cấp socket và logic gọi ở phạm vi toàn cục, để user đứng ở trang nào
cũng nhận được cuộc gọi nếu đã đăng nhập (có token & account id)

API trả về qua hook useCall():
  state:
    - incomingCall: { from, callType, caller } | null
    - inCall: boolean
    - isCaller: boolean
    - callType: 'audio' | 'video'
    - localStream, remoteStream
  actions:
    - startCall(userId, type)
    - acceptCall()
    - rejectCall()
    - endCall()
*/

const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
	const { user } = useContext(UserContext);
	const socketRef = useRef(null);
	const peerRef = useRef(null);

	const [incomingCall, setIncomingCall] = useState(null);
	const [isCaller, setIsCaller] = useState(false);
	const [inCall, setInCall] = useState(false);
	const [callType, setCallType] = useState("video");
	const [localStream, setLocalStream] = useState(null);
	const [remoteStream, setRemoteStream] = useState(null);
	const [peerTargetId, setPeerTargetId] = useState(null);
	const [peerInfo, setPeerInfo] = useState(null); // info of the other party (for caller side UI)
	const [isMuted, setIsMuted] = useState(false);
	const [isVideoOff, setIsVideoOff] = useState(false);
	const [peerMuted, setPeerMuted] = useState(false);
	const [peerVideoOff, setPeerVideoOff] = useState(false);

	const cleanupMedia = useCallback(() => {
		if (peerRef.current) {
			try {
				peerRef.current.destroy();
			} catch (e) {}
			peerRef.current = null;
		}
		if (localStream) localStream.getTracks().forEach((t) => t.stop());
		setLocalStream(null);
		setRemoteStream(null);
		setIncomingCall(null);
		setIsCaller(false);
		setInCall(false);
		setPeerInfo(null);
		setIsMuted(false);
		setIsVideoOff(false);
		setPeerMuted(false);
		setPeerVideoOff(false);
	}, [localStream]);

	const getMedia = async (type) => {
		const constraints =
			type === "audio"
				? { audio: true, video: false }
				: { audio: true, video: { width: 640, height: 480 } };
		return navigator.mediaDevices.getUserMedia(constraints);
	};

	const createPeer = useCallback(
		({ initiator, stream, toUserId }) => {
			const p = new SimplePeer({
				initiator,
				trickle: false,
				stream,
				config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
			});

			p.on("signal", (data) => {
				socketRef.current?.emit("call:signal", { to: toUserId, signal: data });
			});
			p.on("stream", (remote) => setRemoteStream(remote));
			p.on("error", (err) => console.error("Peer error:", err));
			p.on("close", () => {
				cleanupMedia();
			});
			peerRef.current = p;
		},
		[cleanupMedia]
	);

	const startCall = useCallback(
		async (targetUserId, type = "video", targetInfo = null) => {
			if (!socketRef.current || !targetUserId) return;
			setCallType(type);
			setIsCaller(true);
			setInCall(true);
			setPeerTargetId(targetUserId);
			if (targetInfo) setPeerInfo(targetInfo);
			// Initialize video state based on call type
			setIsVideoOff(type === "audio");
			setPeerVideoOff(type === "audio");
			const stream = await getMedia(type);
			setLocalStream(stream);
			createPeer({ initiator: true, stream, toUserId: targetUserId });
			socketRef.current.emit("call:init", { to: targetUserId, callType: type });
		},
		[createPeer]
	);

	const acceptCall = useCallback(async () => {
		if (!incomingCall) return;
		setInCall(true);
		// Initialize video state based on call type
		setIsVideoOff(callType === "audio");
		setPeerVideoOff(callType === "audio");
		const stream = await getMedia(callType);
		setLocalStream(stream);
		setPeerTargetId(incomingCall.from);
		createPeer({ initiator: false, stream, toUserId: incomingCall.from });
		socketRef.current?.emit("call:accept", { to: incomingCall.from, callType });
	}, [incomingCall, callType, createPeer]);

	const rejectCall = useCallback(() => {
		if (!incomingCall) return;
		socketRef.current?.emit("call:reject", { to: incomingCall.from });
		cleanupMedia();
	}, [incomingCall, cleanupMedia]);

	const endCall = useCallback(() => {
		const to = peerTargetId;
		if (to) socketRef.current?.emit("call:end", { to });
		cleanupMedia();
	}, [peerTargetId, cleanupMedia]);

	const toggleMute = useCallback(() => {
		if (!localStream) return;
		const audioTrack = localStream.getAudioTracks()[0];
		if (audioTrack) {
			audioTrack.enabled = !audioTrack.enabled;
			const newMutedState = !audioTrack.enabled;
			setIsMuted(newMutedState);
			// Notify peer
			socketRef.current?.emit("call:mic-toggle", {
				to: peerTargetId,
				muted: newMutedState,
			});
		}
	}, [localStream, peerTargetId]);

	const toggleVideo = useCallback(async () => {
		if (!localStream) return;
		try {
			const currentVideoTrack = localStream.getVideoTracks()[0] || null;

			// If we already have a video track, prefer toggling enabled to avoid renegotiation
			if (currentVideoTrack) {
				const turningOff = currentVideoTrack.enabled;
				currentVideoTrack.enabled = !currentVideoTrack.enabled;
				setIsVideoOff(turningOff);
				socketRef.current?.emit("call:video-toggle", {
					to: peerTargetId,
					videoOff: turningOff,
				});
				return;
			}

			// No current video track (audio-only stream) -> add a new camera track and renegotiate
			const camStream = await navigator.mediaDevices.getUserMedia({
				video: { width: 640, height: 480 },
				audio: false,
			});
			const newVideoTrack = camStream.getVideoTracks()[0];
			if (!newVideoTrack) throw new Error("No video track obtained");

			localStream.addTrack(newVideoTrack);
			if (peerRef.current?.addTrack) {
				peerRef.current.addTrack(newVideoTrack, localStream);
			}

			setIsVideoOff(false);
			// Nudge consumers to re-bind when switching UI placeholders
			setLocalStream((prev) => prev);
			socketRef.current?.emit("call:video-toggle", {
				to: peerTargetId,
				videoOff: false,
			});
		} catch (err) {
			console.error("Failed to toggle video:", err);
		}
	}, [localStream, peerTargetId]);

	// Initialize global socket once user has token
	useEffect(() => {
		if (!user?.token || !user?.account?.id) return;
		// Avoid duplicate
		if (socketRef.current) return;
		const s = io(`${process.env.REACT_APP_API_URL}`, {
			auth: { token: user.token },
			transports: ["websocket"],
			upgrade: false,
			reconnectionAttempts: 5, // Giới hạn số lần thử lại
			reconnectionDelay: 1000,
		});
		socketRef.current = s;

		s.on("call:incoming", (payload) => {
			setIncomingCall(payload);
			setCallType(payload.callType || "video");
			setIsCaller(false);
			setInCall(false);
		});
		s.on("call:accepted", () => {
			setInCall(true);
		});
		s.on("call:rejected", () => {
			cleanupMedia();
		});
		s.on("call:ended", () => {
			cleanupMedia();
		});
		s.on("call:signal", ({ signal }) => {
			if (peerRef.current) {
				peerRef.current.signal(signal);
			}
		});

		s.on("call:mode-change", ({ mode }) => {
			if (mode === "audio") {
				setCallType("audio");
				setPeerVideoOff(true);
			} else if (mode === "video") {
				setCallType("video");
				setPeerVideoOff(false);
			}
		});

		// Listen for peer mic toggle
		s.on("call:mic-toggle", ({ muted }) => {
			setPeerMuted(muted);
		});

		// Listen for peer video toggle
		s.on("call:video-toggle", ({ videoOff }) => {
			setPeerVideoOff(videoOff);
		});

		s.on("connect_error", (err) => {
			console.error("Socket connect_error (call):", err?.message);
		});

		s.on("disconnect", (reason) => {
			console.warn("Call socket disconnected:", reason);
			// Do NOT cleanup media here to avoid dropping active calls during reconnect/StrictMode
			// socket.io will auto-reconnect; keep socketRef.current
		});

		return () => {
			s.disconnect();
			socketRef.current = null;
		};
	}, [user?.token, user?.account?.id, cleanupMedia]);

	// Auto mode switching: both cameras off = audio mode, any camera on = video mode
	useEffect(() => {
		if (!inCall) return;

		// Both cameras off → audio mode
		if (isVideoOff && peerVideoOff && callType === "video") {
			setCallType("audio");
		}
		// Any camera on → video mode
		else if ((!isVideoOff || !peerVideoOff) && callType === "audio") {
			setCallType("video");
		}
	}, [isVideoOff, peerVideoOff, callType, inCall]);

	const contextValue = {
		incomingCall,
		isCaller,
		inCall,
		callType,
		localStream,
		remoteStream,
		isMuted,
		isVideoOff,
		peerMuted,
		peerVideoOff,
		startCall,
		acceptCall,
		rejectCall,
		endCall,
		toggleMute,
		toggleVideo,
	};

	return (
		<CallContext.Provider value={contextValue}>
			<>
				{children}
				<CallModal
					isOpen={Boolean(incomingCall) || inCall}
					onClose={endCall}
					onAccept={acceptCall}
					onReject={rejectCall}
					onEnd={endCall}
					callType={callType}
					isCaller={isCaller}
					isAccepted={inCall}
					remoteStream={remoteStream}
					localStream={localStream}
					callerInfo={isCaller ? peerInfo : incomingCall?.caller}
					isMuted={isMuted}
					isVideoOff={isVideoOff}
					peerMuted={peerMuted}
					peerVideoOff={peerVideoOff}
					onToggleMute={toggleMute}
					onToggleVideo={toggleVideo}
				/>
			</>
		</CallContext.Provider>
	);
};

export const useCall = () => {
	const ctx = useContext(CallContext);
	if (!ctx) throw new Error("useCall must be used within CallProvider");
	return ctx;
};
