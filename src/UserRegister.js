import React, { useState } from 'react';
import './LoginRegister.css';
import { Link, useNavigate } from 'react-router-dom';
import UserHeader from './Header/UserHeader';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseApp } from './Firebase';
 
const UserRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        photo: null,
    });

    const handleChange = (e) => {
        if (e.target.name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(e.target.value)) {
                setFormData({
                    ...formData,
                    [e.target.name]: e.target.value,
                });
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
        if (formData.password.length < 6) {
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
                const storageRef = ref(storage, `user_images/${formData.photo.name}`);
                await uploadBytes(storageRef, formData.photo);
                const photoURL = await getDownloadURL(storageRef);
                await updateProfile(userCredential.user,{
                    displayName:formData.displayName,
                    photoURL:photoURL,
                });
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    email: formData.email,
                    displayName: formData.displayName,
                    photoURL: photoURL,
                });

                setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    displayName: '',
                    photo: null,
                });
                // console.log(userCredential);
                alert('Signup Successful!');
                navigate('/UserLogin');
            } else {
                throw new Error('User authentication failed !! Try After Sometimes');
            }
        } catch (error) {
            console.error(error);
            alert('Signup Failed User Already Exists');
            navigate('/Login');
        }
    };

    return (
        <div>
            <UserHeader />
            <section className="form-container">
                <form className="register" onSubmit={handleSubmit} encType="multipart/form-data">
                    <h3>New Registration</h3>
                    <div className="flex">
                        <div className="cols">
                            <p>Your Name <span>*</span></p>
                            <input type="text" name="displayName" placeholder="Enter Your Name" maxLength="50" required onChange={handleChange} className="box" />
                            <p>Your Email <span>*</span></p>
                            <input type="email" name="email" placeholder="Enter Your Email" maxLength="80" required onChange={handleChange} className="box" />
                        </div>
                        <div className="cols">
                            <p>Your Password <span>*</span></p>
                            <input type="password" name="password" placeholder="Enter Your Password" maxLength="20" required onChange={handleChange} className="box" id='pass' />
                            <p>Confirm Password <span>*</span></p>
                            <input type="password" name="confirmPassword" placeholder="Confirm Your Password" maxLength="20" required onChange={handleChange} className="box" id='cpass' />
                        </div>
                    </div>
                    <p>Select Picture <span>*</span></p>
                    <input type="file" name="image" accept="image/*" required onChange={handleFileChange} className="box" />
                    <input type="submit" name="submit" value="Register Now" className="btn" />
                    <p className="link">Already have an account? <Link to="/UserLogin">Login Now</Link></p>
                </form>
            </section>
        </div>
    );
};

export default UserRegister;