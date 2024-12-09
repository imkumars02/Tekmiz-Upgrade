// import React, { useEffect } from 'react'
// import UserHeader from "../Header/UserHeader";
// import Working from '../Working'

// const Meeting = () => {
//     useEffect(()=>{
//         document.title = 'Tekmiz-Meeting';
//     })
//   return (
//     <div>
//         <UserHeader/>
//         <Working/>
//     </div>
//   )
// }

// export default Meeting

// import React, { useState } from "react";
// import MeetingJoin from "../LiveMeeting/MeetingJoin";
// import MeetingCreation from "../LiveMeeting/MeetingCreation";
// import MeetingRoom from "../LiveMeeting/MeetingRoom";

// // import './App.css';

// export default function Meeting() {
//   const [meetingState, setMeetingState] = useState({
//     inMeeting: false,
//     meetingId: null,
//     name: null,
//   });

//   const handleMeetingCreated = (meetingId) => {
//     setMeetingState({
//       inMeeting: true,
//       meetingId,
//       name: "Host", // You might want to prompt for a name here
//     });
//   };

//   const handleMeetingJoined = (meetingId, name) => {
//     setMeetingState({
//       inMeeting: true,
//       meetingId,
//       name,
//     });
//   };

//   if (meetingState.inMeeting) {
//     return (
//       <MeetingRoom
//         meetingId={meetingState.meetingId}
//         name={meetingState.name}
//       />
//     );
//   }

//   return (
//     <>
//       <UserHeader />
//       <div className="app-container">
//         <h1 className="app-title">Live Meeting App</h1>
//         <div className="meeting-options">
//           <MeetingCreation onMeetingCreated={handleMeetingCreated} />
//           <MeetingJoin onMeetingJoined={handleMeetingJoined} />
//         </div>
//       </div>
//     </>
//   );
// }

import React, { useState, useEffect } from "react";
import UserHeader from "../Header/UserHeader";
import "./Meeting.scss";

// Placeholder for WebRTC and Socket.io logic
const useMeetingConnection = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true }) // Start with video off
      .then((stream) => setLocalStream(stream))
      .catch((err) => console.error("Error accessing media devices.", err));
  }, []);

  return {
    localStream,
    remoteStreams,
    shareScreen: async () => {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        setLocalStream(screenStream); // Replace local stream with screen stream
        screenStream.getTracks().forEach((track) => {
          track.onended = () => {
            // Re-enable the camera if the screen sharing is stopped
            navigator.mediaDevices
              .getUserMedia({ video: true, audio: true })
              .then((stream) => setLocalStream(stream));
          };
        });
      } catch (err) {
        console.error("Error sharing screen: ", err);
      }
    },
    leaveMeeting: () => console.log("Left meeting"),
    toggleAudio: (enabled) => {
      if (localStream) {
        localStream
          .getAudioTracks()
          .forEach((track) => (track.enabled = enabled));
      }
    },
    toggleVideo: (enabled) => {
      if (localStream) {
        localStream
          .getVideoTracks()
          .forEach((track) => (track.enabled = enabled));
      }
    },
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
  const [messages, setMessages] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = { id: Date.now(), text: message, sender: "You" };
      setMessages([...messages, newMessage]);
      sendMessage(message);
      setMessage("");
    }
  };

  const handleEdit = (id, newText) => {
    setMessages(
      messages.map((msg) => (msg.id === id ? { ...msg, text: newText } : msg))
    );
    setEditingId(null);
  };

  const handleDelete = (id) => {
    setMessages(messages.filter((msg) => msg.id !== id));
  };

  return (
    <div className="chat">
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className="chat-message">
            <strong>{msg.sender}: </strong>
            {editingId === msg.id ? (
              <input
                value={msg.text}
                onChange={(e) => handleEdit(msg.id, e.target.value)}
                onBlur={() => setEditingId(null)}
                autoFocus
              />
            ) : (
              <span>{msg.text}</span>
            )}
            <button
              className="icon-button"
              onClick={() => setEditingId(msg.id)}
            >
              Edit
            </button>
            <button
              className="icon-button"
              onClick={() => handleDelete(msg.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
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
    <div className="admit-participant">
      <h3>Waiting Room</h3>
      {participants.map((participant, index) => (
        <div key={index} className="participant">
          <span>{participant.name}</span>
          <div>
            <button onClick={() => onAdmit(participant)}>Admit</button>
            <button onClick={() => onDeny(participant)} className="deny">
              Deny
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const MeetingRoom = ({ meetingId, name }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(true); // Start with video off
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [waitingParticipants, setWaitingParticipants] = useState([]);

  const {
    localStream,
    remoteStreams,
    shareScreen,
    leaveMeeting,
    toggleAudio,
    toggleVideo,
  } = useMeetingConnection();

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
    toggleAudio(!isMuted);
  };

  const handleToggleVideo = () => {
    setIsVideoOff((prev) => !prev);
    toggleVideo(!isVideoOff);
  };

  const startRecording = () => {
    const recorder = new MediaRecorder(localStream);
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };
    recorder.start();
    setMediaRecorder(recorder);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recording.mp4";
      a.click();
      setRecordedChunks([]); // Reset chunks after saving
    };
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
    setIsRecording((prev) => !prev);
  };

  const shareMeetingLink = () => {
    const meetingLink = `https://yourdomain.com/join/${meetingId}`;
    navigator.clipboard
      .writeText(meetingLink)
      .then(() => {
        alert("Meeting link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy meeting link: ", err);
        alert("Failed to copy meeting link. Please try again.");
      });
  };

  return (
    <>
      <UserHeader />
      <div className="meeting-room">
        <div className="video-container">
          <VideoGrid localStream={localStream} remoteStreams={remoteStreams} />
        </div>
        <div className="controls">
          <button onClick={handleToggleMute}>
            {isMuted ? "Unmute" : "Mute"}
          </button>
          <button onClick={handleToggleVideo}>
            {isVideoOff ? "Start Video" : "Stop Video"}
          </button>
          <button onClick={shareScreen}>Share Screen</button>
          <button
            onClick={handleToggleRecording}
            className={isRecording ? "recording" : ""}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>
          <button onClick={() => setIsChatOpen(!isChatOpen)}>Chat</button>
          <button onClick={shareMeetingLink}>Share Link</button>
          <button onClick={leaveMeeting} className="leave">
            Leave Meeting
          </button>
        </div>
        {isChatOpen && (
          <div className="chat-container">
            <Chat
              sendMessage={(message) => console.log("Message sent:", message)}
            />
          </div>
        )}
        {waitingParticipants.length > 0 && (
          <div className="waiting-room">
            <AdmitParticipant
              participants={waitingParticipants}
              onAdmit={(participant) => {
                setWaitingParticipants(
                  waitingParticipants.filter((p) => p !== participant)
                );
              }}
              onDeny={(participant) => {
                setWaitingParticipants(
                  waitingParticipants.filter((p) => p !== participant)
                );
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};

const MeetingCreation = ({ onMeetingCreated }) => {
  const [meetingName, setMeetingName] = useState("");

  const createMeeting = () => {
    const meetingId = Math.random().toString(36).substring(7);
    onMeetingCreated(meetingId);
  };

  return (
    <div className="meeting-creation">
      <h2>Create a New Meeting</h2>
      <input
        value={meetingName}
        onChange={(e) => setMeetingName(e.target.value)}
        placeholder="Enter meeting name"
      />
      <button onClick={createMeeting}>Create Meeting</button>
    </div>
  );
};

const MeetingJoin = ({ onMeetingJoined }) => {
  const [meetingId, setMeetingId] = useState("");
  const [name, setName] = useState("");

  const joinMeeting = () => {
    onMeetingJoined(meetingId, name);
  };

  return (
    <div className="meeting-join">
      <h2>Join a Meeting</h2>
      <input
        value={meetingId}
        onChange={(e) => setMeetingId(e.target.value)}
        placeholder="Enter meeting ID"
      />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <button onClick={joinMeeting}>Join Meeting</button>
    </div>
  );
};

export default function LiveMeeting() {
  const [meetingState, setMeetingState] = useState({
    inMeeting: false,
    meetingId: null,
    name: null,
  });

  const handleMeetingCreated = (meetingId) => {
    setMeetingState({
      inMeeting: true,
      meetingId,
      name: "Host",
    });
  };

  const handleMeetingJoined = (meetingId, name) => {
    setMeetingState({
      inMeeting: true,
      meetingId,
      name,
    });
  };

  if (meetingState.inMeeting) {
    return (
      <MeetingRoom
        meetingId={meetingState.meetingId}
        name={meetingState.name}
      />
    );
  }

  return (
    <>
      <UserHeader />
      <div className="live-meeting">
        <h1>Live Meeting App</h1>
        <div className="meeting-options">
          <MeetingCreation onMeetingCreated={handleMeetingCreated} />
          <MeetingJoin onMeetingJoined={handleMeetingJoined} />
        </div>
      </div>
    </>
  );
}
