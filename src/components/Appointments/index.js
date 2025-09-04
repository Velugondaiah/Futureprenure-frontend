import {Component} from 'react'
import {v4 as uuidv4} from 'uuid'
import DoctorsList from '../DoctorsList'
import axios from 'axios'
import AppointmentItem from '../AppointmentItem'
import './index.css'
import { withRouter } from 'react-router-dom';
import Cookies from 'js-cookie';
const API_URL = process.env.REACT_APP_API_URL;
const generateTimeSlots = () => {
    const slots = [];
    const startTime = 10; // 10 AM
    const endTime = 20;   // 8 PM
    
    for (let hour = startTime; hour < endTime; hour++) {
        // Skip 13:00-14:00 (lunch break)
        if (hour === 13) continue;
        
        // Convert to 12-hour format
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour;
        
        // Add :00 slot
        const time1 = `${displayHour.toString().padStart(2, '0')}:00 ${period}`;
        slots.push({
            value: `${hour.toString().padStart(2, '0')}:00`,
            label: time1
        });
        
        // Add :30 slot
        const time2 = `${displayHour.toString().padStart(2, '0')}:30 ${period}`;
        slots.push({
            value: `${hour.toString().padStart(2, '0')}:30`,
            label: time2
        });
    }
    
    return slots;
};

class Appointments extends Component {
  state = {

    appointmentsList: [],
    user_id:'',
    patientName: '',
    gender:'',
    age : '',
    date: '',
    phoneNumber:'',
    address:'',
    filterBtn: false,
    isStared: false,
    duplicateList: [],
    specialist: "General Medicine",
    locations: [],
    selectedLocation: '', 
    isFormValid: false,
    doctorResults: [],
    noDoctorsFound: false,
    isLoading: false,
    error: null,
    time: '',
    mode: '',
    timeSlots: generateTimeSlots(),
  }

  componentDidMount() {
    // Get specialist from location state OR URL params
    const { location, history } = this.props;
    const params = new URLSearchParams(location.search);
    const specialistFromParams = params.get('specialist');
    
    let specialist = null;
    if (location.state && location.state.specialist) {
        specialist = location.state.specialist;
    } else if (specialistFromParams) {
        specialist = specialistFromParams;
    }

    if (specialist) {
        this.setState({ specialist });
    }

    // Get user ID from localStorage
    const userData = localStorage.getItem('userData');
    let userId = null;
    
    try {
        // Parse userData if it exists
        if (userData) {
            userId = JSON.parse(userData);
            console.log('Found user ID:', userId); // Debug log
        }
    } catch (error) {
        console.error('Error parsing user data:', error);
    }

    // Check for default details
    const userConfirmed = window.confirm(
        'Do you want to use default details? Click OK for default or Cancel to enter your own.'
    );

    if (userConfirmed) {
        const userDetails = localStorage.getItem('userDetails');
        
        if (userDetails) {
            const user = JSON.parse(userDetails);
            this.setState({
                patientName: user.firstname,
                phoneNumber: user.phoneNumber,
                gender: "Male",
                age: 24,
                user_id: userId // Set the user_id in state
            }, () => {
                console.log('Updated state with user details:', this.state); // Debug log
            });
        } else {
            alert('No default details found in localStorage.');
        }
    }

    // Fetch available locations
    this.fetchLocations();
}


  fetchLocations = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/doctor-locations`);
      console.log(response)
      console.log("response")
      this.setState({ locations: response.data });
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  handleLocationChange = (event) => {
    this.setState({ selectedLocation: event.target.value });
  };

  handleModeChange = (event) => {
    const selectedMode = event.target.value;
    console.log('Selected mode:', selectedMode); // Debug log
    this.setState({ mode: selectedMode });
  };

  onSubmitButton = async (event) => {
    event.preventDefault();
    
    // Get all required data including mode from state
    const { 
        patientName, 
        gender, 
        age, 
        date, 
        time, 
        phoneNumber, 
        address, 
        specialist, 
        selectedLocation, 
        mode // Include mode here
    } = this.state;

    try {
        const appointmentData = {
            doctor_id: 8,
            user_id: 1,
            patient_name: patientName,
            gender,
            age,
            date,
            time,
            phone_number: phoneNumber,
            address,
            specialist,
            location: selectedLocation,
            mode // Include mode in the request payload
        };


        console.log('Submitting appointment data:', appointmentData); // Debug log

        const response = await axios.post(
            `${API_URL}/api/appointments`,
            appointmentData
        );

        if (response.data) {
            // Handle success
            console.log('Appointment created successfully');
        }

    } catch (error) {
        console.error('Error creating appointment:', error);
        // Handle error
    }
  };

  titleFun = event => {
    this.setState({patientName: event.target.value})
  }

  gender = event => {
    this.setState({gender : event.target.value})
  }
  onClickage = event => {
    this.setState({age : event.target.value})
  }
  onClickphoneNumber =event =>{
    this.setState({phoneNumber : event.target.value})
  }
  onClickAddress = event => {
    this.setState({address : event.target.value})
  }
  dateFrom = event => {
    const selectedDate = event.target.value;
    const today = new Date().toISOString().split('T')[0];
    
    if (selectedDate < today) {
      alert('Please select a future date');
      return;
    }
    
    this.setState({ date: selectedDate });
  }

  handleTimeChange = event => {
    const selectedTime = event.target.value;
    const [hours] = selectedTime.split(':').map(Number);
    
    // Check if time is between 10 AM and 8 PM
    if (hours < 10 || hours >= 20) {
      alert('Please select a time between 10:00 AM and 8:00 PM');
      return;
    }
    
    this.setState({ time: selectedTime });
  }

  validateDateTime = () => {
    const { date, time } = this.state;
    if (!date || !time) return false;

    const selectedDateTime = new Date(`${date}T${time}`);
    const currentDateTime = new Date();
    
    return selectedDateTime > currentDateTime;
  }

  validateForm = () => {
    const { patientName, gender, age, date, time, phoneNumber, address, selectedLocation } = this.state;
    return patientName && gender && age && date && time && phoneNumber && address && selectedLocation && this.validateDateTime();
  };

  selectFavourite = id => {
    this.setState(prevState => ({
      appointmentsList: prevState.appointmentsList.map(each => {
        if (id === each.id) {
          return {...each, isFavourite: !each.isFavourite}
        }
        return each
      }),
    }))
  }

  filterButton = () => {
    const {appointmentsList, duplicateList} = this.state
    this.setState({duplicateList: [...appointmentsList]})
    const filterLists = appointmentsList.filter(eachObj => {
      if (eachObj.isFavourite === true) {
        return eachObj
      }
    })
    this.setState({appointmentsList: filterLists, isStared: true})
  }

  filterDelteteButton = () => {
    const {duplicateList, isStared, appointmentsList} = this.state
    this.setState({appointmentsList: [...duplicateList], isStared: false})
  }
  filterCheck = () => {
    const {isStared} = this.state
    if (isStared) {
      this.filterDelteteButton()
    } else {
      this.filterButton()
    }
  }

  onSuccess = (data) => {
    const updateData = data.map(valu => ({
        appointmentCost : valu.appointment_cost,
        id : valu.id,
        imageUrl : valu.image_url,
        location : valu.location,
        locationUrl : valu.location_url,
        name : valu.name ,
        phoneNumber : valu.phone_number,
        rating : valu.rating,
        specialization : valu.specialization

    }))
 
    this.setState({doctorResults: updateData})
}

  handleProceed = async () => {
    if (!this.validateForm()) {
        alert('Please fill in all fields before proceeding');
        return;
    }

    const { selectedLocation, specialist } = this.state;
    
    if (!selectedLocation || !specialist) {
        alert('Please select both location and specialist');
        return;
    }

    this.setState({ 
        isLoading: true, 
        error: null,
        doctorResults: [],
        noDoctorsFound: false 
    });
     
    try {
        console.log('Fetching doctors with params:', {
            location: selectedLocation,
            specialization: specialist
        });

        const response = await axios.get(`${API_URL}/api/doctor-locations/getDoctors`, {
            params: {
                location: selectedLocation,
                specialization: specialist
            }
        });

        // Access the data property from the Supabase response
        const doctors = response.data.data;

        if (Array.isArray(doctors)) {
            if (doctors.length === 0) {
                this.setState({ 
                    noDoctorsFound: true,
                    error: 'No doctors found for the selected criteria'
                });
            } else {
                // Map the response data to match your frontend structure
                const formattedData = doctors.map(doctor => ({
                    appointmentCost: doctor.appointment_cost,
                    id: doctor.id,
                    imageUrl: doctor.image_url,
                    location: doctor.location,
                    locationUrl: doctor.location_url,
                    name: doctor.name,
                    phoneNumber: doctor.phone_number,
                    rating: doctor.rating,
                    specialization: doctor.specialization,
                    experience: doctor.experience,
                    qualification: doctor.qualification
                }));
                
                this.setState({
                    doctorResults: formattedData,
                    noDoctorsFound: false,
                    error: null
                });
            }
        } else {
            throw new Error('Invalid response format from server');
        }
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        this.setState({
            error: 'Failed to fetch doctor details. Please try again.',
            noDoctorsFound: true,
            doctorResults: []
        });
    } finally {
        this.setState({ isLoading: false });
    }
};

  handleDoctorSelect = async (doctorId) => {
    try {
        const {
            patientName,
            gender,
            age,
            date,
            time,
            phoneNumber,
            address,
            specialist,
            selectedLocation,
            mode,
            user_id
        } = this.state;

        // Debug log
        console.log('Current user_id:', user_id);

        // Validate user_id
        if (!user_id) {
            throw new Error('User ID not found. Please login again.');
        }

        // First verify if user exists and get their email
        const userCheckResponse = await axios.get(`${API_URL}/api/users/${user_id}`);
        
        if (!userCheckResponse.data) {
            throw new Error('User not found. Please login again.');
        }

        const userEmail = userCheckResponse.data.email;
        if (!userEmail) {
            throw new Error('User email not found. Please update your profile.');
        }

        // Format the appointment data
        const appointmentData = {
            doctor_id: parseInt(doctorId),
            user_id: parseInt(user_id),
            patient_name: patientName,
            gender: gender || 'Not Specified',
            age: age ? parseInt(age) : null,
            date: date,
            time: time,
            phone_number: phoneNumber || null,
            address: address || null,
            specialist: specialist || null,
            location: selectedLocation || null,
            mode: mode || 'Offline',
            status: 'Upcoming',
            symptoms: null,
            prescription: null,
            diagnosis: null,
            notes: null,
            email: userEmail, // Include the email
            meeting_id: mode === 'Online' ? 
                `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : 
                null
        };

        console.log('Sending appointment data:', appointmentData);

        // Create appointment
        const response = await axios.post(
            `${API_URL}/api/appointments`,
            appointmentData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data && response.data.success) {
            alert('Appointment booked successfully!');
            this.props.history.push('/services');
        } else {
            throw new Error(response.data.error || 'Failed to book appointment');
        }

    } catch (error) {
        console.error('Booking error:', error);
        alert(error.message || 'Failed to book appointment. Please try again.');
    }
};

  renderDoctorResults = () => {
    const { isLoading, error, noDoctorsFound, doctorResults } = this.state;

    if (isLoading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (noDoctorsFound) {
        return <div className="no-doctors-message">No doctors found for the selected criteria.</div>;
    }
    console.log(doctorResults)
    return (
        
        <div className="doctor-cards">
            {doctorResults.map(doctor => (
                <div key={doctor.id} className="doctor-card">
                    <div className="doctor-header">
                        <img 
                            src={doctor.imageUrl} 
                            alt={doctor.name}
                            className="doctor-image"
                        />
                        <div className="doctor-main-info">
                            <h3>Dr. {doctor.name}</h3>
                            <div className="doctor-specialization">
                                <i className="fas fa-user-md"></i>
                                {doctor.specialization} Specialist
                            </div>
                            <div className="availability-badge">
                                <i className="fas fa-clock"></i>
                                Available Today
                            </div>
                        </div>
                    </div>

                    <div className="doctor-body">
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Location</span>
                                <span className="info-value">
                                    <i className="fas fa-map-marker-alt"></i> {doctor.location}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Experience</span>
                                <span className="info-value">
                                    <i className="fas fa-calendar-alt"></i> 8+ Years
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Rating</span>
                                <div className="doctor-rating">
                                    <i className="fas fa-star"></i>
                                    {doctor.rating}
                                </div>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Patients</span>
                                <span className="info-value">
                                    <i className="fas fa-users"></i> 1000+
                                </span>
                            </div>
                        </div>

                        <div className="appointment-cost">
                            <span className="cost-label">Consultation Fee</span>
                            <span className="cost-value">₹{doctor.appointmentCost}</span>
                        </div>

                        <button 
                            className="select-doctor-btn"
                            onClick={() => this.handleDoctorSelect(doctor.id)}
                        >
                            <i className="fas fa-calendar-check"></i>
                            Book Appointment
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    
    const {
        patientName,
        gender,
        age,
        date,
        time,
        phoneNumber,
        address,
        specialist,
        selectedLocation,
        mode,
        user_id
    } = this.state;

    // Debug log
    console.log('Sending appointment data:', {
        doctor_id: this.state.selectedDoctor,
        user_id,
        patient_name: patientName,
        gender,
        age,
        date,
        time,
        phone_number: phoneNumber,
        address,
        specialist,
        location: selectedLocation,
        mode
    });

    try {
        const response = await fetch(`${API_URL}/api/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                doctor_id: this.state.selectedDoctor,
                user_id,
                patient_name: patientName,
                gender,
                age,
                date,
                time,
                phone_number: phoneNumber,
                address,
                specialist,
                location: selectedLocation,
                mode
            })
        });

        const data = await response.json();
        console.log('Appointment response:', data); // Debug log

        if (response.ok) {
            alert('Appointment booked successfully!');
            // Handle success (e.g., redirect or clear form)
        } else {
            alert(data.error || 'Failed to book appointment');
        }
    } catch (error) {
        console.error('Appointment booking error:', error);
        alert('Failed to book appointment. Please try again.');
    }
};

  render() {
    const {appointmentsList, patientName,gender ,age , date,phoneNumber,address , filterBtn, isStared, specialist, locations, selectedLocation, doctorResults, noDoctorsFound, isLoading, error, time, mode, timeSlots} = this.state
    const stared = isStared ? 'if-selected' : 'selected-button'
    console.log(mode)
    console.log('Rendering with locations:', locations); // Debug log
    return (
      <div className="main-appointment-bg-container">
        <div className="appointment-card-container">
          <div className="form-and-image-container">
            <form className="form" onSubmit={this.onSubmitButton}>
              <h1 className="main-heading">Add Appointment</h1>
              {specialist && (
                <div className="specialist-section">
                  <h2 className="specialist-heading">
                    Appointment with {specialist}
                  </h2>
                </div>
              )}
              <div className="form-group">
                <label htmlFor="location" className="label">
                  Select Location
                </label>
                <select
                  id="location"
                  className="input"
                  value={selectedLocation}
                  onChange={this.handleLocationChange}
                  required
                >
                  <option value="">Select a location</option>
                  {locations && locations.length > 0 ? (
                    locations.map((loc, index) => (
                      <option key={index} value={loc.location}>
                        {loc.location}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Loading locations...</option>
                  )}
                </select>
              </div>
              <label htmlFor="tile" className="label">
                Patient Name
              </label>
              <input
                value={patientName}
                type="text"
                id="tile"
                className="input"
                placeholder="patient name"
                onChange={this.titleFun}
              />
              <br />
              <label htmlFor="gender" className="label">
                Gender
              </label>
              
                <select onChange={this.gender} className='input' id="gender" name="gender" required>
                <option value=""  selected>Select gender</option>
                <option  defaultChecked value="male" checked>Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                </select>


              <br />
              <label htmlFor="age" className="label">
                Age
              </label>
              <input
                value={age}
                type="age"
                id="age"
                className="input"
                placeholder="age"
                onChange={this.onClickage}
              />
              <br />
              <label className="label" htmlFor="date">
                DATE
              </label>
              <input
                value={date}
                type="date"
                className="input"
                onChange={this.dateFrom}
                id="date"
                min={new Date().toISOString().split('T')[0]}
              />
              <br />
              <label className="label" htmlFor="time">
                TIME (10:00 AM - 8:00 PM)
              </label>
              <select
                id="time"
                className="input"
                value={this.state.time}
                onChange={(e) => this.setState({ time: e.target.value })}
                required
              >
                <option value="">Select a time slot</option>
                {timeSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
              <br />
              <label htmlFor="phone" className="label">
                Phone Number
              </label>
              <input
                value={phoneNumber}
                type="number"
                id="phone"
                className="input"
                placeholder="phone number"
                onChange={this.onClickphoneNumber}
              />
              <br />
              <label htmlFor="address" className="label">
                Address
              </label>
              <input
                value={address}
                type="text"
                id="address"
                className="input"
                placeholder="address"
                onChange={this.onClickAddress}
              />
              <br />
              <div className="form-group">
                <label className="label">Mode of Appointment *</label>
                <div className="radio-container">
                    <input
                        onChange={this.handleModeChange}
                        type="radio"
                        name="appointmentMode"
                        id="Offline"
                        value="Offline"
                        checked={this.state.mode === 'Offline'}
                        required
                    />
                    <label htmlFor="Offline">Offline</label>
                    <input
                        onChange={this.handleModeChange}
                        type="radio"
                        name="appointmentMode"
                        id="Online"
                        value="Online"
                        checked={this.state.mode === 'Online'}
                        className="ml-2"
                        required
                    />
                    <label htmlFor="Online">Online</label>
                </div>
                {!this.state.mode && (
                    <span className="error-text">Please select appointment mode</span>
                )}
              </div>
              <div className="button-container">
                {/* <button className="add-button" type="submit">
                  Add
                </button> */}
                <button 
                  className="proceed-button" 
                  type="button"
                  onClick={this.handleProceed}
                  disabled={!this.validateForm()}
                  style={{ opacity: this.validateForm() ? 1 : 0.5 }}
                >
                  Proceed
                </button>
              </div>
            </form>
            <img
              src="https://assets.ccbp.in/frontend/react-js/appointments-app/appointments-img.png"
              className="appointment-image"
              alt="appointments"
            />
          </div>
          <hr className="horizontal-line" />
          
         
        </div>
        <div className="doctor-results-container">
          {this.renderDoctorResults()}
        </div>
      </div>
    )
  }
}
export default withRouter(Appointments);