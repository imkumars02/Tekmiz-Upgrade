import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import AdminHeader from '../Header/AdminHeader';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import necessary functions from Firebase Storage
import { storage } from '../Firebase'; // Import the storage object from your Firebase configuration file

const UpdatePlaylist = () => {
    // Define state variables to store playlist data
    const [status, setStatus] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState(null);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Extract playlistId from URL params using useParams hook
    const { playlistId } = useParams();

    // Function to fetch playlist data from Firestore
    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const db = getFirestore(); // Get Firestore instance
                const playlistRef = doc(db, 'playlists', playlistId); // Use the extracted playlistId
                const playlistSnapshot = await getDoc(playlistRef); // Get the document snapshot
                if (playlistSnapshot.exists()) {
                    const playlistData = playlistSnapshot.data(); // Extract playlist data
                    setStatus(playlistData.status);
                    setTitle(playlistData.title);
                    setDescription(playlistData.description);
                    setThumbnailFile(playlistData.thumbnail);
                    // setLoading(false); // Set loading to false once data is fetched
                } else {
                    alert('Playlist not found');
                    // setLoading(false); // Set loading to false in case of error
                }
            } catch (error) {
                alert('Error fetching playlist');
                // setLoading(false); // Set loading to false in case of error
                console.error('Error fetching playlist:', error);
            }
        };

        fetchPlaylist();
    }, [playlistId]); // Include playlistId in the dependency array to re-fetch playlist data when it changes

    // Function to handle form submission and update playlist data
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const db = getFirestore(); // Get Firestore instance
            const playlistRef = doc(db, 'playlists', playlistId); // Use the extracted playlistId

            // Update other fields first
            await updateDoc(playlistRef, {
                status,
                title,
                description,
            });

            // Check if a new thumbnail file is selected
            if (thumbnailFile) {
                // Upload the new thumbnail file to Firebase Storage
                const storageRef = ref(storage, `thumbnails/${playlistId}/${thumbnailFile.name}`);
                await uploadBytes(storageRef, thumbnailFile);

                // Get the download URL of the uploaded thumbnail
                const thumbnailUrl = await getDownloadURL(storageRef);

                // Update the thumbnail field in Firestore with the new URL
                await updateDoc(playlistRef, {
                    thumbnail: thumbnailUrl,
                });
            }

            alert('Playlist updated successfully');
            navigate('/Admin/Dashboard');
        } catch (error) {
            alert('Error updating playlist:', error);
        }
    };

    // Render the component
    return (
        <div>
            <AdminHeader />
            <section className="playlist-form">
                <h1 className="heading">Update Playlist</h1>
                {/* Render form to update playlist data */}
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <input type="hidden" name="old_image" value="" />
                    <p>Playlist Status <span>*</span></p>
                    <select name="status" className="box" required value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="">Select Status</option>
                        <option value="Active">Active</option>
                        <option value="Deactive">Deactive</option>
                    </select>
                    <p>Playlist Title <span>*</span></p>
                    <input type="text" name="title" maxLength="100" required placeholder="Enter Playlist Title" value={title} onChange={(e) => setTitle(e.target.value)} className="box" />
                    <p>Playlist Description <span>*</span></p>
                    <textarea name="description" className="box" required placeholder="Write Description" maxLength="100000000000" cols="30" rows="10" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                    <p>Playlist Thumbnail <span>*</span></p>
                    {thumbnailFile && (
                        <div className="thumb">
                            <span></span>
                            <img src={thumbnailFile} alt="" /> {/* Use thumbnailFile instead of thumbnail */}
                        </div>
                    )}
                    <input type="file" name="image" accept="image/*" className="box" onChange={(e) => setThumbnailFile(e.target.files[0])} />
                    <input type="submit" value="Update Playlist" name="submit" className="btn" />
                    <div className="flex-btn">
                        <input type="submit" value="Delete" className="delete-btn" name="delete" />
                        <Link to={`/Admin/AdminViewPlaylist/${playlistId}`} className="option-btn">View Playlist</Link>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default UpdatePlaylist;
