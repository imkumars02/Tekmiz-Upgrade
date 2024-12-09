import React, { useState, useEffect } from 'react'
import './AddContent.css'
import AdminHeader from '../Header/AdminHeader'
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import { firebaseApp, storage } from '../Firebase'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'

const AddContent = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [playlists, setPlaylists] = useState([]);
    const [formData, setFormData] = useState({
        status: '',
        title: '',
        description: '',
        playlist: '',
        date: '',
        thumb: '',
        video: ''
    });

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const fetchUser = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                fetchPlaylists(user.uid); // Fetch playlists after user is set
            }
        });

        return () => fetchUser();
    }, []);

    const fetchPlaylists = async (userId) => {
        try {
            const db = getFirestore(firebaseApp);
            const playlistsCollection = collection(db, 'playlists');
            const q = query(playlistsCollection, where("userId", "==", userId));
            const playlistsSnapshot = await getDocs(q);
            const playlistsData = playlistsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setPlaylists(playlistsData);
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    };

    const handleChange = (e) => {
        const { name, files } = e.target;
    
        // Check if files are present
        if (files && files[0]) {
            // For video, set the video file directly to the state
            if (name === "video") {
                setFormData({
                    ...formData,
                    [name]: files[0]
                });
            } else if (name === "thumb") {
                // For thumbnail, ensure that it's an image file
                const imageFile = files[0];
                if (imageFile.type.startsWith("image/")) {
                    setFormData({
                        ...formData,
                        [name]: imageFile
                    });
                } else {
                    // If not an image, show an error message or handle accordingly
                    console.error("Invalid file format for thumbnail. Please select an image file.");
                }
            }
        }
        // For other form fields, update the state as usual
        else {
            const { name, value } = e.target;
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const storageRef = ref(storage, `videos/${formData.video.name}`);
            const thumbStorageRef = ref(storage, `videoThumbnails/${formData.thumb.name}`);
    
            // Upload video and thumbnail files to Firebase Storage
            const videoUploadTask = uploadBytesResumable(storageRef, formData.video);
            const thumbUploadTask = uploadBytesResumable(thumbStorageRef, formData.thumb);
            
            const [videoSnapshot, thumbSnapshot] = await Promise.all([videoUploadTask, thumbUploadTask]);
    
            const db = getFirestore(firebaseApp);
            const videosCollection = collection(db, 'videos');
    
            const selectedPlaylist = playlists.find((playlist) => playlist.title === formData.playlist);
    
            if (!selectedPlaylist) {
                console.error('Selected playlist not found.');
                return;
            }
    
            const contentData = {
                userId: user.uid,
                userName: user.displayName,
                userProfilePhoto: user.photoURL,
                playlistId: selectedPlaylist.id,
                playlistsTitle: formData.playlist,
                status: formData.status,
                title: formData.title,
                description: formData.description,
                date: formData.date,
                // Store URLs of uploaded video and thumbnail
                videoUrl: await getDownloadURL(videoSnapshot.ref),
                thumbnailUrl: await getDownloadURL(thumbSnapshot.ref),
            };
    
            // Add content data to Firestore
            await addDoc(videosCollection, contentData);
            alert('Content uploaded successfully!');
            setFormData({
                status: '',
                title: '',
                description: '',
                playlist: '',
                date: '',
                thumb: '',
                video: ''
            });
            navigate('/Admin/Dashboard');
        } catch (error) {
            console.error('Error uploading video:', error);
        }
    };
    

    return (
        <>
            <AdminHeader />
            <section className="video-form">
                <h1 className="heading">Upload Content</h1>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <p>Video Status <span>*</span></p>
                    <select name="status" className="box" value={formData.status} onChange={handleChange} required>
                        <option value="">Select Status</option>
                        <option value="Active">Active</option>
                        <option value="Deactive">Deactive</option>
                    </select>
                    <p>Video Title <span>*</span></p>
                    <input type="text" name="title" maxLength="100" value={formData.title} onChange={handleChange} required placeholder="Enter Video Title" className="box" />
                    <p>Video Description <span>*</span></p>
                    <textarea name="description" value={formData.description} onChange={handleChange} className="box" required placeholder="Write Description" maxLength="100000000000" cols="30" rows="10"></textarea>
                    <p>Video Playlist <span>*</span></p>
                    <select name="playlist" value={formData.playlist} onChange={handleChange} className="box" required>
                        <option value="">Select Playlist</option>
                        {playlists.map((playlist) => (
                            <option key={playlist.id} value={playlist.title}>{playlist.title}</option>
                        ))}
                    </select>
                    <p>Select Date <span>*</span></p>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required className="box" />
                    <p>Select Thumbnail <span>*</span></p>
                    <input type="file" name="thumb" accept="image/*" onChange={handleChange} required className="box" />
                    <p>Select Video <span>*</span></p>
                    <input type="file" name="video" accept="video/*" onChange={handleChange} required className="box" />
                    <input type="submit" value="Upload Video" name="submit" className="btn" />
                </form>
            </section>
        </>
    );
};

export default AddContent;