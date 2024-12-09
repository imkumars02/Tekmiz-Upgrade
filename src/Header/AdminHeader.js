import React, { useEffect, useState } from 'react';
import './AdminHeader.css';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaSearch, FaUser, FaSun, FaHome, FaGraduationCap, FaComment, FaTimes, FaMoon, FaDashcube, FaBook } from 'react-icons/fa';
import pic3 from '../images/pic-3.jpg';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { firebaseApp } from '../Firebase';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { FaBarsStaggered, FaRightFromBracket } from 'react-icons/fa6';


const AdminHeader = () => {
    const navigate = useNavigate();
    const [profession, setProfession] = useState('');
    const [user, setUser] = useState(null);
    const [darkMode, setDarkMode] = useState(localStorage.getItem('dark-mode') === 'enabled');
    const [searchInput, setSearchInput] = useState('');

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                fetchUserProfession(user.uid);
            } else {
                setUser(null);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchUserProfession = async (userId) => {
        try {
            const db = getFirestore(firebaseApp);
            const userRef = collection(db, 'tutor');
            const querySnapshot = await getDocs(userRef);
            
            querySnapshot.forEach((doc) => {
                if (doc.id === userId) {
                    const userData = doc.data();
                    setProfession(userData.profession);
                }
            });
        } catch (error) {
            console.error('Error getting document:', error);
        }
    };    

    const handleLogout = async () => {
        if (window.confirm('Are You Sure to Logout')) {    
            try {
                const auth = getAuth(firebaseApp);
                await signOut(auth);
                navigate('/Admin/AdminLogin');
            } catch (error) {
                console.error(error);
            }
        }
        else{
            navigate('/Admin/Dashboard');
        }
    };

    const handleSearchInputChange = (e) => {
        setSearchInput(e.target.value);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/Admin/AdminLogin');
            return;
        }
        navigate(`/Admin/SearchPage?query=${encodeURIComponent(searchInput)}`);
    };    

    const userBtn = () => {
        let profile = document.querySelector('.Adminheader .flex .profile');
        let searchForm = document.querySelector('.Adminheader .flex .search-form');
        profile.classList.toggle('active');
        searchForm.classList.remove('active');
    };

    const searchBtn = () => {
        let searchForm = document.querySelector('.Adminheader .flex .search-form');
        let profile = document.querySelector('.Adminheader .flex .profile');
        searchForm.classList.toggle('active');
        profile.classList.remove('active');
    };

    // Close the sidebar
    const closeSideBar = () => {
        let sideBar = document.querySelector('.side-bar');
        sideBar.classList.remove('active');
        document.body.classList.remove('active');
    };

    // Open the sidebar
    const openSideBar = () => {
        let sideBar = document.querySelector('.side-bar');
        sideBar.classList.toggle('active');
        document.body.classList.toggle('active');
    };

    const viewProfile = () => {
        let profile = document.querySelector('.Adminheader .flex .profile');
        profile.classList.remove('active');
        let sideBar = document.querySelector('.side-bar');
        sideBar.classList.remove('active');
    };

    const enableDarkMode = () => {
        document.body.classList.add('dark');
        localStorage.setItem('dark-mode', 'enabled');
    };

    const disableDarkMode = () => {
        document.body.classList.remove('dark');
        localStorage.setItem('dark-mode', 'disabled');
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        if (!darkMode) {
            enableDarkMode();
        } else {
            disableDarkMode();
        }
    };

    return (
        <div>
            <header className="Adminheader">
                <section className="flex">
                    {user ? (
                        <Link to="/Admin/Dashboard" className="adminlogo">Admin.</Link>
                    ) : (
                        <Link to="/Admin/AdminLogin" className="adminlogo">Admin.</Link>
                    )}

                    <form className="search-form" onSubmit={handleSearch}>
                        <input
                            type="text"
                            name="search"
                            placeholder="Search Here..."
                            value={searchInput}
                            onChange={handleSearchInputChange}
                            required
                            maxLength={100}
                        />
                        <button type="submit" name="search_btn"><FaSearch/></button>
                    </form>

                    <div className="icons">
                        <div id="menu-btn" onClick={openSideBar}><FaBars/></div>
                        <div id="search-btn" onClick={searchBtn}><FaSearch/></div>
                        <div id="user-btn" onClick={userBtn}><FaUser/></div>
                        <div id="toggle-btn" onClick={toggleDarkMode}>{darkMode ? <FaSun/> : <FaMoon/>}</div>
                    </div>

                    <div className="profile">
                        {user ? (
                            <div>
                                <img src={user.photoURL} alt="" />
                                <h3>{user.displayName}</h3>
                                <span>{profession}</span>
                                <Link to="/Admin/ViewProfile" className="btn" onClick={viewProfile}>View Profile</Link>
                                <Link to="/" className="delete-btn" onClick={handleLogout}>Logout</Link>
                            </div>
                        ) : (
                            <Link to="/Admin/AdminLogin" className="delete-btn">Login</Link>
                        )}
                    </div>
                </section>
            </header>

            <div className="side-bar">
                <div className="close-side-bar" onClick={closeSideBar}>
                    <i><FaTimes/></i>
                </div>
                {user ? (
                    <>
                        <div className="profile">
                            <img src={user.photoURL} alt="" />
                            <h3>{user.displayName}</h3>
                            <span>{profession}</span>
                            <Link to="/Admin/ViewProfile" className="btn" onClick={viewProfile}>View Profile</Link>
                        </div>
                        <nav className="navbar">
                            <Link to="/Admin/Dashboard"><i><FaHome/></i><span>Home</span></Link>
                            <Link to="/Admin/DashboardPerfomance"><i><FaDashcube/></i><span>Dashboard</span></Link>
                            <Link to="/Admin/AdminPlaylist"><i><FaBarsStaggered/></i><span>Playlists</span></Link>
                            <Link to="/Admin/AdminContent"><i><FaGraduationCap/></i><span>Contents</span></Link>
                            <Link to="/Admin/Comment"><i><FaComment/></i><span>Comments</span></Link>
                            <Link to="/AdminAdvanced/AdminAssignment"><i><FaBook/></i><span>Assignment</span></Link>
                            <Link onClick={handleLogout}><i><FaRightFromBracket/></i><span>Logout</span></Link>
                        </nav>
                    </>
                )
                :(
                    <>

                        <div className="profile">
                            <img src={pic3} alt="" />
                            <h3>No Profile Found</h3>
                            {/* <span>{profession}</span> */}
                            <Link to="/Admin/AdminLogin" className="btn" onClick={viewProfile}>Login</Link>
                        </div>
                        <nav className="navbar">
                            <Link to="/Admin/AdminLogin"><i><FaHome/></i><span>Home</span></Link>
                            <Link to="/Admin/AdminLogin"><i><FaBarsStaggered/></i><span>Playlists</span></Link>
                            <Link to="/Admin/AdminLogin"><i><FaGraduationCap/></i><span>Contents</span></Link>
                            <Link to="/Admin/AdminLogin"><i><FaComment/></i><span>Comments</span></Link>
                            {/* <Link to="/Admin/AdminLogin" onClick={handleLogout}><i><FaRightFromBracket/></i><span>Logout</span></Link> */}
                        </nav>
                    </>

                )
            }

        </div>
    </div>
  )
}

export default AdminHeader;