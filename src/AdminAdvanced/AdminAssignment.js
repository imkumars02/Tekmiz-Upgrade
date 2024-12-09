import React, { useEffect, useState } from "react";
import AdminHeader from "../Header/AdminHeader";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseApp } from "../Firebase";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import {FaCalendar } from "react-icons/fa";
import "./AdminAssignment.scss";

const AdminAssignment = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const fetchUser = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const db = getFirestore(firebaseApp);
          const q = query(collection(db, "playlists"), where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const fetchedPlaylists = [];
          querySnapshot.forEach((doc) => {
            fetchedPlaylists.push({ id: doc.id, ...doc.data() });
          });
          setPlaylists(fetchedPlaylists);
        } catch (error) {
          console.error("Error fetching playlists:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    return () => fetchUser();
  }, []);

  return (
    <>
      <AdminHeader />
      <div className="AdminAssignment">
        <h1 className="heading">Added Assignment</h1>
        <div className="box-container">
          <div className="box" style={{ textAlign: "center" }}>
            <h3 className="title" style={{ marginBottom: "0.5rem" }}>
              Create New Assignment
            </h3>
            <Link to="/AdminAdvanced/AddAssignment" className="btn">
              Add Assignment
            </Link>
          </div>
          {loading ? (
            <div style={{ padding: "2rem", fontSize: "2rem" }}>Loading...</div>
          ) : (
            <>
              {playlists.length > 0 ? (
                playlists.map((playlist) => (
                  <div className="box" key={playlist.id}>
                    <div className="flex">
                      <div>
                        <i>
                          <FaCalendar />
                        </i>
                        <span>Date : {playlist.date}</span>
                      </div>
                    </div>
                    <div className="thumb">
                      <img src={playlist.thumbnail} alt="Playlist Thumbnail" />
                    </div>
                    <h3 className="title">{playlist.title}</h3>
                    <Link to={`/AdminAdvanced/ViewAssignment/${playlist.id}`} className="btn">
                      View Assignment
                    </Link>
                  </div>
                ))
              ) : (
                <p className="empty">No Playlist Added Yet !!</p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminAssignment;
