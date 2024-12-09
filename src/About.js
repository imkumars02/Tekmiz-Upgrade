import React, { useEffect } from 'react'
import './About.css'
import { Link } from 'react-router-dom'
import About_img from './images/about-img.svg'
import {FaGraduationCap,FaChalkboard, FaUserGraduate,FaBriefcase} from "react-icons/fa";
import UserHeader from './Header/UserHeader';

const About = () => {
    useEffect(()=>{
        document.title='Tekmiz - About';
    });
  return (
    <>
        <UserHeader/>
        <section className="about">
        <div className="row">
            <div className="image">
                <img src={About_img} alt="" />
            </div>
            <div className="content">
                <h3>Why Choose Us ?</h3>
                <p>Tekmiz empowers both tutors and users in a seamless e-learning journey. Tutors curate content-rich playlists, each thoughtfully crafted, while users explore diverse courses and save beloved playlists. Engage with content by liking, commenting, and accessing valuable insights into content performance.</p>
                <Link to="/ViewCourses" className="inline-btn">Our Courses</Link>
            </div>
        </div>

        <div className="box-container">
            <div className="box">
                <i><FaGraduationCap /></i>
                <div>
                    <h3>+1k</h3>
                    <span>Online Courses</span>
                </div>
            </div>

            <div className="box">
                <i><FaUserGraduate/></i>
                <div>
                    <h3>+25k</h3>
                    <span>Brilliant Students</span>
                </div>
            </div>

            <div className="box">
                <i><FaChalkboard/></i>
                <div>
                    <h3>+5k</h3>
                    <span>Expert Teachers</span>
                </div>
            </div>

            <div className="box">
                <i><FaBriefcase/></i>
                <div>
                    <h3>100%</h3>
                    <span>Jobs Placements</span>
                </div>
            </div>
        </div>
        </section>
    </>
  )
}

export default About