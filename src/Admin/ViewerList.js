import './ViewerList.css';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminHeader from '../Header/AdminHeader';
import { getFirestore, doc, getDoc, getDocs, where, query, collection } from 'firebase/firestore';
import { firebaseApp } from '../Firebase';

const ViewerList = () => {
    const { playlistId } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [users, setUsers] = useState([]);
    const [dates, setDates] = useState([]);
    const [viewersFound, setViewersFound] = useState(true); // Flag to track if viewers are found

    useEffect(() => {
        const db = getFirestore(firebaseApp);
        const fetchPlaylist = async () => {
            try {
                const playlistRef = doc(db, 'playlists', playlistId);
                const playlistSnapshot = await getDoc(playlistRef);
                if (playlistSnapshot.exists()) {
                    const playlistData = playlistSnapshot.data();
                    setPlaylist(playlistData);

                    // Fetch all data associated with the playlistId
                    const playlistViewRef = collection(db, 'playlistView');
                    const playlistViewQuery = query(playlistViewRef, where('playlistId', '==', playlistId));
                    const playlistViewSnapshot = await getDocs(playlistViewQuery);
                    if (!playlistViewSnapshot.empty) {
                        const userData = [];
                        const dateData = [];
                        const userPromises = [];
                        playlistViewSnapshot.forEach(doc => {
                            const playlistViewData = doc.data();
                            const userId = playlistViewData.userId;
                            const timestamp = playlistViewData.date;
                            const formattedDate = new Date(timestamp.seconds * 1000).toLocaleString();
                            userData.push(userId);
                            dateData.push(formattedDate);
                            const userPromise = getUserDetails(db, userId);
                            userPromises.push(userPromise);
                        });
                        setUsers(userData);
                        setDates(dateData);

                        // Resolve all user details promises
                        Promise.all(userPromises).then(userDetails => {
                            setUsers(userDetails);
                        });
                    } else {
                        console.log('No data found for the playlist in playlistView.');
                        setViewersFound(false); // Update flag when no viewers are found
                    }
                } else {
                    // console.log('No such playlist exists!');
                }
            } catch (error) {
                // console.error('Error fetching playlist:', error);
            }
        };

        fetchPlaylist();

        // Cleanup function
        return () => {
            // Any cleanup code here if needed
        };
    }, [playlistId]);

    // Function to fetch user details by userId
    const getUserDetails = async (db, userId) => {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnapshot = await getDoc(userRef);
            if (userSnapshot.exists()) {
                return userSnapshot.data();
            } else {
                // If user not found in users table, try fetching from tutor table
                const tutorRef = doc(db, 'tutor', userId);
                const tutorSnapshot = await getDoc(tutorRef);
                if (tutorSnapshot.exists()) {
                    return tutorSnapshot.data();
                } else {
                    // If user not found in either table
                    // console.log('No user found with userId:', userId);
                    return null;
                }
            }
        } catch (error) {
            // console.error('Error fetching user details:', error);
            return null;
        }
    };

    return (
        <div>
            <AdminHeader />
            <section className="ViewerList">
                <h1 className="heading">Playlist View List</h1>
                {playlist && users.length > 0 && viewersFound && (
                    <div className="show-viewer">
                        {users.map((user, index) => (
                            <div key={index} className="box">
                                <div className="content">
                                    <span>Playlist Date : {playlist.date}</span>
                                    <p>{playlist.title}</p>
                                    <Link to={`/Admin/AdminViewPlaylist/${playlistId}`}>View Playlist</Link>
                                </div>
                                <div className='text'>
                                    {/* Display user data */}
                                    <div className='box'>
                                        <div className="userProfile">
                                            <img src={user ? user.photoURL : ''} alt='User_Profile' />
                                            <div>
                                                <h3>{user ? user.displayName : 'Unknown User'}</h3>
                                                <span>{dates[index]}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Render other details of the playlists here */}
                            </div>
                        ))}
                    </div>
                )}
                {!viewersFound && (
                    <p className='empty'>No viewers found for this playlist.</p>
                )}
            </section>
        </div>
    );
};

export default ViewerList;