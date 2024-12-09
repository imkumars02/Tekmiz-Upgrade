import React from 'react'
import './Footer.css'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <>
    <footer className='footer'>
      <p>&copy;CopyRight @{new Date().getFullYear()} By<span><Link to={'/'}>Tekmiz - A Modern Learning Platform</Link> | All Right Reserved</span></p>
    </footer>
    </>
  )
}

export default Footer