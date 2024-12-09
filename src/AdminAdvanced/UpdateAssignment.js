import React, { useEffect, useState } from "react";
import AdminHeader from "../Header/AdminHeader";
import { useParams, useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { firebaseApp } from "../Firebase";
import "./AddAssignment.scss"; // Use the same CSS for consistency

const UpdateAssignment = () => {
  const { playlistId } = useParams();
  const [assignment, setAssignment] = useState(null);
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
  const navigate = useNavigate();
  const db = getFirestore(firebaseApp);

  // Fetch the existing assignment data
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const docRef = doc(db, "assignments", playlistId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const assignmentData = docSnap.data();
          setAssignment(assignmentData);

          // Set form data from the fetched assignment
          setFormData({
            playlistId: assignmentData.playlistId || "",
            playlistTitle: assignmentData.playlistTitle || "",
            date: assignmentData.date || "",
            question: assignmentData.question || "",
            option1: assignmentData.options ? assignmentData.options[0] : "",
            option2: assignmentData.options ? assignmentData.options[1] : "",
            option3: assignmentData.options ? assignmentData.options[2] : "",
            option4: assignmentData.options ? assignmentData.options[3] : "",
            answer: assignmentData.answer || "",
          });
        } else {
          alert("Assignment not found!");
          navigate("/"); // Redirect to home if assignment not found
        }
      } catch (error) {
        console.error("Error fetching assignment:", error);
        alert("Failed to fetch assignment.");
      }
    };

    fetchAssignment();
  }, [db, playlistId, navigate,assignment]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission to update assignment
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "assignments", playlistId);

      // Update the document with new data
      await updateDoc(docRef, {
        playlistTitle: formData.playlistTitle,
        date: formData.date,
        question: formData.question,
        options: [formData.option1, formData.option2, formData.option3, formData.option4],
        answer: formData.answer,
      });

      alert("Assignment updated successfully!");
      navigate("/AdminAdvanced/AdminAssignment"); // Redirect to the desired page after update
    } catch (error) {
    //   console.error("Error updating assignment:", error);
      alert("Failed to update assignment.");
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="AddAssignment">
        <form encType="multipart/form-data" method="POST" onSubmit={handleSubmit}>
          <h1 className="heading">Update Assignment</h1>

          <p>
            Assignment Playlist <span>*</span>
          </p>
          <input
            type="text"
            name="playlistTitle"
            className="box"
            value={formData.playlistTitle}
            onChange={handleInputChange}
            disabled // Disable editing of the playlist title
          />

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
            value="Update Assignment"
            name="submit"
            className="btn"
          />
        </form>
      </div>
    </>
  );
};

export default UpdateAssignment;
