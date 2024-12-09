import React, { useEffect, useState } from "react";
import UserHeader from "../Header/UserHeader";
import './Assignment.scss';
import { Link } from "react-router-dom";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseApp } from "../Firebase";

const Assignments = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Tekmiz-Assignments";

    const fetchPlaylists = async () => {
      try {
        const db = getFirestore(firebaseApp);
        const querySnapshot = await getDocs(collection(db, "playlists"));
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
    };

    fetchPlaylists();
  }, []);

  return (
    <>
      <UserHeader />
      <div className="UserAssignment">
        <h1 className="heading">Playlist Assignment</h1>
        <div className="box-container">
          {loading ? (
            <div style={{ padding: "2rem", fontSize: "2rem" }}>Loading...</div>
          ) : (
            <>
              {playlists.length > 0 ? (
                playlists.map((playlist) => (
                  <div className="box" key={playlist.id}>
                    <div className="thumb">
                      <img src={playlist.thumbnail} alt="Playlist Thumbnail" />
                    </div>
                    <h3 className="title">{playlist.title}</h3>
                    <Link to={`/Advanced/AssignmentView/${playlist.id}`} className="btn">
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

export default Assignments;