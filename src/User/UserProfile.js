import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBookmark, FaComment, FaHeart } from 'react-icons/fa';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from '../Firebase';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import UserHeader from '../Header/UserHeader';
import './UserProfile.css';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [totalPlaylists, setTotalPlaylists] = useState(0);
    const [totalLikedTutorials, setTotalLikedTutorials] = useState(0);
    const [totalVideoComments, setTotalVideoComments] = useState(0);

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const fetchUser = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                try {
                    const db = getFirestore(firebaseApp);

                    // Count saved playlists
                    const savedPlaylistsQuery = query(collection(db, 'savedPlaylists'), where('userId', '==', user.uid));
                    const savedPlaylistsSnapshot = await getDocs(savedPlaylistsQuery);
                    const savedPlaylistsCount = savedPlaylistsSnapshot.size;
                    setTotalPlaylists(savedPlaylistsCount);

                    // Count liked tutorials
                    const likedTutorialsQuery = query(collection(db, 'likes'), where('userId', '==', user.uid));
                    const likedTutorialsSnapshot = await getDocs(likedTutorialsQuery);
                    const likedTutorialsCount = likedTutorialsSnapshot.size;
                    setTotalLikedTutorials(likedTutorialsCount);

                    // Count video comments
                    const videoCommentsQuery = query(collection(db, 'comments'), where('userId', '==', user.uid));
                    const videoCommentsSnapshot = await getDocs(videoCommentsQuery);
                    const videoCommentsCount = videoCommentsSnapshot.size;
                    setTotalVideoComments(videoCommentsCount);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    // Handle error here
                }
            }
        });
        return () => fetchUser();
    }, []);

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
            {user ? (
                <>
                    <UserHeader />
                    <section className="Userprofile">
                        <h1 className="heading">Profile Details</h1>
                        <div className="details">
                            <div className="user">
                                <img src={user.photoURL} alt="" />
                                <h3>{user.displayName}</h3>
                                <p>Student</p>
                                <Link to="/User/UpdateProfile" className="inline-btn">Update Profile</Link>
                            </div>
                            <div className="box-container">
                                <div className="box">
                                    <div className="flex">
                                        <i><FaBookmark /></i>
                                        <div>
                                            <h3>{formatCount(totalPlaylists)}</h3>
                                            <span>Saved Playlists</span>
                                        </div>
                                        <Link to={`/User/Bookmark/${user.uid}`} className="inline-btn">View Playlist</Link>
                                    </div>
                                </div>
                                <div className="box">
                                    <div className="flex">
                                        <i><FaHeart /></i>
                                        <div>
                                            <h3>{formatCount(totalLikedTutorials)}</h3>
                                            <span>Liked Tutorials</span>
                                        </div>
                                        <Link to="/User/Likes" className="inline-btn">View Liked</Link>
                                    </div>
                                </div>
                                <div className="box">
                                    <div className="flex">
                                        <i><FaComment /></i>
                                        <div>
                                            <h3>{formatCount(totalVideoComments)}</h3>
                                            <span>Video Comments</span>
                                        </div>
                                        <Link to="/User/UserComment" className="inline-btn">View Comments</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            ) : (
                <>
                    <UserHeader />
                    <p className='empty' style={{ margin: '4rem' }}>No User Found</p>
                </>
            )}
        </>
    );
}

export default UserProfile;