import React, { useEffect, useState, useCallback } from 'react';
import './Likes.css';
import UserHeader from '../Header/UserHeader';
import Empty from '../Empty'
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from '../Firebase';
import { collection, doc, getDoc, getDocs, getFirestore, updateDoc, increment, query, where, deleteDoc, addDoc, Timestamp } from 'firebase/firestore';

const Likes = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [likes, setLikes] = useState([]);
    const [content, setContent] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const fetchUser = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                fetchLikes();
            } else {
                setUser(null);
                setLikes([]); // Clear likes if user is not logged in
            }
        });
        return () => fetchUser();
    }, [user]);

    const fetchLikes = async () => {
        try {
            const db = getFirestore(firebaseApp);
            const likesCollection = collection(db, 'likes');
            const likesSnapshot = await getDocs(likesCollection);
            const likesData = likesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setLikes(likesData);
        } catch (error) {
            console.error('Error fetching likes from Firestore:', error);
        } finally {
            setLoading(false); // Set loading to false after fetching likes
        }
    };

    const fetchContentAndTutor = useCallback(async () => {
        try {
            const db = getFirestore(firebaseApp);
            const contentData = [];
            const tutorData = [];

            for (const like of likes) {
                // Fetch content by contentId
                const contentRef = doc(db, 'videos', like.contentId);
                const contentSnapshot = await getDoc(contentRef);
                if (contentSnapshot.exists()) {
                    const contentItem = contentSnapshot.data();
                    contentItem.id = contentSnapshot.id; // Assign document ID to the content item
                    contentData.push(contentItem);
                }

                // Fetch tutor by tutorId
                const tutorRef = doc(db, 'tutor', like.tutorId);
                const tutorSnapshot = await getDoc(tutorRef);
                if (tutorSnapshot.exists()) {
                    tutorData.push(tutorSnapshot.data());
                }
            }

            setContent(contentData);
            setTutors(tutorData);
        } catch (error) {
            console.error('Error fetching content or tutor:', error);
        }
    }, [likes]);

    const removeFromLikes = async (contentId) => {
        try {
            const db = getFirestore(firebaseApp);
            const auth = getAuth(firebaseApp);
            const currentUser = auth.currentUser;
    
            if (!currentUser) {
                console.error('User not logged in');
                return;
            }
    
            // If user has already liked the content, remove the like
            const likeQuery = query(collection(db, 'likes'), where('contentId', '==', contentId), where('userId', '==', currentUser.uid)); // Create a query to find the like documents
            const likeSnapshot = await getDocs(likeQuery);
            likeSnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref); // Delete each like document
            });
            await updateDoc(doc(db, 'videos', contentId), {
                likes: increment(-likeSnapshot.docs.length) // Decrement likes count by the number of documents deleted
            });
    
            alert('Content Removed !!');
            navigate('/');
    
        } catch (error) {
            // console.error('Error removing content from likes:', error);
        }
    };
    
    useEffect(() => {
        fetchContentAndTutor();
    }, [likes, fetchContentAndTutor]); // Fetch content and tutor whenever likes change
   

    const handleContentView = async (contentId, userId,tutorId,playlistId) => {
        try {
            // console.log("Playlist Id ",playlistId);
            // console.log("Tutor Id ",userId);
            // console.log("Content ID:", contentId); // Check if contentId is defined
            const db = getFirestore(firebaseApp);
            const playlistViewCollection = collection(db, 'contentView');
            const currentDate = Timestamp.now();
            await addDoc(playlistViewCollection, {
                userId: userId,
                playlistId:playlistId,
                tutorId: tutorId,
                contentId: contentId,
                date: currentDate
            });
            // console.log('Content view added successfully.');
        } catch (error) {
            // console.error('Error adding document:', error);
        }
        
    };
    return (
        <div>
            <UserHeader/>
            <section className="liked-videos">
                <h1 className="heading">Liked Videos</h1>
                {loading ? (
                    <div style={{padding:'2rem',fontSize:'2rem'}}>Loading....</div>
                ) : (
                    <div className="box-container">
                        {content.length === 0 ? (
                            <Empty />
                        ) : (
                            content.map((item, index) => (
                                <div className="box" key={index}>
                                    <div className="tutor">
                                        <img src={tutors[index]?.photoURL} alt="" />
                                        <div>
                                            <h3>{tutors[index]?.displayName}</h3>
                                            <span>{item?.date}</span>
                                        </div>
                                    </div>
                                    <img src={item.thumbnailUrl} alt="" className="thumb" />
                                    <h3 className="title">{item.title}</h3>
                                    <form action="" method="post" className="flex-btn">
                                        <input type="hidden" name="content_id" value={item.videoUrl} />
                                        <Link to={`/User/WatchVideo/${item.id}`} className="inline-btn" onClick={() => handleContentView(item.id, user.uid,item.userId,item.playlistId)}>Watch Video</Link>
                                        <button type="button" onClick={() => removeFromLikes(item.id)} className="inline-delete-btn">Remove</button>
                                    </form>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Likes;