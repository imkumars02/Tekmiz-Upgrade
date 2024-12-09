import React, { useState, useEffect } from 'react';
import './AdminContent.css';
import { FaCalendar, FaDotCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import AdminHeader from '../Header/AdminHeader';
import { firebaseApp } from '../Firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, getFirestore, deleteDoc, doc, where, query } from 'firebase/firestore';

const AdminContent = () => {
    const [content, setContent] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const auth = getAuth(firebaseApp);

        const fetchUser = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });

        return () => fetchUser();
    }, []);

    useEffect(() => {
        if (user) {
            const fetchContents = async () => {
                try {
                    const db = getFirestore(firebaseApp);
                    const contetntCollection = collection(db, 'videos');
                    const contentSnapshot = await getDocs(
                        query(contetntCollection, where('userId', '==', user.uid))
                    );
                    const contentsData = contentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                    setContent(contentsData);
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching content:', error);
                }
            };
            fetchContents();
        }
    }, [user]);

    const handleDelete = async (contentId) => {
        if (window.confirm('Delete this video?')) {
            try {
                const db = getFirestore(firebaseApp);

                // Delete content from the likes table
                const likesQuerySnapshot = await getDocs(query(collection(db, 'likes'), where('contentId', '==', contentId)));
                likesQuerySnapshot.forEach(async (doc) => {
                    await deleteDoc(doc.ref);
                });

                // Delete content from the contentView table
                const contentViewQuerySnapshot = await getDocs(query(collection(db, 'contentView'), where('contentId', '==', contentId)));
                contentViewQuerySnapshot.forEach(async (doc) => {
                    await deleteDoc(doc.ref);
                });

                // Delete Content from the comments table
                const contentCommentSnapshot = await getDocs(query(collection(db,'comments'), where('contentId','==',contentId)));
                contentCommentSnapshot.forEach(async (doc)=>{
                    await deleteDoc(doc.ref);
                });

                // Delete content from the videos table
                await deleteDoc(doc(db, 'videos', contentId));

                // Update state to remove deleted content
                setContent(prevContent => prevContent.filter(item => item.id !== contentId));
                // Optionally, you might want to update content count here
            } catch (error) {
                console.error('Error deleting video:', error);
            }
        }
    };

    return (
        <>
            <AdminHeader />
            <section className="contents">
                <h1 className="heading">Your Contents</h1>
                <div className="box-container">
                    <div className="box" style={{ textAlign: 'center' }}>
                        <h3 className="title" style={{ marginBottom: '0.5rem' }}>Create New Content</h3>
                        <Link to="/Admin/AddContent" className="btn">
                            Add Content
                        </Link>
                    </div>
                    {loading ? (
                        <div style={{padding:'2rem',fontSize:'2rem'}}>Loading...</div>
                    ) : (
                        content.length > 0 ? (
                            content.map((content) => (
                                <div className="box" key={content.id}>
                                    <div className="flex">
                                        <div>
                                            <i style={{ color: 'limegreen' }}>
                                                <FaDotCircle />
                                            </i>
                                            <span style={{ color: 'limegreen' }}>Active</span>
                                        </div>
                                        <div>
                                            <i>
                                                <FaCalendar />
                                            </i>
                                            <span>{content.date}</span>
                                        </div>
                                    </div>
                                    <img src={content.thumbnailUrl} className="thumb" alt="" />
                                    <h3 className="title">{content.title}</h3>
                                    <form action="" method="post" className="flex-btn">
                                        <input type="hidden" name="playlist_id" value={content.id} />
                                        <Link to={`/Admin/UpdateContent/${content.id}`} className="option-btn">
                                            Update
                                        </Link>
                                        <button
                                            type="button"
                                            className="delete-btn"
                                            onClick={() => handleDelete(content.id)}
                                        >
                                            Delete
                                        </button>
                                    </form>
                                    <Link to={`/Admin/ViewContent/${content.id}`} className="btn">
                                        View content
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className='empty'>No content found. Create one Aleast.</div>
                        ))
                    }
                </div>
            </section>
        </>
    );
};

export default AdminContent;