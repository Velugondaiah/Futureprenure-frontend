import { Link, withRouter } from "react-router-dom";
import { Component } from "react";
import Cookies from "js-cookie";
import { AiFillHome } from "react-icons/ai";
import { IoReorderThreeSharp } from 'react-icons/io5';
import { MdMedicalServices } from "react-icons/md";
import { FaUserCircle, FaHeartbeat, FaThermometerHalf, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { GiLungs } from "react-icons/gi";
import "./Header.css";
import { Sidebar, SidebarItem } from "./StyledComponent";

const API_URL = process.env.REACT_APP_API_URL;

class Header extends Component {
  state = { isSidebarOpen: false, healthMetrics: { heart_rate: '--', spo2: '--', temperature: '--' }, showHealthDropdown: false };

  logoutBtn = () => {
    Cookies.remove("jwt_token");
    const { history } = this.props;
    history.replace("/login");
  };

  toggleSidebar = () => {
    this.setState(prevState => ({
      isSidebarOpen: !prevState.isSidebarOpen,
    }));
  };

  handleClickOutSide = event => {
    const { isSidebarOpen } = this.state;
    const sidebarElement = event.target.closest('.Sidebar');
    const menuButton = event.target.closest('.menu-button');

    if (isSidebarOpen && !sidebarElement && !menuButton) {
      this.setState({ isSidebarOpen: false });
    }
  };

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutSide);
    this.fetchHealthMetrics();
    this.healthMetricsInterval = setInterval(this.fetchHealthMetrics, 5000);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutSide);
    if (this.healthMetricsInterval) {
      clearInterval(this.healthMetricsInterval);
    }
  }

  handleProfileClick = () => {
    const { history } = this.props;
    const userId = Cookies.get('user_id');
    console.log('Clicking profile with userId:', userId);
    history.push(`/profile`);
    this.setState({ isSidebarOpen: false });
  };

  handleBookingHistoryClick = () => {
    const { history } = this.props;
    history.push('/booking-history');
    this.setState({ isSidebarOpen: false });
  };

  toggleHealthDropdown = () => {
    this.setState(prevState => ({
      showHealthDropdown: !prevState.showHealthDropdown,
    }));
  };

  fetchHealthMetrics = async () => {
    try {
      const userId = Cookies.get('id');
      const jwtToken = Cookies.get('jwt_token');
      
      if (!userId) {
        console.error('User ID not found in cookies');
        return;
      }

      const response = await fetch(`${API_URL}/api/health-metrics/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received health metrics:', data);

      this.setState({
        healthMetrics: {
          heart_rate: data.heart_rate || '--',
          spo2: data.spo2 || '--',
          temperature: data.temperature || '--'
        }
      });

    } catch (error) {
      console.error('Error fetching health metrics:', error);
      this.setState({
        healthMetrics: {
          heart_rate: '--',
          spo2: '--',
          temperature: '--'
        }
      });
    }
  };

  render() {
    const { isSidebarOpen, healthMetrics, showHealthDropdown } = this.state;
    const { history } = this.props;

    return (
      <>
        {/* Small devices navigation */}
        <nav className="small-devices-nav-container">
          <img 
            alt="logo" 
            className="logo" 
            src="https://res.cloudinary.com/dbroxheos/image/upload/v1727450617/gdyevtkkyx2gplt3c0kv.png" 
          />
          <div className="health-metrics-container">
            <div className="health-icon" onClick={this.toggleHealthDropdown}>
              <div className="health-icon-content">
                <FaHeartbeat className="icons" />
                {showHealthDropdown ? (
                  <FaChevronUp className="arrow-icon" />
                ) : (
                  <FaChevronDown className="arrow-icon" />
                )}
              </div>
            </div>
            {showHealthDropdown && (
              <div className="health-dropdown">
                <div className="metric-item">
                  <FaHeartbeat className="metric-icon" />
                  <div className="metric-details">
                    <span className="metric-label">Heart Rate</span>
                    <span className="metric-value">{healthMetrics.heart_rate} BPM</span>
                  </div>
                </div>
                <div className="metric-item">
                  <GiLungs className="metric-icon" />
                  <div className="metric-details">
                    <span className="metric-label">SpO2</span>
                    <span className="metric-value">{healthMetrics.spo2}%</span>
                  </div>
                </div>
                <div className="metric-item">
                  <FaThermometerHalf className="metric-icon" />
                  <div className="metric-details">
                    <span className="metric-label">Temperature</span>
                    <span className="metric-value">{healthMetrics.temperature}°F</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="icons-container">
            <Link to="/" className="link">
              <AiFillHome className="icons" />
            </Link>
            <Link to="/about-us" className="link">
              <FaUserCircle className="icons" />
            </Link>
            <Link to="/services" className="link">
              <MdMedicalServices className="icons" />
            </Link>
          </div>
          <div>
            <IoReorderThreeSharp 
              size="39px" 
              onClick={this.toggleSidebar} 
              className="menu-button"
            />
            <Sidebar isOpen={isSidebarOpen} className="Sidebar">
              <SidebarItem onClick={this.handleProfileClick}>
                Profile
              </SidebarItem>
              <SidebarItem onClick={this.handleBookingHistoryClick}>
                Booking History
              </SidebarItem>
              <button 
                type="button" 
                className="logout" 
                onClick={this.logoutBtn}
              >
                Logout
              </button>
            </Sidebar>
          </div>
        </nav>

        {/* Large devices navigation */}
        <nav className="large-devices-container">
          <div className="logo-health-container">
            <Link to="/">
              <img alt="logo" className="logo" src="https://res.cloudinary.com/dbroxheos/image/upload/v1727450617/gdyevtkkyx2gplt3c0kv.png" />
            </Link>
            <div className="health-metrics-large">
              <div className="health-metrics-dropdown" onClick={this.toggleHealthDropdown}>
                <div className="health-metrics-header">
                  <FaHeartbeat className="icons" />
                  <span>Health Metrics</span>
                  {showHealthDropdown ? (
                    <FaChevronUp className="arrow-icon" />
                  ) : (
                    <FaChevronDown className="arrow-icon" />
                  )}
                </div>
                {showHealthDropdown && (
                  <div className="health-dropdown large">
                    <div className="metric-item">
                      <FaHeartbeat className="metric-icon" />
                      <div className="metric-details">
                        <span className="metric-label">Heart Rate</span>
                        <span className="metric-value">{healthMetrics.heart_rate} BPM</span>
                      </div>
                    </div>
                    <div className="metric-item">
                      <GiLungs className="metric-icon" />
                      <div className="metric-details">
                        <span className="metric-label">SpO2</span>
                        <span className="metric-value">{healthMetrics.spo2}%</span>
                      </div>
                    </div>
                    <div className="metric-item">
                      <FaThermometerHalf className="metric-icon" />
                      <div className="metric-details">
                        <span className="metric-label">Temperature</span>
                        <span className="metric-value">{healthMetrics.temperature}°C</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="nav-links-container">
            <ul className="unorder-lists">
              <Link to="/" className="link">
                <li>Home</li>
              </Link>
              <Link to="/about-us" className="link">
                <li>About&nbsp;Us</li>
              </Link>
              <Link to="/services" className="link">
                <li>Services</li>
              </Link>
              <Link to="/profile" className="link">
                <li>Profile</li>
              </Link>
              <Link to="/booking-history" className="link">
                <li>Booking History</li>
              </Link>
            </ul>
          </div>

          <div className="right-section">
            <button type="button" className="logout-button" onClick={this.logoutBtn}>
              Logout
            </button>
          </div>
        </nav>
      </>
    );
  }
}

export default withRouter(Header);
