import React, { useEffect, useState } from "react";
import AdminHeader from "../Header/AdminHeader";
import "./AddAssignment.scss";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseApp } from "../Firebase";
import { collection, addDoc, getDocs, getFirestore, where, query } from "firebase/firestore";

const AddAssignment = () => {
  const [playlists, setPlaylists] = useState([]);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    playlistId: "",
    playlistTitle: "",
    date: "",
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    answer: "",
  });

  const db = getFirestore(firebaseApp);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const playlistCollection = collection(db, "playlists");
          const q = query(playlistCollection, where("userId", "==", user.uid));
          const playlistSnapshot = await getDocs(q);
          const playlistData = playlistSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPlaylists(playlistData);
        } catch (error) {
          console.error("Error fetching playlists: ", error);
        }
      }
    });

    return () => unsubscribe();
  }, [db]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePlaylistChange = (e) => {
    const selectedPlaylist = playlists.find(
      (playlist) => playlist.id === e.target.value
    );
    setFormData((prevData) => ({
      ...prevData,
      playlistId: selectedPlaylist.id,
      playlistTitle: selectedPlaylist.title,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You need to be logged in to submit the assignment.");
      return;
    }

    // Basic form validation
    const { playlistId, date, question, option1, option2, option3, option4, answer } = formData;
    if (!playlistId || !date || !question || !option1 || !option2 || !option3 || !option4 || !answer) {
      alert("All fields are required.");
      return;
    }

    try {
      // Add the assignment to Firestore
      const assignmentCollection = collection(db, "assignments");
      await addDoc(assignmentCollection, {
        userId: user.uid,
        playlistId: formData.playlistId,
        playlistTitle: formData.playlistTitle,
        date:formData.date,
        question:formData.question,
        options: [option1, option2, option3, option4],
        answer:formData.answer,
      });
      alert("Assignment added successfully.");
      // Clear the form after submission
      setFormData({
        playlistId: "",
        playlistTitle: "",
        date: "",
        question: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        answer: "",
      });
    } catch (error) {
      alert("Failed to add assignment.");
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="AddAssignment">
        <form encType="multipart/form-data" method="POST" onSubmit={handleSubmit}>
          <h1 className="heading">Add Assignment</h1>

          <p>
            Assignment Playlist <span>*</span>
          </p>
          <select
            name="playlist"
            className="box"
            required
            value={formData.playlistId}
            onChange={handlePlaylistChange}
          >
            <option value="">Select Playlist</option>
            {playlists.map((playlist) => (
              <option key={playlist.id} value={playlist.id}>
                {playlist.title}
              </option>
            ))}
          </select>

          <p>
            Select Date <span>*</span>
          </p>
          <input
            type="date"
            name="date"
            className="box"
            required
            value={formData.date}
            onChange={handleInputChange}
          />

          <p>
            Question <span>*</span>
          </p>
          <textarea
            name="question"
            className="box"
            required
            placeholder="Write Question Here"
            cols={10}
            rows={10}
            value={formData.question}
            onChange={handleInputChange}
          ></textarea>

          <p>
            Option1 <span>*</span>
          </p>
          <input
            type="text"
            name="option1"
            placeholder="Enter Option1"
            className="box"
            required
            value={formData.option1}
            onChange={handleInputChange}
          />

          <p>
            Option2 <span>*</span>
          </p>
          <input
            type="text"
            name="option2"
            placeholder="Enter Option2"
            className="box"
            required
            value={formData.option2}
            onChange={handleInputChange}
          />

          <p>
            Option3 <span>*</span>
          </p>
          <input
            type="text"
            name="option3"
            placeholder="Enter Option3"
            className="box"
            required
            value={formData.option3}
            onChange={handleInputChange}
          />

          <p>
            Option4 <span>*</span>
          </p>
          <input
            type="text"
            name="option4"
            placeholder="Enter Option4"
            className="box"
            required
            value={formData.option4}
            onChange={handleInputChange}
          />

          <p>
            Answer <span>*</span>
          </p>
          <input
            type="text"
            name="answer"
            placeholder="Enter answer"
            className="box"
            required
            value={formData.answer}
            onChange={handleInputChange}
          />

          <input
            type="submit"
            value="Add Assignment"
            name="submit"
            className="btn"
          />
        </form>
      </div>
    </>
  );
};

export default AddAssignment;
