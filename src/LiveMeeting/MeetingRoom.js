import React, { useState } from "react";
import UserHeader from '../Header/UserHeader';
import "./MeetingRoom.scss";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Share,
} from "lucide-react";

// Placeholder for WebRTC and Socket.io logic
const useMeetingConnection = () => {
  return {
    localStream: null,
    remoteStreams: [],
    shareScreen: () => console.log("Screen shared"),
    startRecording: () => console.log("Recording started"),
    stopRecording: () => console.log("Recording stopped"),
    sendMessage: (message) => console.log("Message sent:", message),
    leaveMeeting: () => console.log("Left meeting"),
  };
};

const VideoGrid = ({ localStream, remoteStreams }) => {
  return (
    <div className="video-grid">
      {localStream && (
        <video
          autoPlay
          muted
          playsInline
          ref={(video) => {
            if (video) video.srcObject = localStream;
          }}
        />
      )}
      {remoteStreams.map((stream, index) => (
        <video
          key={index}
          autoPlay
          playsInline
          ref={(video) => {
            if (video) video.srcObject = stream;
          }}
        />
      ))}
    </div>
  );
};

const Chat = ({ sendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };

  return (
    <div className="chat-card">
      <div className="chat-input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

const AdmitParticipant = ({ participants, onAdmit, onDeny }) => {
  return (
    <div className="admit-card">
      <h3>Waiting Room</h3>
      {participants.map((participant, index) => (
        <div key={index} className="participant">
          <span>{participant.name}</span>
          <div>
            <button onClick={() => onAdmit(participant)}>Admit</button>
            <button onClick={() => onDeny(participant)} className="deny-button">
              Deny
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function MeetingRoom() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [waitingParticipants, setWaitingParticipants] = useState([]);

  const {
    localStream,
    remoteStreams,
    shareScreen,
    startRecording,
    stopRecording,
    sendMessage,
    leaveMeeting,
  } = useMeetingConnection();

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => setIsVideoOff(!isVideoOff);

  const admitParticipant = (participant) => {
    setWaitingParticipants(
      waitingParticipants.filter((p) => p !== participant)
    );
  };

  const denyParticipant = (participant) => {
    setWaitingParticipants(
      waitingParticipants.filter((p) => p !== participant)
    );
  };

  return (
    <>
      <UserHeader />
      <div className="meeting-room">
        <div className="video-section">
          <VideoGrid localStream={localStream} remoteStreams={remoteStreams} />
        </div>
        <div className="controls">
          <button onClick={toggleMute}>{isMuted ? <MicOff /> : <Mic />}</button>
          <button onClick={toggleVideo}>
            {isVideoOff ? <VideoOff /> : <Video />}
          </button>
          <button onClick={shareScreen}>
            <Share />
          </button>
          <button onClick={leaveMeeting} className="leave-button">
            <PhoneOff />
          </button>
          <button onClick={() => setIsChatOpen(!isChatOpen)}>
            <MessageSquare />
          </button>
        </div>
        {isChatOpen && (
          <div className="chat-section">
            <Chat sendMessage={sendMessage} />
          </div>
        )}
        {waitingParticipants.length > 0 && (
          <div className="waiting-room">
            <AdmitParticipant
              participants={waitingParticipants}
              onAdmit={admitParticipant}
              onDeny={denyParticipant}
            />
          </div>
        )}
      </div>
    </>
  );
}
