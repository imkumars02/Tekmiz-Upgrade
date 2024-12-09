import UserHeader from './Header/UserHeader';
import { Link } from 'react-router-dom';
import './ViewCourses.css';
import React, { useEffect, useState } from 'react';
import { collection, getDocs, getFirestore, addDoc, Timestamp } from 'firebase/firestore';
import { firebaseApp } from './Firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Empty from './Empty';

const ViewCourses = () => {
    const [playlist, setPlaylist] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    useEffect(()=>{
        document.title='Tekmiz - Courses';
    })

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const fetchUser = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                setIsLoggedIn(true);
            } else {
                setUser(null);
                setIsLoggedIn(false);
            }
        });
        return () => fetchUser();
    }, []);

    useEffect(() => {
        const db = getFirestore(firebaseApp);
        const fetchPlaylist = async () => {
            try {
                const playlistCollection = collection(db, 'playlists');
                const snapshot = await getDocs(playlistCollection);
                const fetchedPlaylist = [];
                snapshot.forEach((doc) => {
                    fetchedPlaylist.push({ id: doc.id, ...doc.data() });
                });
                setPlaylist(fetchedPlaylist);
            } catch (error) {
                // console.error('Error fetching playlists:', error);
            }
        };
        fetchPlaylist();
    }, []);

    // Function to format date
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Function to handle storing playlist view
    const handleViewPlaylist = async (userId, playlistId) => {
        try {
            const db = getFirestore(firebaseApp);
            const playlistViewCollection = collection(db, 'playlistView');
            const currentDate = Timestamp.now();
            await addDoc(playlistViewCollection, {
                userId: userId,
                playlistId: playlistId,
                date: currentDate
            });
        } catch (error) {
            // console.error('Error adding document:', error);
        }
    };

    return (
        <>
            <UserHeader />
            <section className="Viewcourses">
                <h1 className="heading">Our Courses</h1>
                {isLoggedIn ? (
                    <>
                        {playlist && playlist.length > 0 ? (
                            <div className="box-container">
                                {playlist.map((playlistItem, index) => (
                                    <div className="box" key={index}>
                                        <div className="tutor">
                                            <img src={playlistItem.userProfilePhoto} alt='Tutor Profile' />
                                            <div>
                                                <h3>{playlistItem.userName}</h3>
                                                <span>{formatDate(playlistItem.date)}</span>
                                            </div>
                                        </div>
                                        <img src={playlistItem.thumbnail} alt='Courses' className="thumb" />
                                        <h3 className="title">{playlistItem.title}</h3>
                                        <Link
                                            to={`/User/ViewPlaylist/${playlistItem.id}`}
                                            className="inline-btn"
                                            onClick={() => handleViewPlaylist(user.uid, playlistItem.id)}
                                        >
                                            View Playlist
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Empty/>
                        )}
                    </>
                ) : (
                    <p className='empty'>Please <Link to="/UserLogin">Login</Link> first to view courses.</p>
                )}
            </section>
        </>
    );
};

export default ViewCourses;
