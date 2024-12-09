import React, { useEffect, useState } from 'react';
import './UserHeader.scss';
import { Link, useNavigate } from 'react-router-dom';
import { IoNotifications, IoSearch } from 'react-icons/io5';
import { FaBars, FaSun, FaUser, FaTimes, FaQuestion, FaGraduationCap, FaChalkboard, FaHeadset, FaLanguage } from 'react-icons/fa';
import { IoMdHome } from 'react-icons/io';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { firebaseApp } from '../Firebase';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';

const UserHeader = () => {
  const [user, setUser] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylists, setNewPlaylists] = useState([]);
  const [fetchedPlaylistIds, setFetchedPlaylistIds] = useState(new Set());
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user ? user : null);
    });
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const db = getFirestore(firebaseApp);

    const fetchPlaylists = () => {
      const unsubscribe = onSnapshot(collection(db, 'playlists'), (snapshot) => {
        const fetchedPlaylists = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Filter out playlists that have already been fetched
        const newFetchedPlaylists = fetchedPlaylists.filter(playlist => !fetchedPlaylistIds.has(playlist.id));

        // Update state to display new playlists first
        setNewPlaylists(prevNewPlaylists => [...newFetchedPlaylists, ...prevNewPlaylists]);

        // Update full playlists state and fetched ids
        setPlaylists(fetchedPlaylists);
        setFetchedPlaylistIds(prevIds => new Set([...prevIds, ...fetchedPlaylists.map(playlist => playlist.id)]));

        // If there are new playlists, show notification number
        if (newFetchedPlaylists.length > 0) {
          setHasNewNotifications(true);
        }
      });
      return unsubscribe;
    };

    return fetchPlaylists();
  }, [fetchedPlaylistIds,playlists]);

  const handleLogout = async () => {
    try {
      const auth = getAuth(firebaseApp);
      await signOut(auth);
      navigate('/');
    } catch (error) {
      alert('Failed to logout');
    }
  };

  const userBtn = () => {
    let profile = document.querySelector('.Userheader .flex .profile');
    let searchForm = document.querySelector('.Userheader .flex .search-form');
    let notification = document.querySelector('.Userheader .flex .notification');
    notification.classList.remove('active');
    profile.classList.toggle('active');
    searchForm.classList.remove('active');
  };

  const searchBtn = () => {
    let searchForm = document.querySelector('.Userheader .flex .search-form');
    let profile = document.querySelector('.Userheader .flex .profile');
    searchForm.classList.toggle('active');
    profile.classList.remove('active');
  };

  const closeSideBar = () => {
    let sideBar = document.querySelector('.side-bar');
    sideBar.classList.remove('active');
    document.body.classList.remove('active');
  };

  const openSideBar = () => {
    let sideBar = document.querySelector('.side-bar');
    sideBar.classList.toggle('active');
    document.body.classList.toggle('active');
  };

  useEffect(() => {
    const handleScroll = () => {
      let profile = document.querySelector('.Userheader .flex .profile');
      let notification = document.querySelector('.Userheader .flex .notification');
      let searchForm = document.querySelector('.Userheader .flex .search-form');
      let sideBar = document.querySelector('.side-bar');

      if (profile && searchForm && sideBar) {
        profile.classList.remove('active');
        searchForm.classList.remove('active');
        notification.classList.remove('active');

        if (window.innerWidth < 1200) {
          notification.classList.remove('active');
          sideBar.classList.remove('active');
          document.body.classList.remove('active');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  let darkMode = localStorage.getItem('dark-mode');

  const enableDarkMode = () => {
    document.body.classList.add('dark');
    localStorage.setItem('dark-mode', 'enabled');
  };

  const disableDarkMode = () => {
    document.body.classList.remove('dark');
    localStorage.setItem('dark-mode', 'disabled');
  };

  if (darkMode === 'enabled') {
    enableDarkMode();
  }

  const toggleBtnMode = () => {
    let darkMode = localStorage.getItem('dark-mode');
    if (darkMode === 'disabled') {
      enableDarkMode();
    } else {
      disableDarkMode();
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (!user) {
      alert('Please log in to search for courses.');
      navigate('/');
      return;
    }
    navigate(`/User/SearchCourse?query=${searchInput}`);
  };

  const handleInputChange = (event) => {
    setSearchInput(event.target.value);
  };

  const notificationBtn = () => {
    let profile = document.querySelector('.Userheader .flex .profile');
    let notification = document.querySelector('.Userheader .flex .notification');
    let searchForm = document.querySelector('.Userheader .flex .search-form');
    profile.classList.remove('active');
    searchForm.classList.remove('active');
    notification.classList.toggle('active');

    // Mark notifications as viewed
    setHasNewNotifications(false);
  };

  const notificationLink = () => {
    let profile = document.querySelector('.Userheader .flex .profile');
    let searchForm = document.querySelector('.Userheader .flex .search-form');
    let notification = document.querySelector('.Userheader .flex .notification');
    profile.classList.remove('active');
    searchForm.classList.remove('active');
    notification.classList.remove('active');
  };

  return (
    <>
      <header className='Userheader'>
        <section className='flex'>
          <Link to='/' className='logo'>Tekmiz</Link>
          <form className='search-form' onSubmit={handleSearch}>
            <input type='text' name='search_course' placeholder='Search Courses....' required maxLength={100} value={searchInput} onChange={handleInputChange} />
            <button type='submit' name='search_course_btn'><IoSearch /></button>
          </form>
          <div className="icons">
            <div id="menu-btn" onClick={openSideBar}><FaBars /></div>
            {user && <div id="notification-btn" onClick={notificationBtn}><IoNotifications /></div>}
            <div id="search-btn" onClick={searchBtn}><IoSearch /></div>
            <div id="user-btn" onClick={userBtn}><FaUser /></div>
            <div id="toggle-btn" onClick={toggleBtnMode}><FaSun /></div>
          </div>

          {user ? (
            <div className="profile" id='profile'>
              <img src={user.photoURL} alt="" />
              <h3>{user.displayName}</h3>
              <span>Student</span>
              <Link to="/User/UserProfile" className="btn">View Profile</Link>
              <Link onClick={handleLogout} className="option-btn">Logout</Link>
            </div>
          ) : (
            <div className='profile'>
              <div className='box'>
                <h3 className='title'>Please Login Your Account</h3>
                <div className="flex-btn">
                  <Link to={'/UserLogin'} className="option-btn">Log In</Link>
                  <Link to={'/UserRegister'} className="option-btn">Register</Link>
                </div>
              </div>
            </div>
          )}

          {user && hasNewNotifications && (
            <div className='notifyBar'>
              {newPlaylists.length > 0 ? <h3>{newPlaylists.length}</h3> : <h3>{''}</h3>}
            </div>
          )}
          <div className="notification" id='notification'>
            {newPlaylists.length > 0 ? (
              newPlaylists.map(playlist => (
                <div className='notify' key={playlist.id}>
                  <div className='head'>
                    <img src={playlist?.userProfilePhoto} alt='' />
                    <h3>{playlist.userName}</h3>
                  </div>
                  <Link to={`/User/ViewPlaylist/${playlist.id}`} onClick={notificationLink}>{playlist.title}</Link>
                  <p>{playlist.description.substring(0, 50)}</p>
                </div>
              ))
            ) : (
              <div className='notify'>
                <h3>No new notifications found</h3>
              </div>
            )}
          </div>
        </section>
      </header>

      <div className="side-bar">
        <div className="close-side-bar" onClick={closeSideBar}>
          <FaTimes />
        </div>

        {user ? (
          <>
            <div className="profile" id='profile'>
              <img src={user.photoURL} alt="" />
              <h3>{user.displayName}</h3>
              <span>Student</span>
              <Link to="/User/UserProfile" className="btn">View Profile</Link>
            </div>
            <nav className="navbar">
              <Link to="/"><IoMdHome className='side'/><span>Home</span></Link>
              <Link to='/About'><FaQuestion className='side'/><span>About Us</span></Link>
              <Link to="/ViewCourses"><FaGraduationCap className='side'/><span>Courses</span></Link>
              <Link to="/Teacher"><FaChalkboard className='side'/><span>Teachers</span></Link>
              <Link to="/Contact"><FaHeadset className='side'/><span>Contact Us</span></Link>
              <Link to="/Translator"><FaLanguage className='side'/><span>Language</span></Link>
              <Link to="/Advanced/LearnMate"><FaLanguage className='side'/><span>LearnMate</span></Link>
              <Link to="/Advanced/TekmizCompiler"><FaLanguage className='side'/><span>Tekmiz Compiler</span></Link>
              <Link to="/Advanced/Meeting"><FaLanguage className='side'/><span>Meeting</span></Link>
              <Link to="/Advanced/Assignments"><FaLanguage className='side'/><span>Assignments</span></Link>
            </nav>
          </>
        ) : (
          <>
            <div className='profile'>
              <div className='box'>
                <h3 className='title'>Please Login Your Account</h3>
                <div className="flex-btn">
                  <Link to={'/UserLogin'} className="option-btn">Log In</Link>
                </div>
              </div>
            </div>
            <nav className="navbar">
              <Link to="/"><IoMdHome /><span>Home</span></Link>
              <Link to='/About'><FaQuestion /><span>About Us</span></Link>
              <Link to="/"><FaGraduationCap /><span>Courses</span></Link>
              <Link to="/"><FaChalkboard /><span>Teachers</span></Link>
              <Link to="/Contact"><FaHeadset /><span>Contact Us</span></Link>
              <Link to="/Translator"><FaLanguage /><span>Language</span></Link>
            </nav>
          </>
        )}
      </div>
    </>
  );
};

export default UserHeader;
