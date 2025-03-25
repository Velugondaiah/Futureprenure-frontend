import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import UserLogin from './components/UserLogin/UserLogin';
import UserSignUp from './components/UserSignUp/UserSignUp';
import Home from './components/Home/Home';
import AboutUs from './components/Aboutus/Aboutus';
import Services from './components/services/services';
import Analyse from './components/AnalyseReports/Analyse';
import XrayReports from './components/XrayReports';
import BookingHistory from './components/BookingHistory';
import Appointments from './components/Appointments';
import Cookies from 'js-cookie';
import Profile from './components/Profile';
import VideoConsultation from './components/VideoConsultation';
import VideoRoom from './components/VideoRoom';
import DiagnosisAppointments from './components/DiagnosisAppointments/index';
import { NavigationProvider } from './contexts/NavigationContext';

import './App.css';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const token = Cookies.get('jwt_token');
  return (
    <Route
      {...rest}
      render={props =>
        token ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

const App = () => {
  return (
    <NavigationProvider>
      <div className="App">
        <Router>
          <Switch>
            <Route exact path="/login">
              {Cookies.get('jwt_token') ? <Redirect to="/home" /> : <UserLogin />}
            </Route>
            <Route exact path="/signup" component={UserSignUp} />
            <PrivateRoute exact path="/" component={Home} />
            <PrivateRoute exact path="/profile" component={Profile} />
            <PrivateRoute exact path="/about-us" component={AboutUs} />
            <PrivateRoute exact path="/services" component={Services} />
            <Route exact path="/appointments" component={Appointments} />
            <Route exact path="/x-ray-reports" component={XrayReports} />
            <Route exact path="/booking-history" component={BookingHistory} />
            <PrivateRoute exact path="/analyse-report" component={Analyse} />
            <Route 
              exact 
              path="/video-consultation/:meeting_id" 
              render={(props) => {
                console.log('Meeting ID from URL:', props.match.params.meeting_id);
                return <VideoConsultation {...props} />;
              }}
            />
            <Route exact path="/">
              {Cookies.get('jwt_token') ? <Redirect to="/" /> : <Redirect to="/login" />}
            </Route>
            <Route exact path="/doctor/video-room/:meeting_id" component={VideoRoom} />
            <Route exact path="/video-consultation/:meeting_id" component={VideoRoom} />
            <PrivateRoute exact path="/diagnosis-appointments" component={DiagnosisAppointments} />
          </Switch>
        </Router>
      </div>
    </NavigationProvider>
  );
};

export default App;
//