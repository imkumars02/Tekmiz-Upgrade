import React, { useEffect, useState } from 'react';
import './AdminViewPlaylist.css';
import { FaCalendar, FaDotCircle } from 'react-icons/fa';
import { Link, Navigate, useParams } from 'react-router-dom';
import AdminHeader from '../Header/AdminHeader';
import { firebaseApp } from '../Firebase';
import { getFirestore, doc, deleteDoc, collection, where, getDoc, query, getDocs } from 'firebase/firestore';

const AdminViewPlaylist = () => {
    const { playlistId } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [videos, setVideos] = useState([]);
    const [showFullDescription, setShowFullDescription] = useState(false);
    useEffect(() => {
        const db = getFirestore(firebaseApp);

        const fetchPlaylist = async () => {
            try {
                console.log(playlistId);
                const playlistRef = doc(db, 'playlists', playlistId);
                const playlistSnapshot = await getDoc(playlistRef);

                if (playlistSnapshot.exists()) {
                    setPlaylist({ id: playlistSnapshot.id, ...playlistSnapshot.data() });
                }
            } catch (error) {
                console.error('Error fetching playlist:', error);
            }
        };

        const fetchVideos = async () => {
            try {
                const querySnapshot = await getDocs(
                    query(collection(db, 'videos'), where('playlistId', '==', playlistId))
                );
        
                const fetchedVideos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setVideos(fetchedVideos);
            } catch (error) {
                console.error('Error fetching videos:', error);
            }
        };
        

        fetchPlaylist();
        fetchVideos();
    }, [playlistId]);

    const handleDeletePlaylist = async (playlistId) => {
        if (window.confirm('Are You sure ? Delete this playlist?')) {
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
                setPlaylist(prevPlaylist => prevPlaylist.filter(item => item.id !== playlistId));
                // Optionally, you might want to update content count here

                alert("Deleted Successfully !!");
                Navigate('/Admin/Dashboard');
            } catch (error) {
                console.error('Error deleting playlist:', error);
            }
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
        <div>
            <AdminHeader />
            <section className="playlist-details">
                <h1 className="heading">Playlist Details</h1>
                {playlist && (
                    <div className="row">
                        <div className="thumb">
                            <span>{formatCount(videos.length)}</span>
                            <img src={playlist.thumbnail} alt="Playlist Thumbnail" />
                        </div>
                        <div className="details">
                            <h3 className="title">{playlist.title}</h3>
                            <div className="date"><i><FaCalendar /></i><span>{playlist.date}</span></div>
                            <div className="description">
                                {showFullDescription ? playlist.description : playlist.description.slice(0, 100)}
                                {playlist.description.length > 100 && (
                                    <button onClick={toggleDescription}>
                                        {showFullDescription ? 'Less' : 'More'}
                                    </button>
                                )}
                            </div>
                            <div className="flex-btn">
                                <Link to={`/Admin/UpdatePlaylist/${playlistId}`} className="option-btn">Update Playlist</Link>
                                <button onClick={handleDeletePlaylist(playlistId)} className="delete-btn">Delete Playlist</button>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {playlist && (
                <section className="contents">
                    <h1 className="heading">Playlist Videos</h1>
                    <div className="box-container">
                        {videos.length > 0 ? (
                            videos.map(video => (
                                <div className="box" key={video.id}>
                                    <div className="flex">
                                        <div><i><FaDotCircle /></i><span>{video.status}</span></div>
                                        <div><i><FaCalendar /></i><span>{video.date}</span></div>
                                    </div>
                                    <img src={video.thumbnailUrl} className="thumb" alt="" />
                                    <h3 className="title">{video.title}</h3>
                                    <div className="flex-btn">
                                        <Link to={`/Admin/UpdateContent/${video.id}`} className="option-btn">Update</Link>
                                    </div>
                                    <Link to={`/Admin/ViewContent/${playlist.id}`} className="btn">Watch Video</Link>
                                </div>
                            ))
                        ) : (
                            <div className="empty">No videos added yet</div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
};

export default AdminViewPlaylist;