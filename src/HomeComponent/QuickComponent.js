import React, { useEffect, useState } from 'react';
import './QuickComponent.css';
import { Link, useNavigate } from 'react-router-dom';
import { FaCode, FaChartBar, FaPen, FaChartLine, FaMusic, FaCamera, FaCog, FaVial, FaHtml5, FaCss3, FaReact, FaPhp, FaBootstrap } from "react-icons/fa";
import { IoLogoJavascript } from 'react-icons/io5';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { firebaseApp } from '../Firebase';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';

const QuickComponent = () => {
    const [user, setUser] = useState(null);
    const [savedPlaylistCount, setSavedPlaylistCount] = useState(0); // State to store the total saved playlist count
    const [savedLikes,setSavedLikes]=useState(0);
    const [savedComment,setSavedComments]=useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const fetchUser = onAuthStateChanged(auth, async user => {
            if (user) {
                setUser(user);
                await fetchSavedPlaylistCount(user.uid); // Fetch saved playlist count when user is authenticated
                await fetchSavedLikesCount(user.uid);
                await fetchSavedCommentsCount(user.uid);
            } else {
                setUser(null);
                setSavedPlaylistCount(0); // Reset saved playlist count if user is not authenticated
                setSavedLikes(0);
                setSavedComments(0);
            }
        });
        return () => fetchUser();
    }, []);

    const fetchSavedPlaylistCount = async (userId) => {
        try {
            const db = getFirestore(firebaseApp);
            const savedPlaylistRef = collection(db, 'savedPlaylists');
            const savedPlaylistQuery = query(savedPlaylistRef, where('userId', '==', userId));
            const snapshot = await getDocs(savedPlaylistQuery);
            setSavedPlaylistCount(snapshot.size); // Set the total saved playlist count
        } catch (error) {
            console.error('Error fetching saved playlist count:', error);
        }

    };
    const fetchSavedLikesCount = async (userId) => {
        try {
            const db = getFirestore(firebaseApp);
            const savedPlaylistRef = collection(db, 'likes');
            const savedPlaylistQuery = query(savedPlaylistRef, where('userId', '==', userId));
            const snapshot = await getDocs(savedPlaylistQuery);
            setSavedLikes(snapshot.size); // Set the total saved playlist count
        } catch (error) {
            console.error('Error fetching saved playlist count:', error);
        }

    };
    const fetchSavedCommentsCount = async (userId) => {
        try {
            const db = getFirestore(firebaseApp);
            const savedPlaylistRef = collection(db, 'comments');
            const savedPlaylistQuery = query(savedPlaylistRef, where('userId', '==', userId));
            const snapshot = await getDocs(savedPlaylistQuery);
            setSavedComments(snapshot.size); // Set the total saved playlist count
        } catch (error) {
            console.error('Error fetching saved playlist count:', error);
        }

    };

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

    const handleLogout = async () => {
        try {
            const auth = getAuth(firebaseApp);
            await signOut(auth);
            navigate('/Admin/AdminLogin');
        } catch (error) {
            alert('Failed');
            navigate('/');
        }
    }

    return (
        <section className="quick-select">
            <h1 className="heading">Quick Options</h1>
            <div className="box-container">
                <div className="box">
                {user ? (
                        <>
                            <h2 className="titles">Likes and Comments</h2>
                            <p>Total Likes: <span>{formatCount(savedLikes)}</span></p>
                            <Link to="/User/Likes" className="inline-btn">View Likes</Link>
                            <p>Total Comments: <span>{formatCount(savedComment)}</span></p>
                            <Link to="/User/UserComment" className="inline-btn">View Comments</Link>
                            <p>Saved Playlists: <span>{formatCount(savedPlaylistCount)}</span></p>
                            <Link to={`/User/Bookmark/${user.uid}`} className="inline-btn">View Playlists</Link>
                        </>
                    ) : (
                        <>
                            <h3 className='heading'>Please !! Login First</h3>
                            <Link to={'/UserLogin'} className="option-btn">Login</Link>
                        </>
                    )}
                </div>

            <div className="box">
                <h2 className="titles">Top Categaries</h2>
                <div className="flex">
                    <Link to="#"><i><FaCode /></i><span>Development</span></Link>
                    <Link to="#"><i><FaChartBar /></i><span>Business</span></Link>
                    <Link to="#"><i><FaPen /></i><span>Design</span></Link>
                    <Link to="#"><i><FaChartLine /></i><span>Marketing</span></Link>
                    <Link to="#"><i><FaMusic /></i><span>Music</span></Link>
                    <Link to="#"><i><FaCamera /></i><span>Photography</span></Link>
                    <Link to="#"><i><FaCog /></i><span>Software</span></Link>
                    <Link to="#"><i><FaVial /></i><span>Science</span></Link>
                </div>
            </div>


            <div className="box">
                <h2 className="titles">Popular Categaries</h2>
                <div className="flex">
                    <Link to='#'><i><FaHtml5 /></i><span>HTML</span></Link>
                    <Link to='#'><i><FaCss3 /></i><span>CSS</span></Link>
                    <Link to='#'><i><IoLogoJavascript /></i><span>Javascript</span></Link>
                    <Link to='#'><i><FaReact /></i><span>React</span></Link>
                    <Link to='#'><i><FaPhp /></i><span>PHP</span></Link>
                    <Link to='#'><i><FaBootstrap /></i><span>Boostrap</span></Link>
                    
                </div>
            </div>



            <div className="box tutor">
                <h2 className="titles">Become Teacher</h2>
                <p>To share your knowledge and expertise with learners worldwide on our dynamic Tekmiz platform. Join our community of educators today !!</p>
                <Link onClick={handleLogout} className="inline-btn">Get Started</Link>
            </div>
        </div>
    </section>
  )
}

export default QuickComponent;