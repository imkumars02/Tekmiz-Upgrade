import {BrowserRouter, Routes,Route} from 'react-router-dom'
import Home from './Home';
import Footer from './Footer'
import About from './About';
import Contact from './Contact';
import Teacher from './Teacher';
import ViewCourses from './ViewCourses';
import UserLogin from './UserLogin';
import UserRegister from './UserRegister';
import AdminLogin from './Admin/AdminLogin';
import AdminRegister from './Admin/AdminRegister';
import Dashboard from './Admin/Dashboard';
import UserProfile from './User/UserProfile';
import UpdateProfile from './User/UpdateProfile';
import AddPlaylist from './Admin/AddPlaylist';
import TeacherProfile from './User/TeacherProfile';
import ViewPlaylist from './User/ViewPlaylist';
import Bookmark from './User/Bookmark';
import PlaylistViewer from './Admin/PlaylistViewer';
import ViewerList from './Admin/ViewerList';
import AdminPlaylist from './Admin/AdminPlaylist';
import AdminContent from './Admin/AdminContent';
import AddContent from './Admin/AddContent';
import UpdateContent from './Admin/UpdateContent';
import UpdatePlaylist from './Admin/UpdatePlaylist';
import ViewProfile from './Admin/ViewProfile';
import ViewContent from './Admin/ViewContent';
import AdminViewPlaylist from './Admin/AdminViewPlaylist';
import Comment from './Admin/Comment';
import UpdateAdminProfile from './Admin/UpdateAdminProfile';
import ContentViewer from './Admin/ContentViewer';
import ContentViewerList from './Admin/ContentViewerList';
import WatchVideo from './User/WatchVideo';
import Likes from './User/Likes';
import UserComment from './User/UserComment';
import SearchCourse from './User/SearchCourse';
import SearchPage from './Admin/SearchPage';
import SearchTutor from './User/SearchTutor';
import Translator from './Translator';
import LearnMate from './Advanced/LearnMate';
import Meeting from './Advanced/Meeting';
import Assignments from './Advanced/Assignments';
import TekmizCompiler from './Advanced/TekmizCompiler';
import DashboardPerfomance from './Admin/DashboardPerfomance';
import AdminAssignment from './AdminAdvanced/AdminAssignment';
import AddAssignment from './AdminAdvanced/AddAssignment';
import ViewAssignment from './AdminAdvanced/ViewAssignment';
import UpdateAssignment from './AdminAdvanced/UpdateAssignment';
import AssignmentView from './Advanced/AssignmentView';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' Component={Home}></Route>
        <Route path='/About' Component={About}></Route>
        <Route path='/Contact' Component={Contact}></Route>
        <Route path='/Teacher' Component={Teacher}></Route>
        <Route path='/ViewCourses' Component={ViewCourses}></Route>
        <Route path='/UserLogin' Component={UserLogin}></Route>
        <Route path='/UserRegister' Component={UserRegister}></Route>
        <Route path='/Translator' Component={Translator}></Route>
        <Route path='/Admin/AdminLogin' Component={AdminLogin}></Route>
        <Route path='/Admin/AdminRegister' Component={AdminRegister}></Route>
        <Route path='/Admin/Dashboard' Component={Dashboard}></Route>
        <Route path='/Admin/DashboardPerfomance' Component={DashboardPerfomance}></Route>
        <Route path='/AdminAdvanced/AdminAssignment' Component={AdminAssignment}></Route>
        <Route path='/AdminAdvanced/AddAssignment' Component={AddAssignment}></Route>
        <Route path='/AdminAdvanced/ViewAssignment/:playlistId' Component={ViewAssignment}></Route>
        <Route path='/AdminAdvanced/UpdateAssignment/:playlistId' Component={UpdateAssignment}></Route>
        <Route path='/Admin/AddPlaylist' Component={AddPlaylist}></Route>
        <Route path='/Admin/PlaylistViewer' Component={PlaylistViewer}></Route>
        <Route path='/Admin/ViewerList/:playlistId' Component={ViewerList}></Route>
        <Route path='/Admin/AdminPlaylist' Component={AdminPlaylist}></Route>
        <Route path='/Admin/AdminContent' Component={AdminContent}></Route>
        <Route path='/Admin/AddContent' Component={AddContent}></Route>
        <Route path='/Admin/UpdateContent/:contentId' Component={UpdateContent}></Route>
        <Route path='/Admin/UpdatePlaylist/:playlistId' Component={UpdatePlaylist}></Route>
        <Route path='/Admin/ViewProfile' Component={ViewProfile}></Route>
        <Route path='/Admin/ViewContent/:contentId' Component={ViewContent}></Route>
        <Route path='/Admin/AdminViewPlaylist/:playlistId' Component={AdminViewPlaylist}></Route>
        <Route path='/Admin/Comment' Component={Comment}></Route>
        <Route path='/Admin/UpdateAdminProfile' Component={UpdateAdminProfile}></Route>
        <Route path='/Admin/ContentViewer' Component={ContentViewer}></Route>
        <Route path='/Admin/ContentViewerList/:contentId' Component={ContentViewerList}></Route>
        <Route path='/Admin/SearchPage' Component={SearchPage}></Route>
        <Route path='/User/UserProfile' Component={UserProfile}></Route>
        <Route path='/User/UpdateProfile' Component={UpdateProfile}></Route>
        <Route path='/User/TeacherProfile/:userId' Component={TeacherProfile}></Route>
        <Route path='/User/ViewPlaylist/:playlistId' Component={ViewPlaylist}></Route>
        <Route path='/User/Bookmark/:userId' Component={Bookmark}></Route>
        <Route path='/User/WatchVideo/:contentId' Component={WatchVideo}></Route>
        <Route path='/User/Likes' Component={Likes}></Route>
        <Route path='/User/UserComment' Component={UserComment}></Route>
        <Route path='/User/SearchCourse' Component={SearchCourse}></Route>
        <Route path='/User/SearchTutor' Component={SearchTutor}></Route>
        <Route path='/Advanced/LearnMate' Component={LearnMate}></Route>
        <Route path='/Advanced/Meeting' Component={Meeting}></Route>
        <Route path='/Advanced/Assignments' Component={Assignments}></Route>
        <Route path='/Advanced/AssignmentView/:playlistId' Component={AssignmentView}></Route>
        <Route path='/Advanced/TekmizCompiler' Component={TekmizCompiler}></Route>
      </Routes>
      <Footer/>
    </BrowserRouter>
  );
}

export default App;
