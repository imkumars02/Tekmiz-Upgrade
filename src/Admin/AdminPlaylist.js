import { Link } from 'react-router-dom';
import AdminHeader from '../Header/AdminHeader';
import './AdminPlaylist.css';
import React, { useEffect, useState } from 'react';
import { FaCircleDot } from 'react-icons/fa6';
import { FaCalendar } from 'react-icons/fa';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from '../Firebase';
import { collection, getFirestore, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

const AdminPlaylist = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth(firebaseApp);

        const fetchUser = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const db = getFirestore(firebaseApp);
                    const q = query(collection(db, 'playlists'), where('userId', '==', user.uid));
                    const querySnapshot = await getDocs(q);
                    const fetchedPlaylists = [];
                    querySnapshot.forEach((doc) => {
                        fetchedPlaylists.push({ id: doc.id, ...doc.data() });
                    });
                    setPlaylists(fetchedPlaylists);
                } catch (error) {
                    console.error('Error fetching playlists:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                // Handle case where user is not authenticated
                setLoading(false);
            }
        });

        return () => fetchUser();
    }, []);

    const [videosCount, setVideosCount] = useState({});

    useEffect(() => {
        const db = getFirestore(firebaseApp);
        const fetchVideosCount = async () => {
            const videosCountData = {};
            await Promise.all(playlists.map(async (playlist) => {
                const videosQuery = query(collection(db, 'videos'), where('playlistId', '==', playlist.id));
                const videosSnapshot = await getDocs(videosQuery);
                videosCountData[playlist.id] = videosSnapshot.size;
            }));
            setVideosCount(videosCountData);
        };
        fetchVideosCount();
    }, [playlists]);

    const handleDeletePlaylist = async (playlistId) => {
        if (window.confirm('Delete this playlist?')) {
            try {
                const db = getFirestore(firebaseApp);
                const playlistRef = doc(db, 'playlists', playlistId);
    
                // Get all videos in the playlist
                const videosQuerySnapshot = await getDocs(query(collection(db, 'videos'), where('playlistId', '==', playlistId)));
    
                // Delete all videos in the playlist
                videosQuerySnapshot.forEach(async (doc) => {
                    await deleteDoc(doc.ref);
                });
    
                // Delete all likes in the playlist
                const likesSnapshot = await getDocs(query(collection(db, 'likes'), where('playlistId', '==', playlistId)));
                likesSnapshot.forEach(async (doc) => {
                    await deleteDoc(doc.ref);
                });
    
                // Delete all comments in the playlist
                const commentsSnapshot = await getDocs(query(collection(db, 'comments'), where('playlistId', '==', playlistId)));
                commentsSnapshot.forEach(async (doc) => {
                    await deleteDoc(doc.ref);
                });

                // Delete content from the likes table
                const likesQuerySnapshot = await getDocs(query(collection(db, 'likes'), where('contentId', '==', playlistId)));
                likesQuerySnapshot.forEach(async (doc) => {
                    await deleteDoc(doc.ref);
                });


                // Delete playlist from the playlistView table
                const playlistViewQuerySnapshot = await getDocs(query(collection(db, 'playlistView'), where('playlistId', '==', playlistId)));
                playlistViewQuerySnapshot.forEach(async (doc) => {
                    await deleteDoc(doc.ref);
                });

                // Delete content from the contentView table
                const contentViewQuerySnapshot = await getDocs(query(collection(db, 'contentView'), where('playlistId', '==', playlistId)));
                contentViewQuerySnapshot.forEach(async (doc) => {
                    await deleteDoc(doc.ref);
                });

                // Delete content from the contentView table
                const savedPlaylistsQuerySnapshot = await getDocs(query(collection(db, 'savedPlaylists'), where('playlistId', '==', playlistId)));
                savedPlaylistsQuerySnapshot.forEach(async (doc) => {
                    await deleteDoc(doc.ref);
                });
    
                // Delete the playlist document
                await deleteDoc(playlistRef);
    
                // Remove the playlist from state
                setPlaylists(prevPlaylist => prevPlaylist.filter(item => item.id !== playlistId));
                // Optionally, you might want to update content count here
            } catch (error) {
                console.error('Error deleting playlist:', error);
            }
        }
    };
    
    // Function to truncate the description if it's longer than 40 words
    const truncateDescription = (description, maxLength) => {
        const words = description.split(' ');
        if (words.length > maxLength) {
            // return words.slice(0, maxLength).join(' ') + '...';
            return words.slice(0, maxLength);
        } else {
            return description;
        }
    };

    // State to manage whether to display full description or truncated
    const [expandedDescriptions, setExpandedDescriptions] = useState({});

    // Function to toggle the description expansion
    const toggleDescription = (playlistId) => {
        setExpandedDescriptions(prevState => ({
            ...prevState,
            [playlistId]: !prevState[playlistId]
        }));
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
        <div>
            <AdminHeader />
            <section className="playlists">
                <h1 className="heading">Added Playlists</h1>
                <div className="box-container">
                    <div className="box" style={{ textAlign: 'center' }}>
                        <h3 className="title" style={{ marginBottom: '0.5rem' }}>Create New Playlist</h3>
                        <Link to="/Admin/AddPlaylist" className="btn">Add Playlist</Link>
                    </div>
                    {loading ? (
                        <div style={{padding:'2rem',fontSize:'2rem'}}>Loading...</div>
                    ) : (
                        <>
                            {playlists.length > 0 ? (
                                <>
                                    {playlists.map((playlist) => (
                                        <div className="box" key={playlist.id}>
                                            <div className="flex">
                                                <div><i><FaCircleDot style={{ color: playlist.status === 'Active' ? 'limegreen' : 'red' }} /></i><span>{playlist.status}</span></div>
                                                <div><i><FaCalendar /></i><span>{playlist.date}</span></div>
                                            </div>
                                            <div className="thumb">
                                                <span>{formatCount(videosCount[playlist.id])}</span>
                                                <img src={playlist.thumbnail} alt="Playlist_Thumbnail" />
                                            </div>
                                            <h3 className="title">{playlist.title}</h3>
                                            {/* Rendering description with "More" button if it's longer than 40 words */} 
                                            <p className="description">
                                                {expandedDescriptions[playlist.id] ? playlist.description : truncateDescription(playlist.description, 15)}
                                                {playlist.description.split(' ').length > 15 && (
                                                    <button className="more-less-btn" onClick={() => toggleDescription(playlist.id)}>
                                                        {expandedDescriptions[playlist.id] ? 'Less' : 'More'}
                                                    </button>
                                                )}
                                            </p>
                                            <form action="" method="post" className="flex-btn">
                                                <Link to={`/Admin/UpdatePlaylist/${playlist.id}`} className="option-btn">Update</Link>
                                                <button type="button" className="delete-btn" onClick={() => handleDeletePlaylist(playlist.id)} name="delete">Delete</button>
                                            </form>
                                            <Link to={`/Admin/AdminViewPlaylist/${playlist.id}`} className="btn">View Playlist</Link>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <p className='empty'>No Playlist Added Yet !!</p>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
};

export default AdminPlaylist;