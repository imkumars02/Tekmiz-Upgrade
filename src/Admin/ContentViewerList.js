import './ContentViewerList.css';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminHeader from '../Header/AdminHeader';
import { getFirestore, doc, getDoc, getDocs, where, query, collection } from 'firebase/firestore';
import { firebaseApp } from '../Firebase';

const ContentViewerList = () => {
    const { contentId } = useParams();
    const [content, setContent] = useState(null);
    const [users, setUsers] = useState([]);
    const [dates, setDates] = useState([]);
    const [viewsNotFound, setViewsNotFound] = useState(false);

    useEffect(() => {
        const db = getFirestore(firebaseApp);
        const fetchContent = async () => {
            try {
                const ContentRef = doc(db, 'videos', contentId);
                const ContentSnapshot = await getDoc(ContentRef);
                if (ContentSnapshot.exists()) {
                    const ContentData = ContentSnapshot.data();
                    setContent(ContentData);

                    const ContentViewRef = collection(db, 'contentView');
                    const ContentViewQuery = query(ContentViewRef, where('contentId', '==', contentId));
                    const ContentViewSnapshot = await getDocs(ContentViewQuery);
                    if (!ContentViewSnapshot.empty) {
                        const userData = [];
                        const dateData = [];
                        const userPromises = [];
                        ContentViewSnapshot.forEach(doc => {
                            const ContentViewData = doc.data();
                            const userId = ContentViewData.userId;
                            const timestamp = ContentViewData.date;
                            const formattedDate = new Date(timestamp.seconds * 1000).toLocaleString();
                            userData.push(userId);
                            dateData.push(formattedDate);
                            const userPromise = getUserDetails(db, userId);
                            userPromises.push(userPromise);
                        });
                        setUsers(userData);
                        setDates(dateData);
                        Promise.all(userPromises).then(userDetails => {
                            setUsers(userDetails);
                        });
                    } else {
                        // Set viewsNotFound to true if no views found
                        setViewsNotFound(true);
                        // console.log('No data found for the Content in ContentView.');
                    }
                } else {
                    // console.log('No such Content exists!');
                }
            } catch (error) {
                // console.error('Error fetching Content:', error);
            }
        };

        fetchContent();

        // Cleanup function
        return () => {
            // Any cleanup code here if needed
        };
    }, [contentId]);

    const getUserDetails = async (db, userId) => {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnapshot = await getDoc(userRef);
            if (userSnapshot.exists()) {
                return userSnapshot.data();
            } else {
                const tutorRef = doc(db, 'tutor', userId);
                const tutorSnapshot = await getDoc(tutorRef);
                if (tutorSnapshot.exists()) {
                    return tutorSnapshot.data();
                } else {
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
            <section className="ContentViewerList">
                <h1 className="heading">Content View List</h1>
                {content && users.length > 0 && (
                    <div className="show-viewer">
                        {users.map((user, index) => (
                            <div key={index} className="box">
                                <div className="content">
                                    <span>Content Date : {content.date}</span>
                                    <p>{content.title}</p>
                                    <Link to={`/Admin/ViewContent/${contentId}`}>View Content</Link>
                                </div>
                                <div className='text'>
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
                            </div>
                        ))}
                    </div>
                )}
                {/* Display message if no views found */}
                {viewsNotFound && (
                    <p className="empty">No views recorded for this content yet.</p>
                )}
            </section>
        </div>
    );
};

export default ContentViewerList;