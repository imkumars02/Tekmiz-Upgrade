import React, { useState, useEffect } from 'react';
import './ViewProfile.css';
import { Link } from 'react-router-dom';
import AdminHeader from '../Header/AdminHeader';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from '../Firebase';

const ViewProfile = () => {
    const [profession, setProfession] = useState('');
    const [user, setUser] = useState(null);
    const [playlistCount, setPlaylistCount] = useState(0);
    const [videoCount, setVideoCount] = useState(0);
    const [likeCount, setLikeCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                fetchUserData(user.uid);
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchUserData = async (userId) => {
        try {
            const db = getFirestore(firebaseApp);

            // Fetch user profession
            const userRef = collection(db, 'tutor');
            const userSnapshot = await getDocs(userRef);
            userSnapshot.forEach((doc) => {
                if (doc.id === userId) {
                    const userData = doc.data();
                    setProfession(userData.profession);
                }
            });

            // Fetch total playlists count
            const playlistRef = collection(db, 'playlists');
            const playlistSnapshot = await getDocs(playlistRef);
            let playlists = 0;
            playlistSnapshot.forEach((doc) => {
                if (doc.data().userId === userId) {
                    playlists++;
                }
            });
            setPlaylistCount(playlists);

            // Fetch total videos count
            const videoRef = collection(db, 'videos');
            const videoSnapshot = await getDocs(videoRef);
            let videos = 0;
            videoSnapshot.forEach((doc) => {
                if (doc.data().userId === userId) {
                    videos++;
                }
            });
            setVideoCount(videos);

            // Fetch total likes count
            const likeRef = collection(db, 'likes');
            const likeSnapshot = await getDocs(likeRef);
            let likes = 0;
            likeSnapshot.forEach((doc) => {
                if (doc.data().userId === userId) {
                    likes++;
                }
            });
            setLikeCount(likes);

            // Fetch total comments count
            const commentRef = collection(db, 'comments');
            const commentSnapshot = await getDocs(commentRef);
            let comments = 0;
            commentSnapshot.forEach((doc) => {
                if (doc.data().userId === userId) {
                    comments++;
                }
            });
            setCommentCount(comments);
        } catch (error) {
            console.error('Error getting document:', error);
        }
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
            <AdminHeader />
            <section className="tutor-profile" style={{ minHeight: 'calc(100vh - 19rem)' }}>
                <h1 className="heading">Profile Details</h1>
                <div className="details">
                    {user ? (
                        <div>
                            <div className="tutor">
                                <img src={user.photoURL} alt="" />
                                <h3>{user.displayName}</h3>
                                <span>{profession}</span>
                                <Link to="/Admin/UpdateAdminProfile" className="inline-btn">Update Profile</Link>
                            </div>
                            <div className="flex">
                                <div className="box">
                                    <span>{formatCount(playlistCount)}</span>
                                    <p>Total Playlists</p>
                                    <Link to={'/Admin/AdminPlaylist'} className="btn">View Playlists</Link>
                                </div>
                                <div className="box">
                                    <span>{formatCount(videoCount)}</span>
                                    <p>Total Videos</p>
                                    <Link to="/Admin/AdminContent" className="btn">View Contents</Link>
                                </div>
                                <div className="box">
                                    <span>{formatCount(likeCount)}</span>
                                    <p>Total Likes</p>
                                    <Link to="/Admin/AdminContent" className="btn">View Contents</Link>
                                </div>
                                <div className="box">
                                    <span>{formatCount(commentCount)}</span>
                                    <p>Total Comments</p>
                                    <Link to="/Admin/Comment" className="btn">View Comments</Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="tutor">
                                <h3>No User Found !!</h3>
                                <Link to="/Admin/AdminLogin" className="inline-btn">Login</Link>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

export default ViewProfile;
