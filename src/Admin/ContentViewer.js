import React, { useEffect, useState } from 'react';
import AdminHeader from '../Header/AdminHeader';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { firebaseApp } from '../Firebase';

const ContentViewer = () => {
    const [content, setContent] = useState([]);

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const db = getFirestore(firebaseApp);

        const fetchContent = async (userId) => {
            try {
                const contentCollection = collection(db, 'videos');
                const querySnapshot = await getDocs(contentCollection);
                const fetchedContent = [];

                await Promise.all(querySnapshot.docs.map(async (doc) => {
                    const contentData = doc.data();
                    if (String(contentData.userId) === userId) {
                        const viewsQuery = query(collection(db, 'contentView'), where('contentId', '==', doc.id));
                        const viewsSnapshot = await getDocs(viewsQuery);
                        const totalViews = viewsSnapshot.size;

                        fetchedContent.push({ id: doc.id, ...contentData, totalViews });
                    }
                }));

                setContent(fetchedContent);
            } catch (error) {
                console.error('Error fetching contents:', error);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchContent(user.uid);
            }
        });

        return () => unsubscribe();
    }, []);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatTotalViews = (totalViews) => {
        if (totalViews === 0) {
            return '0';
        } else if (totalViews < 10) {
            return `0${totalViews}`;
        } else if (totalViews < 1000) {
            return totalViews.toString();
        } else if (totalViews < 1000000) {
            return (totalViews / 1000).toFixed(1) + 'k';
        } else {
            return (totalViews / 1000000).toFixed(1) + 'M';
        }
    };

    return (
        <div>
            <AdminHeader />
            <section className="Viewcourses">
                <h1 className="heading">Content Viewer</h1>
                {content.length > 0 ? (
                    <div className="box-container">
                        {content.map((contentItem) => (
                            <div className="box" key={contentItem.id}>
                                <div className="tutor">
                                    <img src={contentItem.userProfilePhoto} alt='Tutor_Profile' />
                                    <div>
                                        <h3>{contentItem.userName}</h3>
                                        <span>{formatDate(contentItem.date)}</span>
                                    </div>
                                </div>
                                <h3 className='viewer'>{formatTotalViews(contentItem.totalViews)}</h3>
                                <img src={contentItem.thumbnailUrl} alt='Courses' className="thumb" />
                                <h3 className="title">{contentItem.title}</h3>
                                <Link to={`/Admin/ContentViewerList/${contentItem.id}`} className="inline-btn">Viewer List</Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty">No Courses Added Yet !!</p>
                )}
            </section>
        </div>
    );
}

export default ContentViewer;