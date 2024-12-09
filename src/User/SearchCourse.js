import React, { useState, useEffect } from 'react';
import '../HomeComponent/Courses.css';
import { Link, useLocation } from 'react-router-dom';
import UserHeader from '../Header/UserHeader';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { firebaseApp } from '../Firebase';

const RAPIDAPI_YOUTUBE_URL = 'https://youtube-v2.p.rapidapi.com/search/';
const RAPIDAPI_YOUTUBE_KEY = '798803bed3msh80d5ba83d62a54ep1e5e76jsnb3348f09825c';

const SearchCourse = () => {
    const location = useLocation();
    const searchQuery = new URLSearchParams(location.search).get('query');
    const [courses, setCourses] = useState([]);
    const [youtubeVideos, setYoutubeVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (searchQuery) {
            const fetchCourses = async () => {
                try {
                    const db = getFirestore(firebaseApp);
                    const querySnapshot = await getDocs(collection(db, 'playlists'));
                    const fetchedCourses = [];
                    const normalizedSearchQuery = searchQuery.toLowerCase();

                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        const title = data.title.toLowerCase();

                        if (title.includes(normalizedSearchQuery)) {
                            fetchedCourses.push({
                                id: doc.id,
                                title: data.title,
                                tutor: data.tutor,
                                date: data.date,
                                thumbnail: data.thumbnail,
                                tutorName: data.userName,
                                tutorProfile: data.userProfilePhoto
                            });
                        }
                    });

                    setCourses(fetchedCourses);
                    setLoading(false);
                    setError(null);
                } catch (error) {
                    console.error('Error fetching courses:', error);
                    setLoading(false);
                    setError('An error occurred while fetching courses. Please try again or search for something different.');
                }
            };

            fetchCourses();
        }
    }, [searchQuery]);

    useEffect(() => {
        if (searchQuery) {
            const fetchYouTubeVideos = async () => {
                try {
                    const response = await fetch(`${RAPIDAPI_YOUTUBE_URL}?query=${encodeURIComponent(searchQuery)}&country=in`, {
                        method: 'GET',
                        headers: {
                            'x-rapidapi-key': RAPIDAPI_YOUTUBE_KEY,
                            'x-rapidapi-host': 'youtube-v2.p.rapidapi.com'
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    const data = await response.json();
                    // console.log('YouTube API Response:', data);

                    if (data.videos) {
                        const fetchedVideos = data.videos.map((item) => ({
                            id: item.video_id,
                                title: item.title.length > 25 ? `${item.title.substring(0, 25)}...` : item.title,
                                thumbnail: item.thumbnails[1]?.url || item.thumbnails[0]?.url,
                                channelTitle: item.author,
                                publishedAt: item.published_time,
                        }));
                        setYoutubeVideos(fetchedVideos);
                    }
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching YouTube videos:', error);
                    setLoading(false);
                    setError('An error occurred while fetching YouTube videos. Please try again later.');
                }
            };

            fetchYouTubeVideos();
        }
    }, [searchQuery]);

    return (
        <div>
            <UserHeader />
            <section className="Courses">
                <h1 className="heading">Search Results for "{searchQuery}"</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className='error'>{error}</p>
                ) : courses.length === 0 ? (
                    <p className='empty'>No courses found for "{searchQuery}".</p>
                ) : (
                    <div className="box-container">
                        {courses.map(course => (
                            <div className="box" key={course.id}>
                                <div className="tutor">
                                    <img src={course.tutorProfile} alt="" />
                                    <div>
                                        <h3>{course.tutorName}</h3>
                                        <span>{course.date}</span>
                                    </div>
                                </div>
                                <img src={course.thumbnail} className="thumb" alt="" />
                                <h3 className="title">{course.title}</h3>
                                <Link to={`/User/CoursePlaylist?plid=${course.id}`} className="inline-btn">View Playlist</Link>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="Courses">
                <h1 className="heading">Recommended Videos</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : youtubeVideos.length === 0 ? (
                    <p className='empty'>No videos found for "{searchQuery}".</p>
                ) : (
                    <div className="box-container">
                        {youtubeVideos.map(video => (
                            <div className="box" key={video.id}>
                                <div className="video">
                                    <iframe
                                        width="2500"
                                        height="315"
                                        src={`https://www.youtube.com/embed/${video.id}`}
                                        title={video.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                    <div style={{marginBottom:'2rem'}}>
                                        <h3>{video.channelTitle}</h3>
                                        <span>{video.publishedAt}</span>
                                    </div>
                                </div>
                                <h3 className="title">{(video.title)}</h3>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default SearchCourse;
