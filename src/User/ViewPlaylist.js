import { useParams, Link } from 'react-router-dom';
import UserHeader from '../Header/UserHeader';
import './ViewPlaylist.css';
import React, { useEffect, useState } from 'react';
import {
    getFirestore,
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    Timestamp,
    addDoc,
    setDoc,
    deleteDoc
} from 'firebase/firestore';
import { firebaseApp } from '../Firebase';
import { FaBookmark, FaCalendar, FaPlay } from 'react-icons/fa';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const ViewPlaylist = () => {
    const [user, setUser] = useState(null);
    const { playlistId } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [tutor, setTutor] = useState(null);
    const [content, setContent] = useState([]);
    const [countContent, setCountContent] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);

    useEffect(()=>{
        document.title='Tekmiz - Playlist';
    });

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const unsubscribe = onAuthStateChanged(auth, async user => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const db = getFirestore(firebaseApp);
                const playlistRef = doc(db, 'playlists', playlistId);
                const playlistDoc = await getDoc(playlistRef);
                if (playlistDoc.exists()) {
                    const playlistData = playlistDoc.data();
                    setPlaylist(playlistData);
                    const tutorRef = doc(db, 'tutor', playlistData.userId);
                    const tutorDoc = await getDoc(tutorRef);
                    if (tutorDoc.exists()) {
                        const tutorData = tutorDoc.data();
                        setTutor(tutorData);
                    }
                } else {
                    // console.log('No such playlist document!');
                }
            } catch (error) {
                // console.error('Error fetching playlist:', error);
            }
        };

        const fetchContent = async () => {
            try {
                const db = getFirestore(firebaseApp);
                const contentQuery = query(collection(db, 'videos'), where('playlistId', '==', playlistId));
                const contentSnapshot = await getDocs(contentQuery);
                if (!contentSnapshot.empty) {
                    const contentData = contentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setContent(contentData);
                    setCountContent(contentData.length);
                }
            } catch (error) {
                // console.error('Error fetching content:', error);
            }
        };

        const checkSavedPlaylist = async () => {
            try {
                const db = getFirestore(firebaseApp);
                if (user) {
                    const savedPlaylistRef = doc(db, `savedPlaylists/${playlistId}_${user.uid}`);
                    const savedPlaylistDoc = await getDoc(savedPlaylistRef);
                    setIsSaved(savedPlaylistDoc.exists());
                }
            } catch (error) {
                // console.error('Error checking saved playlist:', error);
            }
        };

        if (playlistId) {
            fetchPlaylist();
            fetchContent();
            checkSavedPlaylist();
        }
    }, [playlistId, user]);

    const handleSavePlaylist = async () => {
        try {
            const db = getFirestore(firebaseApp);
            if (user) {
                const savedPlaylistRef = doc(db, 'savedPlaylists', `${playlistId}_${user.uid}`);
                if (isSaved) {
                    await deleteDoc(savedPlaylistRef);
                    setIsSaved(false);
                } else {
                    await setDoc(savedPlaylistRef, {
                        userId: user.uid,
                        playlistId: playlistId,
                        tutorId: playlist.userId,
                        date: new Date().toISOString()
                    });
                    setIsSaved(true);
                }
            }
        } catch (error) {
            // console.error('Error saving playlist:', error);
        }
    };

    const handleContentView = async (contentId, userId) => {
        try {
            console.log("Content ID:", contentId); // Check if contentId is defined
            const db = getFirestore(firebaseApp);
            const playlistViewCollection = collection(db, 'contentView');
            const currentDate = Timestamp.now();
            await addDoc(playlistViewCollection, {
                userId: userId,
                playlistId: playlistId,
                tutorId: tutor ? tutor.userId : null,
                contentId: contentId,
                date: currentDate
            });
            // console.log('Content view added successfully.');
        } catch (error) {
            // console.error('Error adding document:', error);
        }
    };

    const toggleDescription = () => {
        setShowFullDescription(!showFullDescription);
    };
    const formatCount = (count) => {
        if(count === 0){
            return count;
        }
        else if (count < 10) {
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
            {playlist && (
                <>
                    <section className="ViewPlaylist">
                        <h1 className="heading">Playlist Details</h1>
                        <div className="row">
                            <div className="col">
                                <form action="" method="post" className="save-list">
                                    <input type="hidden" name="list_id" value={playlist.id} />
                                    <button type="button" name="save_list" value={playlist.id} onClick={handleSavePlaylist}>
                                        <i><FaBookmark /></i><span>{isSaved ? 'Saved' : 'Save Playlist'}</span>
                                    </button>
                                </form>
                                <div className="thumb">
                                    <span>{formatCount(countContent)} Videos</span>
                                    <img src={playlist.thumbnail} alt="" />
                                </div>
                            </div>
                            <div className="col">
                                <div className="tutor">
                                    {tutor && (
                                        <>
                                            <img src={tutor.photoURL} alt="" />
                                            <div>
                                                <h3>{tutor.displayName}</h3>
                                                <span>{tutor.profession}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="details">
                                    <h3>{playlist.title}</h3>
                                    <p className="description">
                                        {playlist.description && (showFullDescription ? playlist.description : playlist.description.slice(0, 100))}
                                        {playlist.description && playlist.description.length > 100 && (
                                            <button onClick={toggleDescription} className='btn' style={{ width: '10rem', height: '4.5rem' }}>
                                                {showFullDescription ? 'Less' : 'More'}
                                            </button>
                                        )}
                                    </p>
                                    <div className="date"><i><FaCalendar /></i><span>{playlist.date}</span></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="Videos-container">
                        <h1 className="heading">Playlist Videos</h1>
                        {countContent !== null && countContent !== 0 ? (
                            <div className="box-container">
                                {/* Map through the content array to display each video */}
                                {content.map((video, index) => (
                                    <Link
                                        key={index}
                                        to={`/User/WatchVideo/${video.id}`}
                                        className="box"
                                        onClick={() => handleContentView(video.id, user.uid)}
                                    >
                                        <i><FaPlay /></i>
                                        <img src={video.thumbnailUrl} alt="" />
                                        <h3>{video.title}</h3>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className='empty'>No videos available</p>
                        )}
                    </section>
                </>
            )}
        </>
    );
};

export default ViewPlaylist;