import './Courses.css'
import { Link } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { collection, getDocs, getFirestore, addDoc, Timestamp } from 'firebase/firestore'
import { firebaseApp } from '../Firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import Empty from '../Empty'

const Courses = () => {
    const [user,setUser] = useState(null);
    useEffect(()=>{
        const auth = getAuth(firebaseApp);
        const fetchUser = onAuthStateChanged(auth, async (user)=>{
            setUser(user);
        });
        return ()=>fetchUser();
    },[]);
    const [playlist, setPlaylist] = useState(null);
    
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
                console.error('Error fetching playlists:', error);
            }
        };
        fetchPlaylist();
    }, []);

    const handleViewPlaylist = async (userId, playlistId) => {
        try {
            const db = getFirestore(firebaseApp);
            const playlistViewCollection = collection(db, 'playlistView');
            const currentDate = Timestamp.now();
            await addDoc(playlistViewCollection, {
                userId: user.uid,
                playlistId: playlistId,
                date: currentDate
            });
        } catch (error) {
            console.error('Error adding document:', error);
        }
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <section className="Courses">
            <h1 className="heading">Our Courses</h1>
            {user ? (
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
                                    {/* Add onClick handler to trigger adding the playlist view */}
                                    <Link to={`/User/ViewPlaylist/${playlistItem.id}`} className="inline-btn"
                                        onClick={() => handleViewPlaylist(user.uid, playlistItem.id)}>View Playlist</Link>
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
    )
}

export default Courses
