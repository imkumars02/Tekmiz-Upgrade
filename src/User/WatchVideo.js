import React, { useEffect, useRef, useState } from 'react';
import './WatchVideo.css';
import UserHeader from '../Header/UserHeader';
import { FaCalendar, FaHeart } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, increment, updateDoc, where, query } from 'firebase/firestore';
import { firebaseApp } from '../Firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';


const WatchVideo = () => {
    const { contentId } = useParams();
    const [content, setContent] = useState(null);
    const [tutor, setTutor] = useState(null);
    const [user, setUser] = useState(null);
    const [savedLike, setSavedLike] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]); 
    const [editableCommentId, setEditableCommentId] = useState(null);
    const [editableCommentText, setEditableCommentText] = useState("");
    const [showFullDescription, setShowFullDescription] = useState(false); // State to manage showing full description
    const [isFullScreen, setIsFullScreen] = useState(false);
    const videoRef = useRef(null);

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
      const fetchContentData = async () => {
          try {
              const db = getFirestore(firebaseApp);
              const contentDoc = doc(db, 'videos', contentId);
              const contentSnapshot = await getDoc(contentDoc);
              if (contentSnapshot.exists()) {
                  const contentData = contentSnapshot.data();
                  setContent(contentData);
                  setLikesCount(contentData.likes || 0);
                  if (contentData.userId) {
                      const tutorDoc = doc(db, 'tutor', contentData.userId);
                      const tutorSnapshot = await getDoc(tutorDoc);
                      if (tutorSnapshot.exists()) {
                          setTutor(tutorSnapshot.data());
                      } else {
                          console.error('Tutor not found');
                      }
                  }
              } else {
                  alert('Content not found');
              }
  
              // Check if the user has liked the video
              const auth = getAuth(firebaseApp);
              const currentUser = auth.currentUser;
              if (currentUser) {
                  const likeQuery = query(collection(db, 'likes'), where('contentId', '==', contentId), where('userId', '==', currentUser.uid)); 
                  const likeSnapshot = await getDocs(likeQuery);
                  if (!likeSnapshot.empty) {
                      // User has liked the video
                      setSavedLike(true);
                  }
              }
  
              // Fetch comments based on contentId and userId
              const commentsQuery = query(collection(db, 'comments'), where('contentId', '==', contentId), where('userId', '==', user.uid));
              const commentsSnapshot = await getDocs(commentsQuery);
              const commentsData = [];
              commentsSnapshot.forEach((comment) => {
                  commentsData.push({ id: comment.id, ...comment.data() });
              });
              setComments(commentsData);
          } catch (error) {
              console.error('Error fetching content:', error);
          }
      };
  
      if (contentId && user) {
          fetchContentData();
      }
  }, [contentId, user]);
  
    

    const handleLikes = async () => {
        try {
            const db = getFirestore(firebaseApp);
            const auth = getAuth(firebaseApp);
            const currentUser = auth.currentUser;

            if (!currentUser) {
                console.error('User not logged in');
                return;
            }

            if (savedLike) {
                const likeQuery = query(collection(db, 'likes'), where('contentId', '==', contentId), where('userId', '==', currentUser.uid)); 
                const likeSnapshot = await getDocs(likeQuery);
                likeSnapshot.forEach(async (doc) => {
                    await deleteDoc(doc.ref); 
                });
                await updateDoc(doc(db, 'videos', contentId), {
                    likes: increment(-likeSnapshot.docs.length) 
                });
                setLikesCount((prevCount) => Math.max(0, prevCount - likeSnapshot.docs.length));
                setSavedLike(false);
            } else {
                await addDoc(collection(db, 'likes'), {
                    tutorId: content.userId,
                    playlistId: content.playlistId,
                    contentId: contentId,
                    userId: currentUser.uid,
                });
                await updateDoc(doc(db, 'videos', contentId), {
                    likes: increment(1)
                });
                setLikesCount((prevCount) => prevCount + 1);
                setSavedLike(true);
            }
        } catch (error) {
            console.error('Error handling likes:', error);
        }
    };

    const handleCommentSubmit = async (event) => {
        event.preventDefault();
        try {
            const db = getFirestore(firebaseApp);
            const auth = getAuth(firebaseApp);
            const currentUser = auth.currentUser;
    
            if (!currentUser) {
                console.error('User not logged in');
                return;
            }
    
            const commentId = Math.random().toString(36).substring(2);
    
            await addDoc(collection(db, 'comments'), {
                id: commentId, 
                contentId: contentId,
                tutorId:tutor.userId,
                playlistId: content.playlistId,
                userId: currentUser.uid,
                userName: currentUser.displayName,
                userProfilePhoto: currentUser.photoURL,
                commentText: commentText,
                date: new Date().toISOString()
            });
    
            const newComment = {
                id: commentId,
                contentId: contentId,
                playlistId: content.playlistId,
                userId: currentUser.uid,
                userName: currentUser.displayName,
                userProfilePhoto: currentUser.photoURL,
                commentText: commentText,
                date: new Date().toISOString()
            };
    
            // Update the comments state with the new comment
            setComments([...comments, newComment]);
    
            setCommentText("");
            alert('Comment Added Successfully !!');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };
    

    const handleCommentChange = (event) => {
        setCommentText(event.target.value);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

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
            console.error('Error deleting comment:', error);
        }
    };

    const enableEdit = (commentId, commentText) => {
        setEditableCommentId(commentId);
        setEditableCommentText(commentText);
    };

    const handleEditComment = async (commentId, newCommentText) => {
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
                commentText: newCommentText,
                date: new Date().toISOString()
            });
    
            setComments(comments.map(comment => {
                if (comment.id === commentId) {
                    return { ...comment, commentText: newCommentText };
                }
                return comment;
            }));
    
            setEditableCommentId(null);
            setEditableCommentText("");
    
            alert('Comment Updated !!');
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };
    
    const handleReadMore = () => {
        setShowFullDescription(true);
    };
    
    const handleReadLess = () => {
        setShowFullDescription(false);
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
            <section className="watch-video">
                <div className="video-details">
                    <video ref={videoRef} src={content?.videoUrl} className="video" poster={content?.poster} controls autoPlay></video>
                    <h3 className="title">{content?.title}</h3>
                    <div className="info">
                        <p>
                            <i><FaCalendar /></i>
                            <span>{content?.date}</span>
                        </p>
                        <p>
                            <i><FaHeart /></i>
                            <span>{formatCount(likesCount)} Likes</span>
                        </p>
                    </div>
                    <div className="tutor">
                        <img src={tutor?.photoURL} alt="Tutor_Profile_Photo" />
                        <div>
                            <h3>{tutor?.displayName}</h3>
                            <span>{tutor?.profession}</span>
                        </div>
                    </div>
                    <form action="" className="flex">
                        <input type="hidden" name="content_id" value={content?.id} />
                        <Link to={`/User/ViewPlaylist/${content?.playlistId}`} className="inline-btn">View playlist</Link>
                        <button type="button" name="like_content" onClick={handleLikes}>
                            <i><FaHeart /></i><span>{savedLike ? 'Unlike' : 'Like'}</span>
                        </button>
                    </form>
                    <div className="description">
                        <p>{showFullDescription ? content?.description : content?.description.slice(0, 250)}</p>
                        {content?.description.length > 250 && (
                            showFullDescription ? (
                                <button onClick={handleReadLess} className="read-more-btn" style={{marginLeft:'0.5rem',color:'red'}}>Read Less</button>
                            ) : (
                                <button onClick={handleReadMore} className="read-more-btn" style={{marginLeft:'0.5rem',color:'red'}}>Read More</button>
                            )
                        )}
                    </div>
                </div>
            </section>
            
            <section className="comments">
                <h1 className="heading">Add a Comment</h1>
                <form action="" onSubmit={handleCommentSubmit} className="add-comment">
                    <input type="hidden" name="content_id" value={content?.id} />
                    <textarea name="commentText" placeholder="Write Your Comment..." maxLength="1000" cols="30" rows="10" onChange={handleCommentChange} required></textarea>
                    <input type="submit" value="Add Comment" name="add_comment" className="inline-btn" />
                </form>
                <h1 className="heading">User Comments</h1>
                <div className="show-comments">
                    {comments.length === 0 ? (
                        <p className='empty'>No comments added yet</p>
                    ) : 
                    (
                        comments.map((comment)=>(
                            <div className='box' key={comment.id}>
                                <div className='user'>
                                    <img src={comment.userProfilePhoto}alt="User_Profile_Photo" />
                                    <div>
                                        <h3>{comment.userName}</h3>
                                        <span>{formatDate(comment.date)}</span>
                                    </div>
                                </div>
                                {editableCommentId===comment.id ?(
                                    <div className='edit-comment' style={{height:'3rem'}}>
                                        <textarea value={editableCommentText} onChange={(e)=>setEditableCommentText(e.target.value)} maxLength={1000} rows={2.5} style={{resize: 'none',fontSize: '1.5rem',padding: '.5rem', backgroundColor:'var(--light-bg)', color:'--white',width:'70%',borderRadius:'.5rem'}} name='commentText' placeholder='Write Editable Comment'></textarea>
                                        <button type='button' className='inline-option-btn' onClick={()=>handleEditComment(comment.id,editableCommentText)}  style={{float:"right",marginTop:'0rem',}}>Update Comment</button>
                                    </div>
                                )
                                :(
                                    <>
                                        <p className='text'>{comment.commentText}</p>
                                        <form className='flex-btn'>
                                            <button type='button' className='inline-option-btn' onClick={()=>enableEdit(comment.id,comment.commentText)}>Edit Comment</button>
                                            <button type='button' className='inline-delete-btn' onClick={()=>handleDeleteComment(comment.id)}>Delete Comment</button>
                                        </form>
                                    </>
                                )
                                }
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default WatchVideo;