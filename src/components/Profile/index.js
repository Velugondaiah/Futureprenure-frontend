import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';
import Header from "../Header/Header";
import { 
    FaUser, 
    FaEnvelope, 
    FaPhone, 
    FaCalendar, 
    FaVenusMars, 
    FaClock, 
    FaCog,
    FaEdit,
    FaFileMedical,
    FaNotesMedical,
    FaHeartbeat,
    FaPrescription,
    FaHistory,
    FaBell
} from 'react-icons/fa';
import './index.css';

const Profile = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const history = useHistory();

    useEffect(() => {
        try {
            const storedDetails = localStorage.getItem('userDetails');
            console.log('Raw stored details:', storedDetails); // Debug log

            if (storedDetails) {
                const parsedDetails = JSON.parse(storedDetails);
                console.log('Parsed user details:', parsedDetails); // Debug log
                
                // Format the date if it exists
                if (parsedDetails.dateofbirth) {
                    try {
                        const date = new Date(parsedDetails.dateofbirth);
                        parsedDetails.dateofbirth = date.toISOString().split('T')[0];
                    } catch (e) {
                        console.error('Date formatting error:', e);
                    }
                }
                
                setUserDetails(parsedDetails);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error loading user details:', error);
        }
    }, []);
    console.log(userDetails)
    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error">
                    <h3>Error loading profile</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!userDetails) {
        return <div>Loading...</div>;
    }

    // Debug log to check phone number field
    console.log('Phone number value:', {
        phonenumber: userDetails.phonenumber,
        phoneNumber: userDetails.phoneNumber
    });

    return (
        <>
            <Header />
            <div className="medical-dashboard">
                <div className="dashboard-sidebar">
                    <div className="patient-info">
                        <div className="patient-avatar">
                            <div className="avatar-image">
                                {userDetails?.firstname?.charAt(0)}{userDetails?.lastname?.charAt(0)}
                            </div>
                            <div className="online-status"></div>
                        </div>
                        <h3>{userDetails?.firstname} {userDetails?.lastname}</h3>
                        <span className="patient-id">Patient ID: {userDetails?.id}</span>
                        <div className="quick-stats">
                            <div className="stat">
                                <span className="stat-number">12</span>
                                <span className="stat-label">Visits</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">4</span>
                                <span className="stat-label">Reports</span>
                            </div>
                        </div>
                    </div>

                    <nav className="dashboard-nav">
                        <a href="#profile" className="nav-item active">
                            <FaUser /> Personal Info
                        </a>
                        <a href="#medical" className="nav-item">
                            <FaFileMedical /> Medical Records
                        </a>
                        <a href="#appointments" className="nav-item">
                            <FaCalendar /> Appointments
                        </a>
                        <a href="#prescriptions" className="nav-item">
                            <FaPrescription /> Prescriptions
                        </a>
                        <a href="#history" className="nav-item">
                            <FaHistory /> Medical History
                        </a>
                        <a href="#notifications" className="nav-item">
                            <FaBell /> Notifications
                        </a>
                    </nav>
                </div>

                <div className="dashboard-main">
                    <div className="page-header">
                        <div className="header-content">
                            <h1>Personal Information</h1>
                            <p>Manage your personal and medical information</p>
                        </div>
                        <button className="edit-btn">
                            <FaEdit /> Edit Profile
                        </button>
                    </div>

                    <div className="info-grid">
                        <div className="info-section personal-details">
                            <h3><FaUser /> Basic Information</h3>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <label>Full Name</label>
                                    <p>{userDetails?.firstname} {userDetails?.lastname}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Date of Birth</label>
                                    <p>{userDetails?.dateofbirth || 'Not provided'}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Gender</label>
                                    <p>{userDetails?.gender}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Blood Group</label>
                                    <p>{userDetails?.bloodGroup || 'Not specified'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="info-section contact-details">
                            <h3><FaEnvelope /> Contact Information</h3>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <label>Email</label>
                                    <p>{userDetails?.email}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Phone</label>
                                    <p>{userDetails?.phonenumber || 'Not provided'}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Emergency Contact</label>
                                    <p>{userDetails?.emergencyContact || 'Not specified'}</p>
                                </div>
                                <div className="detail-item">
                                    <label>Address</label>
                                    <p>{userDetails?.address || 'Not specified'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="info-section medical-overview">
                            <h3><FaHeartbeat /> Medical Overview</h3>
                            <div className="medical-stats">
                                <div className="medical-stat-card">
                                    <FaNotesMedical className="stat-icon" />
                                    <div className="stat-info">
                                        <span className="stat-value">4</span>
                                        <span className="stat-label">Active Prescriptions</span>
                                    </div>
                                </div>
                                <div className="medical-stat-card">
                                    <FaCalendar className="stat-icon" />
                                    <div className="stat-info">
                                        <span className="stat-value">2</span>
                                        <span className="stat-label">Upcoming Appointments</span>
                                    </div>
                                </div>
                                <div className="medical-stat-card">
                                    <FaFileMedical className="stat-icon" />
                                    <div className="stat-info">
                                        <span className="stat-value">8</span>
                                        <span className="stat-label">Recent Reports</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
