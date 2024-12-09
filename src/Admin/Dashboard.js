import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminHeader from '../Header/AdminHeader';
import './Dashboard.css';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
// Import named exports 'firebaseApp' and 'firestore' from '../Firebase'
import { firebaseApp } from '../Firebase'; // Adjust the import path if necessary
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore'; // Import getFirestore to initialize Firestore instance

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [playlistCount, setPlaylistCount] = useState(0); // State to hold the playlist count
    const [contentCount, setContentCount] = useState(0); // State to hold the playlist count
    const [error, setError] = useState(null); // State to hold any potential errors
    const [likesCount,setLikesCount]=useState(0);
    const [commentCount,setCommentCount]=useState(0);



    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const db = getFirestore(firebaseApp); // Initialize Firestore instance using getFirestore()
        const unsubscribe = onAuthStateChanged(auth, async authUser => {
            if (authUser) {
                setUser(authUser);
                try {
                    // Query the database to count the playlists
                    const q = query(collection(db, 'playlists'), where('userId', '==', authUser.uid));
                    const querySnapshot = await getDocs(q);
                    setPlaylistCount(querySnapshot.size);

                    const cn = query(collection(db, 'videos'), where('userId', '==', authUser.uid));
                    const querySnapshot1 = await getDocs(cn);
                    setContentCount(querySnapshot1.size);

                    const like = query(collection(db, 'likes'), where('tutorId', '==', authUser.uid));
                    const querySnapshot2 = await getDocs(like);
                    setLikesCount(querySnapshot2.size);

                    const comment = query(collection(db, 'comments'), where('tutorId', '==', authUser.uid));
                    const querySnapshot3 = await getDocs(comment);
                    setCommentCount(querySnapshot3.size);




                } catch (error) {
                    setError(error.message); // Set error message if query fails
                }
            } else {
                setUser(null);
                setPlaylistCount(0); // Reset count if no user is logged in
            }
        });

        return () => unsubscribe();
    }, []);

    if (error) {
        return <div>Error: {error}</div>; // Render error message if an error occurred
    }

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
            <section className="dashboard">
                <h1 className="heading">Dashboard</h1>
                <div>
                    {user ? (
                        <div className="box-container">
                            <div className="box">
                                <h3>!! Welcome !!</h3>
                                <p>{user.displayName}</p>
                                <Link to="/Admin/ViewProfile" className="btn">View Profile</Link>
                            </div>
                            <div className="box">
                                <h3>{formatCount(contentCount)}</h3>
                                <p>Total Content</p>
                                <Link to={'/Admin/AddContent'} className="btn">Add New Content</Link>
                            </div>
                            <div className="box">
                                <h3>{formatCount(playlistCount)}</h3> {/* Display the playlist count */}
                                <p>Total Playlists</p>
                                <Link to={`/Admin/AddPlaylist`} className="btn">Add New Playlist</Link>
                            </div>
                            {/* Other boxes */}
                            <div className="box">
                                <h3>{formatCount(likesCount)}</h3> {/*Count Total Likes*/}
                                <p>Total Likes</p>
                                <Link to="/Admin/AdminContent" className="btn">View Contents</Link>
                            </div>
                            <div className="box">
                                <h3>{formatCount(commentCount)}</h3> {/*Count Total Comments*/}
                                <p>Total Comments</p>
                                <Link to="/Admin/Dashboard" className="btn">View Comments</Link>
                            </div>
                            <div className="box">
                                <h3>{formatCount(playlistCount)}</h3> {/*Count Total Playlists*/}
                                <p>Total Playlists</p>
                                <Link to="/Admin/PlaylistViewer" className="btn">Playlists Viewer</Link>
                            </div>

                            <div className="box">
                                <h3>{formatCount(contentCount)}</h3> {/*Count Total Contents*/}
                                <p>Total Content</p>
                                <Link to="/Admin/ContentViewer" className="btn">Content Viewer</Link>
                            </div>
                        </div>
                    ) : (
                        <div className="box-container">
                            <div className="box">
                                <h3>Welcome!</h3>
                                <p>No Name</p>
                                <Link to="/Admin/ViewProfile" className="btn">View Profile</Link>
                            </div>
                            <div className="box">
                                <h3>Quick Select</h3>
                                <p>Login or Register</p>
                                <div className="flex-btn">
                                    <Link to="#" className="option-btn">Login</Link>
                                    <Link to="#" className="option-btn">Register</Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

export default Dashboard;