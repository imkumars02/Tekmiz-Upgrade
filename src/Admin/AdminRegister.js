import {React,useState} from 'react'
import { Link,useNavigate } from 'react-router-dom'
import './AdminLoginRegister.css'
import AdminHeader from '../Header/AdminHeader'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {firebaseApp } from '../Firebase';
// import { v4 as uuidv4 } from 'uuid';

const AdminRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        profession:'',
        photo: null,
    });

    const handleChange = (e) => {
        if (e.target.name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(e.target.value)) {
                alert('Please enter a valid email address');
                return;
            }
        }
    
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFormData({
                ...formData,
                photo: e.target.files[0],
            });
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password.length < 6 || formData.confirmPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
    
        try {
            const auth = getAuth(firebaseApp);
            const db = getFirestore(firebaseApp);
            const storage = getStorage(firebaseApp);
    
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
    
            // Check if userCredential and user are valid
            if (userCredential && userCredential.user) {
                const storageRef = ref(storage, `tutor_images/${formData.photo.name}`);
                await uploadBytes(storageRef, formData.photo);
                const photoURL = await getDownloadURL(storageRef);
    
                const tutorRef = doc(db, 'tutor', userCredential.user.uid); // Providing document ID with user's UID
                await setDoc(tutorRef, {
                    email: formData.email,
                    displayName: formData.displayName,
                    photoURL: photoURL,
                    userId:userCredential.user.uid,
                    profession: formData.profession
                });
    
                await updateProfile(userCredential.user,{
                    displayName: formData.displayName,
                    photoURL: photoURL,
                    userId: userCredential.user.uid,
                    profession: formData.profession
                });
    
                setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    displayName: '',
                    profession: '',
                    photo: null,
                });
    
                alert('Signup Successful!');
                navigate('/Admin/Dashboard');
            } else {
                throw new Error('User authentication failed !! Try After Sometimes');
            }
        } catch (error) {
            // console.error(error);
            alert('Signup Failed. User Already Exists');
        }
    };
        

  return (
    <div>
        <AdminHeader/>
        <section className="form-container">
            <form className="register" action="" method="post" encType="multipart/form-data" onSubmit={handleSubmit}>
            <h3>Register New</h3>
            <div className="flex">
                <div className="col">
                    <p>Your Name <span>*</span></p>
                    <input type="text" name="displayName" placeholder="Enter Your Name" maxLength="50" required className="box" onChange={handleChange}/>
                    <p>Your Profession <span>*</span></p>
                    <select name="profession" className="box" required onChange={handleChange}>
                        <option value="">Select Your Profession</option>
                        <option value="Developer">Developer</option>
                        <option value="Designer">Designer</option>
                        <option value="Musician">Musician</option>
                        <option value="Biologist">Biologist</option>
                        <option value="Teacher">Teacher</option>
                        <option value="Engineer">Engineer</option>
                        <option value="Lawyer">Lawyer</option>
                        <option value="Accountatn">Accountatn</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Journalist">Journalist</option>
                        <option value="Photographer">Photographer</option>
                    </select>
                    <p>Your Email <span>*</span></p>
                    <input type="email" name="email" placeholder="Enter Your Email" maxLength="50" required className="box" onChange={handleChange}/>
                </div>
                <div className="col">
                    <p>Your Password <span>*</span></p>
                    <input type="password" name="password" placeholder="Enter Your Password" maxLength="20" required className="box" onChange={handleChange}/>
                    <p>Confirm Password <span>*</span></p>
                    <input type="password" name="confirmPassword" placeholder="Confrim Your Password" maxLength="20" required className="box"onChange={handleChange} />
                    <p>Select Picture <span>*</span></p>
                    <input type="file" name="image" accept="image/*" required className="box" onChange={handleFileChange} />
                </div>
            </div>
            <p className="link">Already have an account? <Link to="/Admin/AdminLogin">Login Now</Link></p>
            <input type="submit" name="submit" value="Register now" className="btn" />
            </form>
        </section>
    </div>
  )
}

export default AdminRegister