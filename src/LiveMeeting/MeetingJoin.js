import React, { useState } from 'react';
import './MeetingJoin.scss';

export default function MeetingJoin({ onMeetingJoined }) {
  const [meetingId, setMeetingId] = useState('');
  const [name, setName] = useState('');

  const joinMeeting = () => {
    onMeetingJoined(meetingId, name);
  };

  return (
    <div className="meeting-join-container">
      <h2>Join a Meeting</h2>
      <div className="input-container">
        <input
          type="text"
          value={meetingId}
          onChange={(e) => setMeetingId(e.target.value)}
          placeholder="Enter meeting ID"
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <button onClick={joinMeeting} className="join-button">
          Join Meeting
        </button>
      </div>
    </div>
  );
}
