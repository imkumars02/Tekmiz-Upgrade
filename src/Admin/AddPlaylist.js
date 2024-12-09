import React, { useState, useEffect } from 'react';
import './AddPlaylist.css';
import AdminHeader from '../Header/AdminHeader';
import { getFirestore, collection, addDoc } from 'firebase/firestore'; 
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { useNavigate} from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from '../Firebase';
// import your authentication context

const AddPlaylist = () => {
  const navigate = useNavigate();
  // const userId = useParams();
  const [user, setUser] = useState(null);
  // const { user } = useAuth(); // assuming you have a custom hook for authentication
  const [status, setStatus] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
      const auth = getAuth(firebaseApp);
      const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
              setUser(user);
          } else {
              setUser(null);
          }
      });
      return () => unsubscribe();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setThumbnail(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Upload thumbnail to Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, `thumbnails/${thumbnail.name}`);
      await uploadBytes(storageRef, thumbnail);
      
      // Get download URL
      const imageUrl = await getDownloadURL(storageRef);

      // Initialize Firestore
      const db = getFirestore();
      
      // Add playlist data to Firestore
      const playlistsCollection = collection(db, 'playlists');
      await addDoc(playlistsCollection, {
        status,
        title,
        description,
        date,
        thumbnail: imageUrl,
        userId:user.uid,
        // Add user information
        userName: user.displayName,
        userProfilePhoto: user.photoURL
      });

      // Reset form fields
      setStatus('');
      setTitle('');
      setDescription('');
      setDate('');
      setThumbnail(null);
          
      alert('Playlist Created Successfully');
      navigate('/Admin/Dashboard');
    } catch (error) {
    //   console.error('Error adding playlist:', error);
      alert('Playlist was not created. Please try again.');
    }
  };

  return (
    <>
      <AdminHeader />
      <section className="playlist-form">
        <h1 className="heading">Create Playlist</h1>
        <form onSubmit={handleSubmit} encType="multipart/form-data" method='POST'>
          <p>Playlist Status <span>*</span></p>
          <select name="status" className="box" required value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Deactive">Deactive</option>
          </select>
          <p>Playlist Title <span>*</span></p>
          <input type="text" name="title" maxLength="100" required placeholder="Enter Playlist Title" className="box" value={title} onChange={(e) => setTitle(e.target.value)} />
          <p>Playlist Description <span>*</span></p>
          <textarea name="description" className="box" required placeholder="Write Description" maxLength="100000000000" cols="30" rows="10" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
          <p>Playlist Date <span>*</span></p>
          <input type="date" name="date" required className="box" value={date} onChange={(e) => setDate(e.target.value)} />
          <p>Playlist Thumbnail <span>*</span></p>
          <input type="file" name="image" accept="image/*" required className="box" onChange={handleImageChange} />
          <input type="submit" value="Create Playlist" name="submit" className="btn" />
        </form>
      </section>
    </>
  );
}

export default AddPlaylist;