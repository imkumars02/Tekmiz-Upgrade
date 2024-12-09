import React, { useState, useEffect } from 'react';
import UserHeader from '../Header/UserHeader';
import { useLocation, Link } from 'react-router-dom';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { firebaseApp } from '../Firebase';
import Empty from '../Empty';

const SearchTutor = () => {
    const location = useLocation();
    const searchQuery = new URLSearchParams(location.search).get('query');
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    // const navigate = useNavigate();

    useEffect(() => {
        const fetchTutors = async () => {
            try {
                const db = getFirestore(firebaseApp);
                const q = query(collection(db, 'tutor'), orderBy('displayName'));
                const querySnapshot = await getDocs(q);
                const fetchedTutors = [];

                for (const doc of querySnapshot.docs) {
                    const data = doc.data();
                    const displayName = data.displayName.toLowerCase();
                    const normalizedSearchQuery = searchQuery.toLowerCase();
                    if (displayName.includes(normalizedSearchQuery)) {
                        const tutorId = doc.id;
                        const playlistsQuery = query(collection(db, 'playlists'), where('userId', '==', tutorId));
                        const videosQuery = query(collection(db, 'videos'), where('userId', '==', tutorId));
                        const likesQuery = query(collection(db, 'likes'), where('tutorId', '==', tutorId));

                        const [playlistsSnapshot, videosSnapshot, likesSnapshot] = await Promise.all([
                            getDocs(playlistsQuery),
                            getDocs(videosQuery),
                            getDocs(likesQuery)
                        ]);

                        fetchedTutors.push({
                            id: tutorId,
                            displayName: data.displayName,
                            profession: data.profession,
                            photoURL: data.photoURL,
                            userId: data.userId,
                            playlistCount: playlistsSnapshot.size,
                            videoCount: videosSnapshot.size,
                            likesCount: likesSnapshot.size
                        });
                    }
                }

                setTutors(fetchedTutors);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching tutors:', error);
                setLoading(false);
            }
        };

        if (searchQuery) {
            fetchTutors();
        } else {
            setTutors([]);
            setLoading(false);
        }
    }, [searchQuery]);

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
        <div>
            <UserHeader />
            <section className="teachers">
                <h1 className="heading">Search Results for "{searchQuery}"</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : tutors.length === 0 ? (
                    <Empty />
                ) : (
                    <div className="box-container">
                        {tutors.map((tutor) => (
                            <div key={tutor.id} className="box">
                                <div className="tutor">
                                    <img src={tutor.photoURL} alt="" />
                                    <div>
                                        <h3>{tutor.displayName}</h3>
                                        <span>{tutor.profession}</span>
                                    </div>
                                </div>
                                <p>Playlist : <span>{formatCount(tutor.playlistCount)}</span></p>
                                <p>Total Videos : <span>{formatCount(tutor.videoCount)}</span></p>
                                <p>Total Likes : <span>{formatCount(tutor.likesCount)}</span></p>
                                <Link to={`/User/TeacherProfile/${tutor.userId}`} className="inline-btn">View Profile</Link>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default SearchTutor;