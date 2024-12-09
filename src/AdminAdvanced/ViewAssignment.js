import React, { useEffect, useState } from "react";
import AdminHeader from "../Header/AdminHeader";
import "./ViewAssignment.scss";
import { Link, useParams } from "react-router-dom";
import { FaCalendar } from "react-icons/fa";
import { firebaseApp } from "../Firebase";
import { collection, getDocs, getFirestore, query, where, doc, deleteDoc } from "firebase/firestore";

const ViewAssignment = () => {
  const { playlistId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const db = getFirestore(firebaseApp);

  // Fetch assignments based on playlistId
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const assignmentCollection = collection(db, "assignments");
        const q = query(assignmentCollection, where("playlistId", "==", playlistId));
        const assignmentSnapshot = await getDocs(q);
        const assignmentData = assignmentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAssignments(assignmentData);
      } catch (error) {
        // console.error("Error fetching assignments: ", error);
      }
    };

    fetchAssignments();
  }, [db, playlistId]);

  // Delete assignment
  const handleDelete = async (assignmentId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this assignment?");
    
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "assignments", assignmentId));
        // Update the UI by removing the deleted assignment from the state
        setAssignments(assignments.filter((assignment) => assignment.id !== assignmentId));
        alert("Assignment deleted successfully.");
      } catch (error) {
        // console.error("Error deleting assignment: ", error);
        alert("Failed to delete the assignment.");
      }
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="ViewAssignment">
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <div className="AssignmentBox" key={assignment.id}>
              <div className="box">
                <div className="flex">
                  <i>
                    <FaCalendar />
                  </i>
                  <span>Date: {assignment.date}</span>
                </div>
                <h1 className="question">
                  <span>Question: </span>
                  {assignment.question}
                </h1>
                <div className="Options">
                  {assignment.options.map((option, index) => (
                    <div className="optionBox" key={index}>
                      <input
                        type="radio"
                        className="radio"
                        name={`radio-${assignment.id}`}
                      />
                      <p>{option}</p>
                    </div>
                  ))}
                </div>
                <div className="answer">
                  <h2>Answer: {assignment.answer}</h2>
                </div>
                <div className="BtnDiv">
                  <Link to={`/AdminAdvanced/UpdateAssignment/${assignment.id}`} className="btn">
                    Update
                  </Link>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(assignment.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="empty">No assignments found for this playlist.</p>
        )}
      </div>
    </>
  );
};

export default ViewAssignment;
