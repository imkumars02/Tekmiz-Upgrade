import './TeacherProfile.css';
import { Link, useParams } from 'react-router-dom';
import UserHeader from '../Header/UserHeader';
import React, { useEffect, useState } from 'react';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { firebaseApp } from '../Firebase';

const TeacherProfile = () => {
  const { userId } = useParams();
  const [tutor, setTutor] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [videosCount, setVideosCount] = useState(0);

  useEffect(() => {
    const fetchTutor = async () => {
      if (!userId) return;

      const db = getFirestore(firebaseApp);

      try {
        const tutorQuery = query(collection(db, 'tutor'), where('userId', '==', userId));
        const tutorDocs = await getDocs(tutorQuery);

        if (!tutorDocs.empty) {
          const tutorData = tutorDocs.docs[0].data();
          const playlistCount = await countPlaylistsByUserId(userId);
          const likesCount = await countLikesByUserId(userId);
          const commentsCount = await countCommentsByUserId(userId);
          const videosCount = await countVideosByUserId(userId);

          setTutor({ ...tutorData, playlistCount });
          setLikesCount(likesCount);
          setCommentsCount(commentsCount);
          setVideosCount(videosCount);

          const playlistQuery = query(collection(db, 'playlists'), where('userId', '==', userId));
          const playlistDocs = await getDocs(playlistQuery);
          const fetchedPlaylist = [];
          playlistDocs.forEach((doc) => {
            fetchedPlaylist.push({ id: doc.id, ...doc.data() });
          });
          setPlaylists(fetchedPlaylist);
        } else {
          console.error('No Tutor Found !!');
          setPlaylists([]); // Ensure playlists are cleared if tutor not found
        }
      } catch (error) {
        console.error('Error fetching tutor:', error);
      }
    };

    fetchTutor();
  }, [userId]);

  const countPlaylistsByUserId = async (userId) => {
    if (!userId) return 0;

    const db = getFirestore(firebaseApp);
    const q = query(collection(db, 'playlists'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  };

  const countLikesByUserId = async (userId) => {
    if (!userId) return 0;

    const db = getFirestore(firebaseApp);
    const q = query(collection(db, 'likes'), where('tutorId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  };

  const countCommentsByUserId = async (userId) => {
    if (!userId) return 0;

    const db = getFirestore(firebaseApp);
    const q = query(collection(db, 'comments'), where('tutorId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  };

  const countVideosByUserId = async (userId) => {
    if (!userId) return 0;

    const db = getFirestore(firebaseApp);
    const q = query(collection(db, 'videos'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  };

  const formatDate = (dateString) => {
    // Implement your date formatting logic here
    return dateString; // Placeholder, replace with actual logic
  };


  const formatCount = (count) => {
    if (typeof count === 'undefined' || count === null) {
        return 0;
    } else if (count === 0) {
        return count;
    } else if (count < 10) {
        return `0${count}`;
    } else if (count >= 1000) {
        return `${Math.floor(count / 1000)}k`;
    } else {
        return count;
    }
  };

  return (
    <>
      <UserHeader />
      {tutor ? (
        <section className="tutor-profile">
          <h1 className="heading">Profile Details</h1>
          <div className="details">
            <div className="tutor">
              <img src={tutor.photoURL} alt="" />
              <h3>{tutor.displayName}</h3>
              <span>{tutor.profession}</span>
            </div>
            <div className="flex">
              <p>Total Playlists : <span>{formatCount(tutor.playlistCount)}</span></p>
              <p>Total Content : <span>{formatCount(videosCount)}</span></p>
              <p>Total Likes : <span>{formatCount(likesCount)}</span></p>
              <p>Total Comments : <span>{formatCount(commentsCount)}</span></p>
            </div>
          </div>
        </section>
      ) : (
        <div style={{padding:'10rem'}}>
          <p className='empty'>Tutor not found.</p>
        </div>
      )}

      {tutor && playlists.length > 0 && (
        <section className="Viewcourses">
          <h1 className="heading">Our Courses</h1>
          <div className="box-container">
            {playlists.map((playlist, index) => (
              <div className="box" key={index}>
                <div className="tutor">
                  <img src={playlist.userProfilePhoto} alt='Tutor Profile' />
                  <div>
                    <h3>{playlist.userName}</h3>
                    <span>{formatDate(playlist.date)}</span>
                  </div>
                </div>
                <img src={playlist.thumbnail} alt='Courses' className="thumb" />
                <h3 className="title">{playlist.title}</h3>
                <Link to={`/User/ViewPlaylist/${playlist.id}`} className="inline-btn">View Playlist</Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export default TeacherProfile;