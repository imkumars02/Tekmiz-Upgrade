import React, { useEffect, useState } from 'react';
import { FaCalendar, FaDotCircle } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import AdminHeader from '../Header/AdminHeader';
import { firebaseApp } from '../Firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';

const SearchPage = () => {
    const location = useLocation();
    const searchQuery = new URLSearchParams(location.search).get('query');
    const [tutor, setTutor] = useState([]);
    const [user, setUser] = useState(null);
    const [playlist, setPlaylist] = useState([]);
    const [content, setContent] = useState([]);
    const [contentCount, setContentCount] = useState({});
    const [noDataFound, setNoDataFound] = useState(false);

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchTutorFromPlaylist = async () => {
            try {
                const db = getFirestore(firebaseApp);
                const q = query(collection(db, 'playlists'), where('title', '>=', searchQuery));
                const querySnapshot = await getDocs(q);
                const fetchedTutor = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    fetchedTutor.push({
                        id: data.userId.userId,
                        ...doc.data()
                    });
                });
                setTutor(fetchedTutor);
            } catch (error) {
                alert('Error fetching courses:');
            }
        };
        fetchTutorFromPlaylist();
    }, [searchQuery]);

    useEffect(() => {
        if (searchQuery) {
            const fetchUser = async () => {
                try {
                    const db = getFirestore(firebaseApp);
                    const q = query(collection(db, 'playlists'));
                    const querySnapshot = await getDocs(q);
                    const fetchedTutor = [];

                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        const title = data.title.toLowerCase();
                        const normalizedSearchQuery = searchQuery.toLowerCase();

                        if (title.includes(normalizedSearchQuery)) {
                            fetchedTutor.push({
                                id: data.userId,
                                ...data
                            });
                        }
                    });

                    setTutor(fetchedTutor);
                } catch (error) {
                    // a('Error fetching tutors:', error);
                }
            };

            fetchUser();
        }
    }, [searchQuery]);

    useEffect(() => {
        const fetchPlaylistByTutorId = async () => {
            try {
                if (user && tutor.length > 0 && user.uid === tutor[0].id) {
                    const db = getFirestore(firebaseApp);
                    const q = query(collection(db, 'playlists'), where('userId', '==', user.uid));
                    const querySnapshot = await getDocs(q);
                    const fetchedPlaylists = [];
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        fetchedPlaylists.push({
                            id: doc.id,
                            ...data
                        });
                    });
                    setPlaylist(fetchedPlaylists);


                    const cn = query(collection(db, 'videos'), where('userId', '==', user.uid));
                    const snapshot = await getDocs(cn);
                    const fetchedContent = [];
                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        fetchedContent.push({
                            id: doc.id,
                            ...data
                        });
                    });
                    setContent(fetchedContent);

                    // Count content by playlistId
                    const contentCountMap = {};
                    for (const playlist of fetchedPlaylists) {
                        const contentQ = query(collection(db, 'videos'), where('playlistId', '==', playlist.id));
                        const contentQuerySnapshot = await getDocs(contentQ);
                        contentCountMap[playlist.id] = contentQuerySnapshot.size;
                    }
                    setContentCount(contentCountMap);

                    // Set noDataFound to true if both playlists and contents are empty
                    if (fetchedPlaylists.length === 0 && fetchedContent.length === 0) {
                        setNoDataFound(true);
                    } else {
                        setNoDataFound(false);
                    }
                }
            } catch (error) {
                // console.error('Error fetching playlists by tutor id:', error);
            }
        };

        fetchPlaylistByTutorId();
    }, [user, tutor]);

    const handleDeleteVideo = async (contentId) => {
        if (window.confirm('Delete this video?')) {
            try {
                const db = getFirestore(firebaseApp);

                // Delete content from the likes table
                const likesQuerySnapshot = await getDocs(query(collection(db, 'likes'), where('contentId', '==', contentId)));
                likesQuerySnapshot.forEach(async (doc) => {
                    await deleteDoc(doc.ref);
                });

                // Delete content from the contentView table
                const contentViewQuerySnapshot = await getDocs(query(collection(db, 'contentView'), where('contentId', '==', contentId)));
                contentViewQuerySnapshot.forEach(async (doc) => {
                    await deleteDoc(doc.ref);
                });

                // Delete Content from the comments table
                const contentCommentSnapshot = await getDocs(query(collection(db,'comments'), where('contentId','==',contentId)));
                contentCommentSnapshot.forEach(async (doc)=>{
                    await deleteDoc(doc.ref);
                });

                // Delete content from the videos table
                await deleteDoc(doc(db, 'videos', contentId));

                // Update state to remove deleted content
                setContent(prevContent => prevContent.filter(item => item.id !== contentId));
                // Optionally, you might want to update content count here
            } catch (error) {
                console.error('Error deleting video:', error);
            }
        }
    };

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
                setPlaylist(prevPlaylist => prevPlaylist.filter(item => item.id !== playlistId));
                // Optionally, you might want to update content count here
            } catch (error) {
                console.error('Error deleting playlist:', error);
            }
        }
    };
    
    const handleToggleDescription = (playlistId) => {
        setPlaylist(prevPlaylist => prevPlaylist.map(item => {
            if (item.id === playlistId) {
                return {
                    ...item,
                    showFullDescription: !item.showFullDescription
                };
            }
            return item;
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

    if (user === null) {
        return null; // or loading indicator
    }

    return (
        <div>
            <AdminHeader />

            <section className="contents">
                <h1 className="heading">Contents</h1>
                <div className="box-container">
                    {content.length === 0 && <p className='empty'>No contents found.</p>}
                    {!noDataFound && content.map((item) => (
                        <div className="box" key={item.id}>
                            <div className="flex">
                                <div>{item.status === 'Active' ? (<i><FaDotCircle style={{ color: 'limegreen' }} /></i>) : (<i><FaDotCircle style={{ color: 'red' }} /></i>)}<span>{item.status}</span></div>
                                <div><i><FaCalendar /></i><span>{item.date}</span></div>
                            </div>
                            <img src={item.thumbnailUrl} className="thumb" alt="" />
                            <h3 className="title">{item.title}</h3>
                            <form className="flex-btn">
                                <input type="hidden" name="video_id" value={item.id} />
                                <Link to={`/Admin/UpdateContent/${item.id}`} className="option-btn">Update</Link>
                                <input type="button" value="Delete" className="delete-btn" onClick={() => handleDeleteVideo(item.id)} />
                            </form>
                            <Link to={`/Admin/ViewContent/${item.id}`} className="btn">View Content</Link>
                        </div>
                    ))}
                </div>
            </section>

            <section className="playlists">
                <h1 className="heading">Playlists</h1>
                <div className="box-container">
                    {playlist.length === 0 && <p className='empty'>No playlists found.</p>}
                    {!noDataFound && playlist.length > 0 && playlist.map((item) => (
                        <div className="box" key={item.id}>
                            <div className="flex">
                                <div>{item.status === 'Active' ? (<i><FaDotCircle style={{ color: 'limegreen' }} /></i>) : (<i><FaDotCircle style={{ color: 'red' }} /></i>)}<span>{item.status}</span></div>
                                <div><i><FaCalendar /></i><span>{item.date}</span></div>
                            </div>
                            <div className="thumb">
                                <span>{formatCount(contentCount[item.id])}</span>
                                <img src={item.thumbnail} alt="" />
                            </div>
                            <h3 className="title">{item.title}</h3>
                            <p className="description">
                                {item.showFullDescription ? item.description : `${item.description.slice(0, 70)}...`}
                                {item.description.length >= 70 &&
                                    <button onClick={() => handleToggleDescription(item.id)}>
                                        {item.showFullDescription ? "Less" : "More"}
                                    </button>
                                }
                            </p>
                            <form className="flex-btn">
                                <Link to={`/Admin/UpdatePlaylist/${item.id}`} className="option-btn">Update</Link>
                                <input type="button" value="Delete" className="delete-btn" onClick={() => handleDeletePlaylist(item.id)} />
                            </form>
                            <Link to={`/Admin/ViewPlaylist/${item.id}`} className="btn">View Playlist</Link>
                        </div>
                    ))}
                </div>
            </section>

            {content.length === 0 && playlist.length === 0 && (
                <div>
                    <p className='empty'>No results found. Please search for something else.</p>
                </div>
            )}
        </div>
    )
}

export default SearchPage;