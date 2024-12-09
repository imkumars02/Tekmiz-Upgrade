import React, { useEffect } from 'react'
import UserHeader from './Header/UserHeader'
import QuickComponent from './HomeComponent/QuickComponent'
import Courses from './HomeComponent/Courses'

const Home = () => {
  useEffect(()=>{
    document.title='Tekmiz';
  });
  return (
    <>
        <UserHeader/>
        <QuickComponent/>
        <Courses/>
    </>
  )
}

export default Home