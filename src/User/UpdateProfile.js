import { useState, useEffect } from 'react';
import { firebaseApp } from '../Firebase'; // Import Firebase app instance
import './UpdateProfile.css';
import UserHeader from '../Header/UserHeader';
import {
  getAuth,
  onAuthStateChanged,
  EmailAuthProvider,
  updatePassword,
  updateProfile,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage'; // Import Storage functions

// Initialize Firestore and Storage
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

const UpdateProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [newName, setNewName] = useState('');
  const [email, setEmail] = useState('');
  const [newPhotoURL, setNewPhotoURL] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const imageFile = e.target.files[0];
      const storageRef = ref(storage, `profile_images/${user.uid}/${imageFile.name}`);
      uploadBytes(storageRef, imageFile).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((downloadURL) => {
          setNewPhotoURL(downloadURL);
        });
      });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      alert("Password Doesn't Matched !!");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(email, oldPassword);

      // Reauthenticate the user
      await reauthenticateWithCredential(user, credential);

      // Update profile
      await updateProfile(user, {
        displayName: newName,
        photoURL: newPhotoURL ? newPhotoURL : user.photoURL,
      });

      // Update password
      await updatePassword(user, newPassword);

      // Save updated photoURL to the backend database
      await savePhotoURLToDatabase(user.uid, newPhotoURL);

      alert('Profile Updated Successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error updating profile and changing password:', error.message);
      alert('Profile Not Updated !! Please Try Again.');
    }
  };

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        retrievePhotoURLFromDatabase(currentUser.uid).then((photoURL) => {
          if (photoURL) {
            setNewPhotoURL(photoURL);
          }
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const savePhotoURLToDatabase = async (uid, photoURL) => {
    try {
      await updateDoc(doc(firestore, 'users', uid), {
        photoURL: photoURL,
      });
    } catch (error) {
      console.error('Error saving photoURL to database:', error.message);
      throw error;
    }
  };

  const retrievePhotoURLFromDatabase = async (uid) => {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data().photoURL;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error retrieving photoURL from database:', error.message);
      throw error;
    }
  };

  return (
    <div>
      <UserHeader />
      <section className="Updateform-container" style={{ minHeight: 'calc(100vh - 19rem)' }}>
        <form action="" method="post" encType="multipart/form-data" onSubmit={handleUpdateProfile}>
          <h3>Update Profile</h3>
          <div className="flex">
            <div className="col">
              <p>Your Name</p>
              <input
                type="text"
                name="name"
                placeholder={user?.displayName || 'Enter Your Name'}
                maxLength="100"
                className="box"
                onChange={(e) => setNewName(e.target.value)}
              />
              <p>Your Email</p>
              <input
                type="email"
                name="email"
                placeholder={user ? user.email : 'Enter Your Email'}
                maxLength="100"
                className="box"
                onChange={(e) => setEmail(e.target.value)}
              />
              <p>Update Picture</p>
              <input
                type="file"
                name="image"
                accept="image/*"
                className="box"
                onChange={handleFileChange}
              />
            </div>
            <div className="col">
              <p>Old Password</p>
              <input
                type="password"
                name="oldPassword"
                placeholder="Enter Your Old Password"
                maxLength="50"
                className="box"
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <p>New Password</p>
              <input
                type="password"
                name="newPassword"
                placeholder="Enter Your New password"
                maxLength="50"
                className="box"
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <p>Confirm Password</p>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Your New Password"
                maxLength="50"
                className="box"
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
          </div>
          <input type="submit" name="submit" value="Update Profile" className="btn" />
        </form>
      </section>
    </div>
  );
};

export default UpdateProfile;