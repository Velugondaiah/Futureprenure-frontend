import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Cookies from 'js-cookie';
import Header from '../Header/Header';
import './index.css';

const DiagnosisAppointments = () => {
    const [formData, setFormData] = useState({
        patient_name: '',
        gender: '',
        age: '',
        date: '',
        time: '',
        phone_number: '',
        address: '',
        location: '',
        selectedTests: []
    });
    const [availableTests, setAvailableTests] = useState([]);
    const [diagnosisCenters, setDiagnosisCenters] = useState([]);
    const [selectedCenter, setSelectedCenter] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const history = useHistory();

    useEffect(() => {
        fetchUserTests();
        fetchDiagnosisCenters();
    }, []);

    const fetchUserTests = async () => {
        try {
            const userId = JSON.parse(localStorage.getItem('userDetails')).id;
            const response = await fetch(`https://backend-diagno-1.onrender.com/api/user-diagnosis-tests/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('jwt_token')}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch tests');

            const data = await response.json();
            setAvailableTests(data);
        } catch (error) {
            console.error('Error fetching tests:', error);
            setError('Failed to load recommended tests');
        }
    };

    const fetchDiagnosisCenters = async () => {
        try {
            const response = await fetch('https://backend-diagno-1.onrender.com/api/diagnosis-centers', {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('jwt_token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch diagnosis centers');
            }

            const data = await response.json();
            console.log('Fetched diagnosis centers:', data);
            setDiagnosisCenters(data);
        } catch (error) {
            console.error('Error fetching diagnosis centers:', error);
            setError('Failed to load diagnosis centers');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userId = JSON.parse(localStorage.getItem('userDetails')).id;
            const response = await fetch('https://backend-diagno-1.onrender.com/api/diagnosis-appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('jwt_token')}`
                },
                body: JSON.stringify({
                    ...formData,
                    user_id: userId,
                    diagnosis_center_id: selectedCenter,
                    tests: formData.selectedTests
                })
            });

            if (!response.ok) throw new Error('Failed to book appointment');

            const data = await response.json();
            history.push('/booking-history');
        } catch (error) {
            console.error('Error booking appointment:', error);
            setError('Failed to book appointment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="diagnosis-appointments-container">
            <Header />
            <div className="appointment-form-container">
                <h2>Book Diagnostic Tests</h2>
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="appointment-form">
                    <div className="form-group">
                        <label>Select Diagnosis Center</label>
                        <select
                            value={selectedCenter}
                            onChange={(e) => setSelectedCenter(e.target.value)}
                            required
                            className="center-select"
                        >
                            <option value="">Select a Center</option>
                            {diagnosisCenters.map(center => (
                                <option key={center.id} value={center.id}>
                                    {center.name} - {center.location}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Patient Name</label>
                        <input
                            type="text"
                            value={formData.patient_name}
                            onChange={(e) => setFormData({...formData, patient_name: e.target.value})}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Gender</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                required
                                className="form-select"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Age</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData({...formData, age: e.target.value})}
                                required
                                min="1"
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Time</label>
                            <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                                required
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            value={formData.phone_number}
                            onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                            required
                            pattern="[0-9]{10}"
                            placeholder="10-digit phone number"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Address</label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            required
                            className="form-textarea"
                        />
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Recommended Tests</label>
                        <div className="tests-grid">
                            {availableTests.map(test => (
                                <label key={test} className="test-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.selectedTests.includes(test)}
                                        onChange={(e) => {
                                            const updatedTests = e.target.checked
                                                ? [...formData.selectedTests, test]
                                                : formData.selectedTests.filter(t => t !== test);
                                            setFormData({...formData, selectedTests: updatedTests});
                                        }}
                                    />
                                    <span>{test}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={loading || !selectedCenter || formData.selectedTests.length === 0}
                    >
                        {loading ? 'Booking...' : 'Book Appointment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DiagnosisAppointments; 