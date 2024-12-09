import React from 'react'
import AdminHeader from '../Header/AdminHeader'
import { Link,useNavigate} from 'react-router-dom'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseApp } from '../Firebase';
import {getDatabase, ref, set } from 'firebase/database';

const AdminLogin = () => {
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.pass.value;

        try {
            const auth = getAuth(firebaseApp);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
      
            // Get the user UID
            const userId = user.uid;
            // Store user data in the Realtime Database
            const db = getDatabase();
            const userRef = ref(db, 'tutor/' + userId); // Reference to 'users' collection, with UID as key
            await set(userRef, {
                email: user.email,
            });
            alert(userCredential.user.displayName + ' Login Successfully');
            navigate('/Admin/Dashboard');
        } catch (error) {
            alert('Login Failed. Signup First');
        }
    };
  return (
    <div>
        <AdminHeader/>
        <section className="form-container" style={{marginTop:'3rem'}}> 
            <form action="" method="post" encType="multipart/form-data" className="login"
            onSubmit={handleLogin}>
                <h3>Welcome Back!</h3>
                <p>Your Email <span>*</span></p>
                <input type="email" name="email" placeholder="Enter Your Email" maxLength="50" required className="box" />
                <p>Your Password <span>*</span></p>
                <input type="password" name="pass" placeholder="Enter Your Password" maxLength="20" required className="box" />
                <p className="link">Don't have an account? <Link to="/Admin/AdminRegister">Register New</Link></p>
                <input type="submit" name="submit" value="Login Now" className="btn" />
            </form>

        </section>
    </div>
  )
}

export default AdminLogin