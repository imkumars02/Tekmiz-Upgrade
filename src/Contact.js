import React, { useEffect, useState } from 'react'
import './Contact.css'
import contactImg from './images/contact-img.svg'
import { Link,useNavigate } from 'react-router-dom'
import { FaPhone,FaEnvelope,FaMapMarkerAlt} from "react-icons/fa";
import UserHeader from './Header/UserHeader';

const Contact = () => {
    useEffect(()=>{
        document.title='Tekmiz-Contact';
    });
    const navigate = useNavigate();
    const [message , setMessage] = useState({
        name:"",
        email:"",
        mobile:"",
        msg:""
    });
    
    let name,value;
    const postUserData = (event)=>{
        name = event.target.name;
        value= event.target.value;

        setMessage({ ...message, [name]: value });
    }
    const submitData = (event)=>{
        event.preventDefault();

        const {name,email,mobile,msg}=message;

        if (name && email && mobile && msg) {
            const res = 
            fetch(
                "https://tekmiz-5e01f-default-rtdb.firebaseio.com/contactMessage.json",
                {
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body:JSON.stringify({
                        name,
                        email,
                        mobile,
                        msg
                    })
                }
            );
            if (res) {
                setMessage({
                    name:"",
                    email:"",
                    mobile:"",
                    msg:""
                });
                alert('Message Sent !!');
                navigate('/');
            }
            else{
                alert('Message Re-Enter Please !!');
            }
        } else {
            alert('Message Re-Enter Please');
        }

    }
  return (
    <>
      <UserHeader/>
      <section className="contact">
        <div className="row">
            <div className="image">
                <img src={contactImg} alt="ContactImg" />
            </div>

            <form method='POST'>
                <h3>Get In Touch</h3>
                <input type="text" placeholder="Enter Your Name " required maxLength={100} name="name" className="box" onChange={postUserData}/>
                <input type="email" placeholder="Enter Your Email " required maxLength={100} name="email" className="box"  onChange={postUserData}/>
                <input type="number" placeholder="Enter Your Number " required maxLength={100} name="mobile" className="box" onChange={postUserData} />
                <textarea name="msg" className="box" placeholder="Enter Your Message" required  cols="30" rows="10" onChange={postUserData}></textarea>
                <input type="submit" value="Send-Message" className="inline-btn" name="submit"  onClick={submitData}/>
            </form>
        </div>


        <div className="box-container">
            <div className="box">
                <i><FaPhone/></i>
                <h3>Phone Number</h3>
                <Link to="tel:1234567890">123-456-7890</Link>
                <Link to="tel:1112223333">111-222-3333</Link>
            </div>

            <div className="box">
                <i><FaEnvelope/></i>
                <h3>Email Address</h3>
                <Link to="mailto:wstatus925@gmail.com">wstatus925@gmail.com</Link>
                <Link to="mailto:wstatus925@gmail.com">wstatus925@gmail.com</Link>
            </div>


            <div className="box">
                <i><FaMapMarkerAlt/></i>
                <h3>Address</h3>
                <Link to="#">College Road, Nashik , Maharashtra 422005</Link>
            </div>
        </div>
      </section>
    </>
  )
}

export default Contact