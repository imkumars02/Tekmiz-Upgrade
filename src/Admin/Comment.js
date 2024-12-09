import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Comment.css';
import AdminHeader from '../Header/AdminHeader';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from '../Firebase';
import { collection, deleteDoc, doc, getDocs, getFirestore, query, where } from 'firebase/firestore';

const Comment = () => {
    const [user, setUser] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                setUser(authUser);
                try {
                    const db = getFirestore(firebaseApp);
                    const videosCollection = collection(db, 'videos');
                    const q = query(videosCollection, where('userId', '==', authUser.uid));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const contentDataPromises = querySnapshot.docs.map(async (doc) => {
                            const contentId = doc.id;
                            const comments = await fetchComments(contentId, db);
                            return { ...doc.data(), id: doc.id, comments };
                        });
                        const contentData = await Promise.all(contentDataPromises);
                        const filteredContentData = contentData.filter(content => content.comments.length > 0);
                        setComments(filteredContentData);
                    } else {
                        setComments([]);
                    }
                } catch (error) {
                    console.error('Error fetching content and comments:', error);
                    setComments([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setUser(null);
                setComments([]);
                setLoading(false);
            }
        });

        return unsubscribe;
    }, [user]);

    const fetchComments = async (contentId, db) => {
        try {
            const commentsCollection = collection(db, 'comments');
            const q = query(commentsCollection, where('contentId', '==', contentId));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error fetching comments for content:', error);
            return [];
        }
    };

    const deleteComment = async (commentId, contentId) => {
        try {
            const db = getFirestore(firebaseApp);
            const commentRef = doc(db, 'comments', commentId);
            await deleteDoc(commentRef);

            // Update UI by removing the deleted comment from the state
            setComments(prevComments =>
                prevComments.map(content =>
                    content.id === contentId
                        ? {
                              ...content,
                              comments: content.comments.filter(comment => comment.id !== commentId),
                          }
                        : content
                )
            );

            alert('Comment deleted successfully.');
            navigate('/Admin/Comment');
        } catch (error) {
            alert('Error deleting comment:', error.message);
        }
    };

    return (
        <>
            <AdminHeader />
            <section className="comments">
                <h1 className="heading">User Comments</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="show-comments">
                        {comments.length > 0 ? (
                            comments.map((content) => (
                                <div key={content.id} className="box">
                                    <div className="content">
                                        <span>{new Date(content.date).toLocaleDateString()}</span>
                                        <p>{content.title}</p>
                                        <Link to={`/Admin/ViewContent/${content.id}`}>View content</Link>
                                    </div>
                                    {content.comments.map((comment) => (
                                        <div key={comment.id}>
                                            <p className="text">{comment.commentText}</p>
                                            <button
                                                type="button"
                                                className="inline-delete-btn"
                                                onClick={() =>
                                                    window.confirm('Delete this Comment?') && deleteComment(comment.id, content.id)}>Delete comment</button>
                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <p className="empty">No comments found.</p>
                        )}
                    </div>
                )}
            </section>
        </>
    );
};

export default Comment;