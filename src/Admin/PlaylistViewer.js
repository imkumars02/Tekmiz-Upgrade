import './PlaylistViewer.css'
import React, { useEffect, useState } from 'react'
import AdminHeader from '../Header/AdminHeader'
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from '../Firebase';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const PlaylistViewer = () => {
    const [playlist, setPlaylist] = useState(null);

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const db = getFirestore(firebaseApp);
        
        const fetchPlaylist = async (userId) => {
            try {
                const playlistCollection = collection(db, 'playlists');
                const querySnapshot = await getDocs(playlistCollection);
                const fetchedPlaylist = [];

                // Use Promise.all to wait for all async operations to complete
                await Promise.all(querySnapshot.docs.map(async (doc) => {
                    const playlistData = doc.data();
                    if (String(playlistData.userId) === userId) {
                        // Fetch total views for the playlist
                        const viewsQuery = query(collection(db, 'playlistView'), where('playlistId', '==', doc.id));
                        const viewsSnapshot = await getDocs(viewsQuery);
                        const totalViews = viewsSnapshot.size;

                        // Add total views to the playlist data
                        fetchedPlaylist.push({ id: doc.id, ...playlistData, totalViews });
                    }
                }));

                setPlaylist(fetchedPlaylist);
            } catch (error) {
                console.error('Error fetching playlists:', error);
            }
        };
        
        // Fetch playlists when user authentication state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchPlaylist(user.uid); // Pass the user's UID to fetchPlaylist function
            }
        });

        return () => unsubscribe(); // Unsubscribe from the onAuthStateChanged listener when component unmounts
    }, []);

    // Function to format date
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Function to format total views
    const formatTotalViews = (totalViews) => {
        if (totalViews === 0) {
            return '0';
        } else if (totalViews < 10) {
            return `0${totalViews}`;
        }
        else if (totalViews < 1000) {
            return totalViews.toString();
        } else if (totalViews < 1000000) {
            return (totalViews / 1000).toFixed(1) + 'k';
        } else {
            return (totalViews / 1000000).toFixed(1) + 'M';
        }
    };

    return (
        <div>
            <AdminHeader />
            <section className="Viewcourses">
                <h1 className="heading">Playlist Viewer</h1>
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
                                <h3 className='viewer'>{formatTotalViews(playlistItem.totalViews)}</h3>
                                <img src={playlistItem.thumbnail} alt='Courses' className="thumb" />
                                <h3 className="title">{playlistItem.title}</h3>
                                <Link to={`/Admin/ViewerList/${playlistItem.id}`} className="inline-btn">Viewer List</Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty">No Courses Added Yet !!</p>
                )}
            </section>
        </div>
    );
}

export default PlaylistViewer;