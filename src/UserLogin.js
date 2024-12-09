import React from 'react';
import './LoginRegister.css';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseApp } from './Firebase';
import UserHeader from './Header/UserHeader';

const UserLogin = () => {
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.pass.value;

        try {
            const auth = getAuth(firebaseApp);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            alert(userCredential.user.displayName + ' Login Successfully');
            navigate('/');
        } catch (error) {
            alert('Login Failed. Please Signup First');
        }
    };

    return (
        <div>
            <UserHeader />
            <section className="form-container">
                <form onSubmit={handleLogin} className="login">
                    <h3>Welcome Back!</h3>
                    <p>Your Email <span>*</span></p>
                    <input type="email" name="email" placeholder="Enter Your Email" maxLength="80" required className="box" />
                    <p>Your Password <span>*</span></p>
                    <input type="password" name="pass" placeholder="Enter Your Password" maxLength="20" required className="box" />
                    <input type="submit" name="submit" value="Login Now" className="btn" />
                    <p className="link">Don't have an account? <Link to="/UserRegister">Register Now</Link></p>
                </form>
            </section>
        </div>
    );
};

export default UserLogin;