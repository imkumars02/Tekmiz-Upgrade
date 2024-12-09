import React, { useState } from 'react';
import './MeetingCreation.scss';

export default function MeetingCreation({ onMeetingCreated }) {
  const [meetingName, setMeetingName] = useState('');

  const createMeeting = () => {
    const meetingId = Math.random().toString(36).substring(7);
    onMeetingCreated(meetingId);
  };

  return (
    <div className="meeting-creation-container">
      <h2>Create a New Meeting</h2>
      <div className="input-container">
        <input
          type="text"
          value={meetingName}
          onChange={(e) => setMeetingName(e.target.value)}
          placeholder="Enter meeting name"
        />
        <button onClick={createMeeting} className="create-button">
          Create Meeting
        </button>
      </div>
    </div>
  );
}
