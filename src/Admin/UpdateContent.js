import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminHeader from '../Header/AdminHeader';
import { getFirestore, doc, deleteDoc, updateDoc, getDocs, collection, getDoc } from 'firebase/firestore';
import { firebaseApp, storage } from '../Firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

const UpdateContent = () => {
    const navigate = useNavigate();
    const { contentId } = useParams();
    const [contentData, setContentData] = useState({
        status: '',
        title: '',
        description: '',
        thumbnail: '',
        playlistTitle: '',
        playlistId: '',
        video: ''
    });
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContentData = async () => {
            try {
                const db = getFirestore(firebaseApp);
                const docRef = doc(db, 'videos', contentId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setContentData({
                        status: data.status,
                        title: data.title,
                        description: data.description,
                        playlistTitle: data.playlistsTitle,
                        playlistId: data.playlistId,
                        thumbnail: data.thumbnailUrl,
                        video: data.videoUrl
                    });
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching content data:', error);
            }
        };

        const fetchPlaylists = async () => {
            try {
                const db = getFirestore(firebaseApp);
                const playlistsCollection = collection(db, 'playlists');
                const querySnapshot = await getDocs(playlistsCollection);

                const playlistsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPlaylists(playlistsData);
            } catch (error) {
                console.error('Error fetching playlists:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContentData();
        fetchPlaylists();
    }, [contentId]);

    const handleStatusChange = (e) => {
        setContentData({
            ...contentData,
            status: e.target.value
        });
    };

    const handlePlaylistChange = (e) => {
        const selectedPlaylistId = e.target.value;
        const selectedPlaylist = playlists.find(playlist => playlist.id === selectedPlaylistId);
        setContentData({
            ...contentData,
            playlistTitle: selectedPlaylist.title,
            playlistId: selectedPlaylistId
        });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const db = getFirestore(firebaseApp);
            const contentRef = doc(db, 'videos', contentId);

            // Upload thumbnail
            if (contentData.thumbnail) {
                const thumbStorageRef = ref(storage, `videoThumbnails/${contentData.thumbnail.name}`);
                await uploadBytesResumable(thumbStorageRef, contentData.thumbnail);
                const thumbnailUrl = await getDownloadURL(thumbStorageRef);
                setContentData(prevState => ({
                    ...prevState,
                    thumbnailUrl: thumbnailUrl
                }));
            }

            // Upload video
            if (contentData.video) {
                const videoStorageRef = ref(storage, `videos/${contentData.video.name}`);
                await uploadBytesResumable(videoStorageRef, contentData.video);
                const videoUrl = await getDownloadURL(videoStorageRef);
                setContentData(prevState => ({
                    ...prevState,
                    videoUrl: videoUrl
                }));
            }

            // Update content data
            await updateDoc(contentRef, {
                status: contentData.status,
                title: contentData.title,
                description: contentData.description,
                playlistId: contentData.playlistId,
                playlistsTitle: contentData.playlistTitle,
                thumbnailUrl: contentData.thumbnailUrl || contentData.thumbnail,
                videoUrl: contentData.videoUrl || contentData.video
            });

            alert('Content successfully updated!');
            // Optionally, redirect or show a success message
            navigate('/Admin/Dashboard');
        } catch (error) {
            console.error('Error updating document:', error);
        }
    };

    const handleDeleteContent = async () => {
        try {
            const db = getFirestore(firebaseApp);
            await deleteDoc(doc(db, 'videos', contentId));
            console.log('Content successfully deleted!');
            // Optionally, redirect or show a success message
        } catch (error) {
            console.error('Error deleting document:', error);
        }
    };

    return (
        <div>
            <AdminHeader />
            <section className="video-form">
                <h1 className="heading">Update Content</h1>
                <form onSubmit={handleFormSubmit} encType="multipart/form-data">
                    <input type="hidden" name="video_id" value={contentId} />
                    <input type="hidden" name="old_thumb" value={contentData.thumbnail} />
                    <input type="hidden" name="old_video" value={contentData.video} />
                    <p>Update Status <span>*</span></p>
                    <select name="status" className="box" required value={contentData.status} onChange={handleStatusChange}>
                        <option value="Active">Active</option>
                        <option value="Deactive">Deactive</option>
                    </select>
                    <p>Update Title <span>*</span></p>
                    <input type="text" name="title" maxLength="100" required placeholder="Enter Video Title" className="box" value={contentData.title || ''} onChange={(e) => setContentData({...contentData, title: e.target.value})} />
                    <p>Update Description <span>*</span></p>
                    <textarea name="description" className="box" required placeholder="Write Description" maxLength="100000000000" cols="30" rows="10" value={contentData.description || ''} onChange={(e) => setContentData({...contentData, description: e.target.value})}></textarea>
                    <p>Update Playlist</p>
                    <select name="playlist" className="box" onChange={handlePlaylistChange} value={contentData.playlistId || ''}>
                        <option value="" disabled>Select Playlist</option>
                        {loading ? (
                            <option disabled>Loading...</option>
                        ) : (
                            playlists.map(playlist => (
                                <option key={playlist.id} value={playlist.id}>{playlist.title}</option>
                            ))
                        )}
                    </select>
                    <img src={contentData.thumbnail} alt="" />
                    <p>Update Thumbnail</p>
                    <input type="file" name="thumb" accept="image/*" className="box" onChange={(e) => setContentData({...contentData, thumbnail: e.target.files[0] || contentData.thumbnail})} />
                    <video src={contentData.video} controls></video>
                    <p>Update Video</p>
                    <input type="file" name="video" accept="video/*" className="box" onChange={(e) => setContentData({...contentData, video: e.target.files[0] || contentData.video})} />
                    <input type="submit" value="Update Content" name="update" className="btn" />
                    <div className="flex-btn">
                        <Link to={`/Admin/ViewContent/${contentData.playlistId}`} className="option-btn">View Content</Link>
                        <button type="button" onClick={handleDeleteContent} className="delete-btn">Delete Content</button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default UpdateContent;
