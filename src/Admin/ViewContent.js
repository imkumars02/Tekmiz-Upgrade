import React, { useState, useEffect, useRef } from 'react';
import './ViewContent.css';
import AdminHeader from '../Header/AdminHeader';
import { Link, useParams } from 'react-router-dom'; // Import useNavigate
import { FaCalendar, FaComment, FaHeart } from 'react-icons/fa';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { firebaseApp } from '../Firebase';

const ViewContent = () => {
    const { contentId } = useParams();
    const [contentData, setContentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const videoRef = useRef(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const db = getFirestore(firebaseApp);
                const contentRef = doc(db, 'videos', contentId);
                const contentSnapshot = await getDoc(contentRef);

                if (contentSnapshot.exists()) {
                    const contentData = { ...contentSnapshot.data(), id: contentSnapshot.id };
                    const likes = await fetchLikes(contentId);
                    const comments = await fetchComments(contentId);

                    setContentData({ ...contentData, likes, comments });
                } else {
                    setContentData(null);
                }
            } catch (error) {
                console.error('Error fetching content:', error);
                setContentData(null);
            } finally {
                setLoading(false);
            }
        };

        const fetchLikes = async (contentId) => {
            try {
                const db = getFirestore(firebaseApp);
                const likesCollection = collection(db, 'likes');
                const q = query(likesCollection, where("contentId", "==", contentId));
                const querySnapshot = await getDocs(q);

                return querySnapshot.size;
            } catch (error) {
                console.error('Error fetching likes:', error);
                return 0;
            }
        };

        const fetchComments = async (contentId) => {
            try {
                const db = getFirestore(firebaseApp);
                const commentsCollection = collection(db, 'comments');
                const q = query(commentsCollection, where("contentId", "==", contentId));
                const querySnapshot = await getDocs(q);

                return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (error) {
                console.error('Error fetching comments:', error);
                return [];
            }
        };

        fetchContent();
    }, [contentId]);

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
                setContentData(prevContent => {
                    if (prevContent && prevContent.id === contentId) {
                        return null; // Set to null if the deleted content matches the displayed content
                    }
                    return prevContent;
                });
                // Optionally, you might want to update content count here
            } catch (error) {
                console.error('Error deleting video:', error);
            }
        }
    };
    

    useEffect(() => {
        const handleKeyPress = (event) => {
            switch (event.key) {
                case 'k': // Play/Pause
                    togglePlayPause();
                    break;
                case 'f': // Full Screen
                    toggleFullScreen();
                    break;
                case 'j': // Skip backward 5s
                    skipBackward();
                    break;
                case 'l': // Skip forward 5s
                    skipForward();
                    break;
                default:
                    break;
            }
        };

        const toggleFullScreen = () => {
            if (videoRef.current) {
                if (isFullScreen) {
                    exitFullScreen();
                } else {
                    enterFullScreen();
                }
            }
        };

        const enterFullScreen = () => {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            } else if (videoRef.current.mozRequestFullScreen) {
                videoRef.current.mozRequestFullScreen();
            } else if (videoRef.current.webkitRequestFullscreen) {
                videoRef.current.webkitRequestFullscreen();
            } else if (videoRef.current.msRequestFullscreen) {
                videoRef.current.msRequestFullscreen();
            }
            setIsFullScreen(true);
        };

        const exitFullScreen = () => {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            setIsFullScreen(false);
        };

        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [isFullScreen]);

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
        }
    };

    const skipBackward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime -= 5;
        }
    };

    const skipForward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime += 5;
        }
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Toggle expanded description
    const toggleDescription = () => {
        setContentData(prevContent => {
            if (!prevContent) return null;
            return { ...prevContent, expanded: !prevContent.expanded };
        });
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
        <div>
            <AdminHeader />
            {loading ? (
                <div style={{ padding: '2rem', fontSize: '2rem' }}>Loading...</div>
            ) : (
                <div>
                    {!contentData ? (
                        <div className='view-content'>
                            <div className="empty">Video content not found.</div>
                        </div>
                    ) : (
                        <section className="view-content">
                            <div className="container">
                                {contentData.videoUrl && contentData.thumbnailUrl ? (
                                    <video ref={videoRef} src={contentData.videoUrl} autoPlay controls poster={contentData.thumbnailUrl} className="video"></video>
                                ) : (
                                    <div className="error">Video or thumbnail not found.</div>
                                )}
                                <div className="date"><i><FaCalendar /></i><span>{contentData.date}</span></div>
                                <h3 className="title">{contentData.title}</h3>
                                <div className="flex">
                                    <div><i><FaHeart /></i><span>{formatCount(contentData.likes)}</span></div>
                                    <div><i><FaComment /></i><span>{formatCount(contentData.comments?.length)}</span></div>
                                </div>
                                <div className="description">
                                    {contentData.description.length > 200 && !contentData.expanded ? (
                                        <>
                                            {contentData.description.substring(0, 200)}...
                                            <button className='read-more-less' onClick={toggleDescription}>Read More</button>
                                        </>
                                    ) : (
                                        <>
                                            {contentData.description}
                                            {contentData.description.length > 200 && contentData.expanded && (
                                                <button onClick={toggleDescription}>Read Less</button>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="flex-btn">
                                    <Link to={`/Admin/UpdateContent/${contentData.id}`} className="option-btn">Update</Link>
                                    <button type="button" onClick={() => handleDelete(contentData.id, 'video')} className="delete-btn">Delete</button>
                                </div>
                            </div>
                            <section className="comments">
                                <h1 className="heading">User Comments</h1>
                                <div className="show-comments">
                                    {contentData.comments && contentData.comments.length > 0 ? (
                                        contentData.comments.map((comment, index) => (
                                            <div key={index} className="commentBox">
                                                <div className="user">
                                                    <img src={comment.userProfilePhoto} alt="Profile" />
                                                    <div>
                                                        <h3>{comment.userName}</h3>
                                                        <span>{formatDate(comment.date)}</span>
                                                    </div>
                                                </div>
                                                <p className="text">{comment.commentText}</p>
                                                <button onClick={() => handleDelete(comment.id, 'comment')} className="inline-delete-btn">Delete</button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty">No comments yet.</div>
                                    )}
                                </div>
                            </section>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
export default ViewContent;