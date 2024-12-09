import React, { useEffect, useState } from 'react';
import UserHeader from './Header/UserHeader';
import { FaSearch } from 'react-icons/fa';
import './Teacher.css';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore'; // Updated import
import { firebaseApp } from './Firebase';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import Empty from './Empty';

const Teacher = () => {
    useEffect(()=>{
        document.title='Tekmiz - Teachers';
    })

    const [teachers, setTeachers] = useState([]);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [searchInput, setSearchInput] = useState('');

    const handleInputChange = (event) => {
        setSearchInput(event.target.value);
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        navigate(`/User/SearchTutor?query=${searchInput}`);
    };

    useEffect(() => {
        const fetchTeachers = async () => {
            const db = getFirestore(firebaseApp);
            try {
                const playlistsCollection = collection(db, 'tutor');
                const querySnapshot = await getDocs(playlistsCollection);
                const fetchUserData = [];
                for (const doc of querySnapshot.docs) {
                    const userData = doc.data();
                    // console.log("Tutor ID:", userData.userId); // Log the tutor ID
                    const playlistsCount = await getTotalPlaylistsCount(userData.userId);
                    // console.log("Playlists count:", playlistsCount); // Log the playlists count
                    const videosCount = await getTotalVideosCount(userData.userId);
                    // console.log("Videos count:", videosCount); // Log the videos count
                    const likesCount = await getTotalLikesCount(userData.userId);
                    // console.log("Likes count:", likesCount); // Log the likes count
                    const commentsCount = await getTotalCommentsCount(userData.userId);
                    // console.log("Comments count:", commentsCount); // Log the comments count
                    fetchUserData.push({ id: doc.id, ...userData, playlistsCount, videosCount, likesCount, commentsCount });
                }
                setTeachers(fetchUserData);
            } catch (error) {
                console.error('Error fetching tutors: ', error);
            }
        };        
        fetchTeachers();
    }, []);

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const fetchUser = onAuthStateChanged(auth, async user => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });
        return () => fetchUser();
    }, [user]);

    const getTotalPlaylistsCount = async (userId) => {
        const db = getFirestore(firebaseApp);
        const playlistsRef = collection(db, 'playlists');
        const q = query(playlistsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    };

    const getTotalVideosCount = async (userId) => {
        const db = getFirestore(firebaseApp);
        const videosRef = collection(db, 'videos');
        const q = query(videosRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    };

    const getTotalLikesCount = async (userId) => {
        const db = getFirestore(firebaseApp);
        const likesRef = collection(db, 'likes');
        const q = query(likesRef, where('tutorId', '==', userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    };

    const getTotalCommentsCount = async (userId) => {
        const db = getFirestore(firebaseApp);
        const commentsRef = collection(db, 'comments');
        const q = query(commentsRef, where('tutorId', '==', userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    };

    const handleLogout = async () => {
        try {
            const auth = getAuth(firebaseApp);
            await signOut(auth);
            navigate('/Admin/AdminLogin');
        } catch (error) {
            alert('Failed');
            navigate('/Teacher');
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

    return (
        <>
            <UserHeader />
            <section className="teachers">
                <h1 className="heading">Expert Tutors</h1>
                <form onSubmit={handleSearchSubmit} className="search-tutor">
                    <input 
                        type="text" 
                        name="search_box" 
                        maxLength="100" 
                        placeholder="Search Tutor..." 
                        required 
                        value={searchInput}
                        onChange={handleInputChange}
                    />
                    <button type="submit" name="search-tutor">
                        <FaSearch />
                    </button>
                </form>
                <div className="box-container">
                    <div className="box offer">
                        <h3>Become a Tutor</h3>
                        <p>To share your knowledge and expertise with learners worldwide on our dynamic Tekmiz platform. Join our community of educators today !!</p>
                        <Link onClick={handleLogout} className="inline-btn">Get Started</Link>
                    </div>
                    {teachers && teachers.length > 0 ? (
                        teachers.map((tutor, index) => (
                            <div className="box" key={index}>
                                <div className="tutor">
                                    <img src={tutor.photoURL} alt="Tutor_Profile_Photo" />
                                    <div>
                                        <h3>{tutor.displayName}</h3>
                                        <span>{tutor.profession}</span>
                                    </div>
                                </div>
                                <p>Playlists: <span>{formatCount(tutor.playlistsCount)}</span></p>
                                <p>Total Videos: <span>{formatCount(tutor.videosCount)}</span></p>
                                <p>Total Likes: <span>{formatCount(tutor.likesCount)}</span></p>
                                <p>Total Comments: <span>{formatCount(tutor.commentsCount)}</span></p>
                                <Link to={`/User/TeacherProfile/${tutor.userId}`} className='inline-btn'>View Profile</Link>
                            </div>
                        ))
                    ) : (
                        <Empty/>
                    )}
                </div>
            </section>
        </>
    )
}

export default Teacher;
