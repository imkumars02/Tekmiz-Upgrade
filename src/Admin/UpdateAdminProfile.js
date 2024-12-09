import { useState, useEffect } from 'react';
import { firebaseApp } from '../Firebase';
import { getAuth, onAuthStateChanged, EmailAuthProvider, updatePassword, updateProfile, reauthenticateWithCredential } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import AdminHeader from '../Header/AdminHeader';

const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

const UpdateAdminProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [newName, setNewName] = useState('');
  const [email, setEmail] = useState('');
  const [newPhotoURL, setNewPhotoURL] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [formData, setFormData] = useState({
    profession: '',
  });

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const retrieveUserData = async (uid) => {
      try {
        const userDoc = await getDoc(doc(firestore, 'tutor', uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData(prevFormData => ({
            ...prevFormData,
            profession: userData.profession,
          }));
        }
      } catch (error) {
        console.error('Error retrieving user data:', error.message);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        retrieveUserData(currentUser.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []); // Removed formData from the dependency array

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const imageFile = e.target.files[0];
      const storageRef = ref(storage, `tutor_images/${user.uid}/${imageFile.name}`);
      uploadBytes(storageRef, imageFile).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((downloadURL) => {
          setNewPhotoURL(downloadURL);
        });
      });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    // Check if any of the required fields are empty
    if (!newName || !email || !oldPassword || !newPassword || !confirmNewPassword) {
      alert("Please fill in all the fields!");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert("Password doesn't match!");
      return;
    }
    
    try {
      const credential = EmailAuthProvider.credential(email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updateProfile(user, {
        displayName: newName,
        photoURL: newPhotoURL ? newPhotoURL : user.photoURL,
        profession: formData.profession, //Updating Profession Here
      });
    //   console.log(formData.profession);
      await updatePassword(user, newPassword);
      await savePhotoURLToDatabase(user.uid, newPhotoURL);
      await updateDoc(doc(firestore, 'tutor', user.uid), {
        profession: formData.profession, // Update profession in database
      });
      alert('Profile updated successfully!');
      navigate('/Admin/ViewProfile');
    } catch (error) {
      //   console.error('Error updating profile and changing password:', error.message);
      alert('Profile not updated! Please try again.');
    }
  };
  

  const savePhotoURLToDatabase = async (uid, photoURL) => {
    try {
      await updateDoc(doc(firestore, 'tutor', uid), {
        photoURL: photoURL,
      });
    } catch (error) {
    //   console.error('Error saving photoURL to database:', error.message);
      throw error;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevFormData => ({
      ...prevFormData,
      [name]: value,
    }));
  }  

  return (
    <div>
      <AdminHeader />
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
              <p>Your Profession</p>
              <select name="profession" value={formData.profession} onChange={handleChange} className="box">
                <option value="Developer">Developer</option>
                <option value="Designer">Designer</option>
                <option value="Musician">Musician</option>
                <option value="Biologist">Biologist</option>
                <option value="Teacher">Teacher</option>
                <option value="Engineer">Engineer</option>
                <option value="Lawyer">Lawyer</option>
                <option value="Accountant">Accountant</option>
                <option value="Doctor">Doctor</option>
                <option value="Journalist">Journalist</option>
                <option value="Photographer">Photographer</option>
              </select>
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

export default UpdateAdminProfile;