import React, { useEffect, useRef } from "react";
import {
	Phone,
	PhoneOff,
	Mic,
	MicOff,
	Video as VideoIcon,
	VideoOff,
} from "lucide-react";

const overlayStyle = {
	position: "fixed",
	top: 0,
	left: 0,
	width: "100vw",
	height: "100vh",
	background: "rgba(0,0,0,0.85)",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	zIndex: 1000,
	backdropFilter: "blur(8px)",
};

const modalStyle = {
	width: "min(900px, 95vw)",
	background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
	color: "#fff",
	borderRadius: 20,
	padding: 24,
	boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
	border: "1px solid rgba(255,255,255,0.1)",
};

const headerStyle = {
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	marginBottom: 20,
};

const videosStyle = {
	display: "grid",
	gridTemplateColumns: "1fr 1fr",
	gap: 16,
	minHeight: 360,
};

const videoBox = {
	position: "relative",
	background: "#000",
	borderRadius: 12,
	overflow: "hidden",
	minHeight: 300,
	border: "2px solid rgba(255,255,255,0.1)",
};

const controlsStyle = {
	display: "flex",
	gap: 16,
	justifyContent: "center",
	marginTop: 24,
	alignItems: "center",
};

const audioCallContainerStyle = {
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	padding: "60px 40px",
	minHeight: 320,
};

const avatarLargeStyle = {
	width: 120,
	height: 120,
	borderRadius: "50%",
	border: "4px solid rgba(255,255,255,0.2)",
	marginBottom: 24,
	boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
};

const statusBadgeStyle = (isConnected) => ({
	display: "inline-flex",
	alignItems: "center",
	gap: 8,
	padding: "8px 16px",
	borderRadius: 20,
	background: isConnected
		? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
		: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
	fontSize: 14,
	fontWeight: 600,
	marginTop: 12,
	boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
});

const pulseAnimation = {
	animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
};

const buttonBaseStyle = {
	width: 56,
	height: 56,
	borderRadius: "50%",
	border: 0,
	cursor: "pointer",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	transition: "all 0.2s ease",
	boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
};

export default function CallModal({
	isOpen,
	onClose,
	onAccept,
	onReject,
	onEnd,
	callType = "video",
	isCaller = false,
	isAccepted = false,
	remoteStream,
	localStream,
	callerInfo,
	isMuted = false,
	isVideoOff = false,
	peerMuted = false,
	peerVideoOff = false,
	onToggleMute,
	onToggleVideo,
}) {
	const localRef = useRef(null);
	const remoteRef = useRef(null);
	const localAudioRef = useRef(null);
	const remoteAudioRef = useRef(null);

	useEffect(() => {
		if (!isOpen) return;
		if (localRef.current && localStream) {
			localRef.current.srcObject = localStream;
			const v = localRef.current;
			const tryPlay = () => v.play?.().catch(() => {});
			v.onloadedmetadata = tryPlay;
			tryPlay();
		}
		if (localAudioRef.current && localStream) {
			localAudioRef.current.srcObject = localStream;
		}
	}, [isOpen, localStream, isVideoOff]);

	useEffect(() => {
		if (!isOpen) return;
		if (remoteRef.current && remoteStream) {
			remoteRef.current.srcObject = remoteStream;
			const v = remoteRef.current;
			const tryPlay = () => v.play?.().catch(() => {});
			v.onloadedmetadata = tryPlay;
			tryPlay();
		}
		if (remoteAudioRef.current && remoteStream) {
			remoteAudioRef.current.srcObject = remoteStream;
		}
	}, [isOpen, remoteStream, peerVideoOff]);

	if (!isOpen) return null;

	return (
		<div style={overlayStyle}>
			<div style={modalStyle}>
				<div style={headerStyle}>
					<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
						{callerInfo?.avatar ? (
							<img
								src={callerInfo.avatar}
								alt="avatar"
								style={{ width: 36, height: 36, borderRadius: "50%" }}
							/>
						) : null}
						<div>
							<div style={{ fontWeight: 600 }}>
								{isAccepted
									? "In call"
									: isCaller
									? "Calling"
									: "Incoming call"}
							</div>
							<div style={{ opacity: 0.8, fontSize: 13 }}>
								{callerInfo?.name || "Unknown"} ·{" "}
								{callType === "audio" ? "Audio" : "Video"}
							</div>
						</div>
					</div>
					<button
						onClick={onClose}
						style={{
							background: "transparent",
							color: "#fff",
							border: 0,
							fontSize: 18,
						}}
					>
						×
					</button>
				</div>

				{callType === "video" ? (
					<div style={videosStyle}>
						<div style={videoBox}>
							{isVideoOff ? (
								<div
									style={{
										width: "100%",
										height: "100%",
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "center",
										background:
											"linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
									}}
								>
									{callerInfo?.avatar ? (
										<img
											src={callerInfo.avatar}
											alt="You"
											style={{
												width: 80,
												height: 80,
												borderRadius: "50%",
												border: "3px solid rgba(255,255,255,0.2)",
											}}
										/>
									) : (
										<div
											style={{
												width: 80,
												height: 80,
												borderRadius: "50%",
												background:
													"linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontSize: 32,
												fontWeight: 700,
												border: "3px solid rgba(255,255,255,0.2)",
											}}
										>
											Y
										</div>
									)}
									<div style={{ marginTop: 12, fontSize: 14, opacity: 0.7 }}>
										Camera Off
									</div>
								</div>
							) : (
								<video
									ref={localRef}
									muted
									autoPlay
									playsInline
									style={{ width: "100%", height: "100%", objectFit: "cover" }}
								/>
							)}
						</div>
						<div style={{ ...videoBox, position: "relative" }}>
							{peerVideoOff ? (
								<div
									style={{
										width: "100%",
										height: "100%",
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "center",
										background:
											"linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
									}}
								>
									{callerInfo?.avatar ? (
										<img
											src={callerInfo.avatar}
											alt={callerInfo.name}
											style={{
												width: 80,
												height: 80,
												borderRadius: "50%",
												border: "3px solid rgba(255,255,255,0.2)",
											}}
										/>
									) : (
										<div
											style={{
												width: 80,
												height: 80,
												borderRadius: "50%",
												background:
													"linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												fontSize: 32,
												fontWeight: 700,
												border: "3px solid rgba(255,255,255,0.2)",
											}}
										>
											{(callerInfo?.name?.[0] || "?").toUpperCase()}
										</div>
									)}
									<div style={{ marginTop: 12, fontSize: 14, opacity: 0.7 }}>
										Camera Off
									</div>
								</div>
							) : (
								<video
									ref={remoteRef}
									autoPlay
									playsInline
									style={{ width: "100%", height: "100%", objectFit: "cover" }}
								/>
							)}
							{peerMuted && (
								<div
									style={{
										position: "absolute",
										top: 12,
										right: 12,
										background: "rgba(239, 68, 68, 0.9)",
										padding: 8,
										borderRadius: 8,
										display: "flex",
										alignItems: "center",
										gap: 6,
										boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
									}}
								>
									<MicOff size={16} />
									<span style={{ fontSize: 12, fontWeight: 600 }}>Muted</span>
								</div>
							)}
						</div>
					</div>
				) : (
					<div style={audioCallContainerStyle}>
						{/* Hidden audio elements to actually play the streams */}
						<audio
							ref={localAudioRef}
							muted
							autoPlay
							playsInline
							style={{ display: "none" }}
						/>
						<audio
							ref={remoteAudioRef}
							autoPlay
							playsInline
							style={{ display: "none" }}
						/>

						{callerInfo?.avatar ? (
							<img
								src={callerInfo.avatar}
								alt={callerInfo.name}
								style={avatarLargeStyle}
							/>
						) : (
							<div
								style={{
									...avatarLargeStyle,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									background:
										"linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
									fontSize: 48,
									fontWeight: 700,
								}}
							>
								{(callerInfo?.name?.[0] || "?").toUpperCase()}
							</div>
						)}

						<div style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
							{callerInfo?.name || "Unknown"}
						</div>

						{peerMuted && isAccepted && (
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 6,
									background: "rgba(239, 68, 68, 0.9)",
									padding: "6px 12px",
									borderRadius: 12,
									marginBottom: 8,
								}}
							>
								<MicOff size={16} />
								<span style={{ fontSize: 13, fontWeight: 600 }}>Muted</span>
							</div>
						)}

						<div style={statusBadgeStyle(isAccepted && remoteStream)}>
							{isAccepted && remoteStream ? (
								<>
									<span
										style={{
											width: 8,
											height: 8,
											borderRadius: "50%",
											background: "#fff",
											display: "inline-block",
										}}
									/>
									Connected
								</>
							) : (
								<>
									<span
										style={{
											width: 8,
											height: 8,
											borderRadius: "50%",
											background: "#fff",
											display: "inline-block",
											...pulseAnimation,
										}}
									/>
									{isCaller ? "Calling..." : "Incoming..."}
								</>
							)}
						</div>
					</div>
				)}

				<div style={controlsStyle}>
					{!isCaller && !isAccepted ? (
						<>
							<button
								onClick={onReject}
								style={{
									...buttonBaseStyle,
									background:
										"linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
								}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.transform = "scale(1.05)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.transform = "scale(1)")
								}
								title="Reject"
							>
								<Phone size={24} style={{ transform: "rotate(135deg)" }} />
							</button>
							<button
								onClick={onAccept}
								style={{
									...buttonBaseStyle,
									background:
										"linear-gradient(135deg, #10b981 0%, #059669 100%)",
								}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.transform = "scale(1.05)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.transform = "scale(1)")
								}
								title="Accept"
							>
								<Phone size={24} />
							</button>
						</>
					) : (
						<>
							{/* Mute button */}
							<button
								onClick={onToggleMute}
								style={{
									...buttonBaseStyle,
									background: isMuted
										? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
										: "linear-gradient(135deg, #475569 0%, #334155 100%)",
								}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.transform = "scale(1.05)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.transform = "scale(1)")
								}
								title={isMuted ? "Unmute" : "Mute"}
							>
								{isMuted ? <MicOff size={24} /> : <Mic size={24} />}
							</button>

							{/* Camera toggle button */}
							<button
								onClick={onToggleVideo}
								style={{
									...buttonBaseStyle,
									background: isVideoOff
										? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
										: "linear-gradient(135deg, #475569 0%, #334155 100%)",
								}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.transform = "scale(1.05)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.transform = "scale(1)")
								}
								title={isVideoOff ? "Turn on camera" : "Turn off camera"}
							>
								{isVideoOff ? <VideoOff size={24} /> : <VideoIcon size={24} />}
							</button>

							{/* End call button */}
							<button
								onClick={onEnd}
								style={{
									...buttonBaseStyle,
									background:
										"linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
								}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.transform = "scale(1.05)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.transform = "scale(1)")
								}
								title="End call"
							>
								<PhoneOff size={24} />
							</button>
						</>
					)}
				</div>
			</div>
			<style>{`
				@keyframes pulse {
					0%, 100% {
						opacity: 1;
					}
					50% {
						opacity: 0.5;
					}
				}
			`}</style>
		</div>
	);
}
