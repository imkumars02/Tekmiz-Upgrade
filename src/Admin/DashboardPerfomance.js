// import React, { useEffect, useState } from "react";
// import AdminHeader from "../Header/AdminHeader";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { getFirestore, collection, query, where, getDocs, orderBy } from "firebase/firestore";
// import { firebaseApp } from "../Firebase";
// import { Bar } from 'react-chartjs-2';
// import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
// import './DashboardPerfomance.scss';

// // Register Chart.js components
// ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// const DashboardPerfomance = () => {
//     const [user, setUser] = useState(null);
//     const [playlists, setPlaylists] = useState([]);
//     const [selectedPlaylist, setSelectedPlaylist] = useState("");
//     const [totalViews, setTotalViews] = useState(0);
//     const [chartData, setChartData] = useState({ labels: [], datasets: [] });
//     const [dateWiseData, setDateWiseData] = useState({ labels: [], datasets: [] });
//     const [isLoading, setIsLoading] = useState(true);

//     const db = getFirestore(firebaseApp);

//     useEffect(() => {
//         const auth = getAuth(firebaseApp);
//         const unsubscribe = onAuthStateChanged(auth, async (user) => {
//             if (user) {
//                 setUser(user);
//                 await fetchPlaylists(user.uid);
//             } else {
//                 setUser(null);
//                 setPlaylists([]);
//             }
//         });

//         return () => unsubscribe();
//     }, []);

//     useEffect(() => {
//         if (selectedPlaylist) {
//             fetchTotalViews(selectedPlaylist);
//             fetchDateWiseData(selectedPlaylist);
//         }
//     }, [selectedPlaylist]);

//     const fetchPlaylists = async (userId) => {
//         try {
//             const playlistsRef = collection(db, "playlists");
//             const q = query(playlistsRef, where("userId", "==", userId));
//             const querySnapshot = await getDocs(q);
//             const playlistList = querySnapshot.docs.map((doc) => ({
//                 id: doc.id,
//                 ...doc.data(),
//             }));
//             setPlaylists(playlistList);
//         } catch (error) {
//             console.error("Error fetching playlists: ", error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const fetchTotalViews = async (playlistId) => {
//         try {
//             const playlistViewRef = collection(db, "playlistView");
//             const q = query(playlistViewRef, where("playlistId", "==", playlistId));
//             const querySnapshot = await getDocs(q);

//             const total = querySnapshot.size;
//             setTotalViews(total);

//             setChartData({
//                 labels: ['Total Views'],
//                 datasets: [{
//                     label: 'Views',
//                     data: [total],
//                     backgroundColor: 'rgba(75, 192, 192, 0.5)',
//                     borderColor: 'rgba(75, 192, 192, 1)',
//                     borderWidth: 1.5,
//                     barPercentage: 0.5,
//                 }],
//             });
//         } catch (error) {
//             console.error("Error fetching total views: ", error);
//         }
//     };

//     const fetchDateWiseData = async (playlistId) => {
//         try {
//             const playlistViewRef = collection(db, "playlistView");
//             const q = query(playlistViewRef, where("playlistId", "==", playlistId), orderBy("date"));
//             const querySnapshot = await getDocs(q);

//             // Initialize map to aggregate views by date
//             const dateMap = new Map();

//             querySnapshot.docs.forEach((doc) => {
//                 const data = doc.data();
//                 const date = data.date.toDate().toDateString(); // Format date as string
//                 if (dateMap.has(date)) {
//                     dateMap.set(date, dateMap.get(date) + 1);
//                 } else {
//                     dateMap.set(date, 1);
//                 }
//             });

//             // Convert map to arrays for chart
//             const dateLabels = Array.from(dateMap.keys()).sort(); // Sort dates
//             const viewCounts = dateLabels.map(date => dateMap.get(date));

//             setDateWiseData({
//                 labels: dateLabels,
//                 datasets: [{
//                     label: 'Views by Date',
//                     data: viewCounts,
//                     backgroundColor: 'rgba(153, 102, 255, 0.5)',
//                     borderColor: 'rgba(153, 102, 255, 1)',
//                     borderWidth: 1.5,
//                     barPercentage: 0.5,
//                 }],
//             });
//         } catch (error) {
//             console.error("Error fetching date-wise data: ", error);
//         }
//     };

//     const handleSelectChange = (event) => {
//         const playlistId = event.target.value;
//         setSelectedPlaylist(playlistId);
//     };

//     const chartOptions = {
//         responsive: true,
//         maintainAspectRatio: false,
//         plugins: {
//             legend: {
//                 position: 'top',
//                 labels: {
//                     color: '#333',
//                     font: {
//                         size: 14,
//                     },
//                 },
//             },
//             tooltip: {
//                 backgroundColor: '#333',
//                 titleColor: '#fff',
//                 bodyColor: '#fff',
//                 borderColor: '#444',
//                 borderWidth: 1,
//             },
//         },
//         scales: {
//             x: {
//                 grid: {
//                     color: '#ddd',
//                 },
//                 ticks: {
//                     color: '#333',
//                 },
//             },
//             y: {
//                 grid: {
//                     color: '#ddd',
//                 },
//                 ticks: {
//                     color: '#333',
//                 },
//             },
//         },
//     };

//     return (
//         <>
//             <AdminHeader />
//             <div className="dashboardPerformance">
//                 <div className="content">
//                     <h1 className="title">Playlist Dashboard</h1>
//                     <div className="DashboardPlaylist">
//                         <label htmlFor="playlist">Select Playlist: </label>
//                         <select id="playlist" value={selectedPlaylist} onChange={handleSelectChange}>
//                             <option value="">Select Playlist</option>
//                             {playlists.map((playlist) => (
//                                 <option key={playlist.id} value={playlist.id}>
//                                     {playlist.title}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                     {selectedPlaylist && (
//                         <>
//                             <div className="total">
//                                 <h2>Total Views: {totalViews}</h2>
//                                 <div className="chart-container">
//                                     <Bar data={chartData} options={chartOptions} />
//                                 </div>
//                             </div>
//                             <div className="date-wise">
//                                 <h2>Views by Date</h2>
//                                 <div className="chart-container">
//                                     <Bar data={dateWiseData} options={chartOptions} />
//                                 </div>
//                             </div>
//                         </>
//                     )}
//                 </div>
//             </div>
//         </>
//     );
// };

// export default DashboardPerfomance;


import React from 'react'

const DashboardPerfomance = () => {
  return (
    <div>DashboardPerfomance</div>
  )
}

export default DashboardPerfomance