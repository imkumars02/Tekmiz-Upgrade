import React, { useEffect, useState } from 'react';
import './UserComment.css';
import UserHeader from '../Header/UserHeader';
import { Link } from 'react-router-dom';
import { collection, deleteDoc, getDocs, getFirestore, query, where, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { firebaseApp } from '../Firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const UserComment = () => {
    const [user, setUser] = useState(null);
    const [comments, setComments] = useState([]);
    const [contents, setContents] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [editedCommentText, setEditedCommentText] = useState('');

    useEffect(() => {
        const auth = getAuth();

        const fetchUser = onAuthStateChanged(auth, async user => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });

        return () => fetchUser();
    }, []);

    useEffect(() => {
        const fetchComments = async () => {
            if (user) {
                const db = getFirestore(firebaseApp);

                const commentQuery = query(collection(db, 'comments'), where('userId', '==', user.uid));
                const commentSnapshot = await getDocs(commentQuery);

                if (!commentSnapshot.empty) {
                    const fetchedComments = commentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setComments(fetchedComments);
                } else {
                    setComments([]);
                }
            }
        };

        fetchComments();
    }, [user]);

    useEffect(() => {
        const fetchContents = async () => {
            const db = getFirestore(firebaseApp);

            const contentIds = comments.map(comment => comment.playlistId);
            const contentPromises = contentIds.map(async contentId => {
                const contentQuery = query(collection(db, 'videos'), where('playlistId', '==', contentId));
                const contentSnapshot = await getDocs(contentQuery);
                if (!contentSnapshot.empty) {
                    return contentSnapshot.docs.map(doc => doc.data())[0];
                } else {
                    return null;
                }
            });

            const fetchedContents = await Promise.all(contentPromises);
            setContents(fetchedContents.filter(content => content !== null));
        };

        fetchContents();
    }, [comments]);

    const handleDeleteComment = async (commentId) => {
        try {
            const db = getFirestore(firebaseApp);

            const commentQuery = query(collection(db, 'comments'), where('id', '==', commentId));
            const commentSnapshot = await getDocs(commentQuery);
            commentSnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });

            setComments(comments.filter(comment => comment.id !== commentId));
            alert('Comment Deleted');
        } catch (error) {
            alert('Error deleting comment:', error);
        }
    };

    const handleEditComment = async (commentId) => {
        try {
            const db = getFirestore(firebaseApp);
            const commentQuery = query(collection(db, 'comments'), where('id', '==', commentId));
            const commentSnapshot = await getDocs(commentQuery);
            if (commentSnapshot.empty) {
                console.error('Comment document does not exist');
                return;
            }

            const existingCommentDoc = commentSnapshot.docs[0];
            const existingCommentRef = existingCommentDoc.ref;
    
            await updateDoc(existingCommentRef, {
                commentText: editedCommentText,
                date: new Date().toISOString()
            });

            setComments(comments.map(comment => {
              if (comment.id === commentId) {
                  return { ...comment, commentText: editedCommentText };
              }
              return comment;
            }));

            setEditMode(false);
            alert('Comment Edited Successfully');
        } catch (error) {
            console.error('Error editing comment:', error);
        }
    };

    const handleContentView = async (contentId, userId, tutorId, playlistId) => {
        try {
            const db = getFirestore(firebaseApp);
            const playlistViewCollection = collection(db, 'contentView');
            const currentDate = Timestamp.now();
            await addDoc(playlistViewCollection, {
                userId: userId,
                playlistId: playlistId,
                tutorId: tutorId,
                contentId: contentId,
                date: currentDate
            });
        } catch (error) {
            console.error('Error adding document:', error);
        }
        
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div>
            <UserHeader />
            <section className="comments">
                <h1 className="heading">Your Comments</h1>
                <div className="show-comments">
                    {comments.length > 0 && contents.length > 0 ? (
                        comments.map((comment, index) => (
                            <div className="box" key={index}>
                                <div className="content">
                                    <span>{formatDate(comment.date)}</span>
                                    <p> - {(contents[index] && contents[index].title) || 'Content Title'} - </p>
                                    <Link to={`/User/WatchVideo/${comment.contentId}`} onClick={() => handleContentView(comment.contentId, user.uid, comment.tutorId, comment.playlistId)}>View Content</Link>
                                </div>
                                {editMode ? (
                                    <form className="flex-btn">
                                        <textarea value={editedCommentText} onChange={(e) => setEditedCommentText(e.target.value)} style={{ resize: 'none', color: 'var(--black)', fontSize: '1.5rem', padding: '0rem' }} placeholder='Write Updatable Comment' name='commentText'></textarea>
                                        <button
                                            type="button"
                                            className="inline-option-btn"
                                            onClick={() => handleEditComment(comment.id)}
                                        >
                                            Save Comment
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-delete-btn"
                                            onClick={() => setEditMode(false)}
                                        >
                                            Cancel
                                        </button>
                                    </form>
                                ) : (
                                    <>
                                        <p className="text">{comment.commentText}</p>
                                        <div className="flex-btn">
                                            <button
                                                type="button"
                                                className="inline-option-btn"
                                                onClick={() => setEditMode(true)}
                                            >
                                                Edit Comment
                                            </button>
                                            <button
                                                type="button"
                                                className="inline-delete-btn"
                                                onClick={() => handleDeleteComment(comment.id)}
                                            >
                                                Delete Comment
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="empty">No comments found</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default UserComment;