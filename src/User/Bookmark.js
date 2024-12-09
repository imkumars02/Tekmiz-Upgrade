import React, { useEffect, useState } from 'react';
import '../HomeComponent/Courses.css'
import { Link, useParams } from 'react-router-dom';
import UserHeader from '../Header/UserHeader';
import { getFirestore, collection, query, where, getDocs, getDoc, doc,addDoc,Timestamp } from 'firebase/firestore';
import { firebaseApp } from '../Firebase';

const Bookmark = () => {
    const { userId } = useParams();
    const [userDetail, setUserDetail] = useState(null);
    const [playlistDetails, setPlaylistDetails] = useState([]);

    useEffect(() => {
        const fetchUserDetail = async () => {
            const db = getFirestore(firebaseApp);
            try {
                const userQuery = query(collection(db, 'savedPlaylists'), where('userId', '==', userId));
                const userDocSnapshot = await getDocs(userQuery);
                if (!userDocSnapshot.empty) {
                    const userData = [];
                    userDocSnapshot.forEach(doc => {
                        userData.push(doc.data());
                    });
                    setUserDetail(userData);

                    const playlistIds = userData.map(item => item.playlistId);
                    const playlistPromises = playlistIds.map(playlistId => getDoc(doc(db, 'playlists', playlistId)));
                    const playlistDocs = await Promise.all(playlistPromises);
                    const playlistData = playlistDocs.map(playlistDoc => {
                        if (playlistDoc.exists()) {
                            return {
                                id: playlistDoc.id,
                                ...playlistDoc.data()
                            };
                        } else {
                            return null;
                        }
                    }).filter(Boolean);
                    setPlaylistDetails(playlistData);
                } else {
                    alert('No Bookmark Added Yet !!');
                }
            } catch (error) {
                alert('Error fetching user details:', error);
            }
        };

        if (userId) {
            fetchUserDetail();
        }
    }, [userId,userDetail]);

    const handleViewPlaylist = async (playlistId) => {
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
            console.error('Error adding document:', error);
        }
    };

    return (
        <div>
            <UserHeader />
            <section className="Courses">
                <h1 className="heading">Bookmarked Playlists</h1>
                <div className="box-container">
                    {playlistDetails.length === 0 ? (
                        <div className='empty'>No bookmarks added yet.</div>
                    ) : (
                        playlistDetails.map((playlist, index) => (
                            <div key={index} className="box">
                                <div className="tutor">
                                    <img src={playlist.userProfilePhoto} alt="" />
                                    <div>
                                        <h3>{playlist.userName}</h3>
                                        <span>{playlist.date}</span>
                                    </div>
                                </div>
                                <img src={playlist.thumbnail} className="thumb" alt="" />
                                <h3 className="title">{playlist.title}</h3>
                                <Link to={`/User/ViewPlaylist/${playlist.id}`} className="inline-btn" onClick={() => handleViewPlaylist(playlist.id)}>View Playlist</Link>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}

export default Bookmark;