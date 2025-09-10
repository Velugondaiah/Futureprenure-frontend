import { Link } from "react-router-dom"
import Header from "../Header/Header"
import { FaBrain } from "react-icons/fa";
import { FaUserMd } from "react-icons/fa";
import { GrHistory } from "react-icons/gr";
import { BsGraphUp } from "react-icons/bs";
import { MdOutlineSecurity } from "react-icons/md";
import { MdDateRange } from "react-icons/md";
import { MdHealthAndSafety } from "react-icons/md";
import { useEffect, useState } from "react";
import "./Home.css"

const Home = () => {
    const [text, setText] = useState("");
    const message = "Welcome to Diagno AI";

    useEffect(() => {
        const timeout = setTimeout(() => {
            setText(message.slice(0, text.length + 1));
        }, 150);

        if (text === message) {
            clearTimeout(timeout);
            return;
        }

        return () => clearTimeout(timeout);
    }, [text]);

    return(
        <>
          <Header/>
       
        <div className="home-page">
          
            
            <div className="second-container">
                <div className="content-wrapper">
                    <div className="desc-container">
                        <h1 className="home-con-heading">
                            {text}
                        </h1>
                        <p className="home-con-description">
                            Revolutionizing healthcare with AI-powered diagnostic accuracy. 
                            Connect with top specialists and get personalized healthcare insights.
                        </p>
                        <Link to="/reports">
                            <button type="button" className="explore-button">
                                Explore Now
                            </button>
                        </Link>
                    </div>
                    <div className="image-container">
                        <img 
                            className="second-container-image" 
                            src="https://res.cloudinary.com/dbroxheos/image/upload/v1727800728/Half_design_794_x_1012_px_flwz3e.png" 
                            alt="Diagno AI Illustration"
                        />
                    </div>
                </div>
            </div>

            <div className="key-features-container">
                <div className="features-header">
                    <h1 className="features-heading">Key Features of Diagno AI</h1>
                    <p className="feature-description">
                        Discover the cutting-edge features that set our AI-powered healthcare platform apart.
                    </p>
                </div>
                
                <div className="main-icons-container">
                    <div className="icons-containers">
                        <div className="icon-wrapper">
                            <FaBrain className="features-icons" />
                        </div>
                        <h1 className="icons-heading">AI Powered Analysis</h1>
                        <p className="icons-paragraph">
                            Get accurate and prompt diagnostic results with our advanced AI technology.
                        </p>
                    </div>

                    <div className="icons-containers">
                        <div className="icon-wrapper">
                            <FaUserMd className="features-icons" />
                        </div>
                        <h1 className="icons-heading">Top Specialists</h1>
                        <p className="icons-paragraph">
                            Connect with leading healthcare specialists for expert opinions and consultations.
                        </p>
                    </div>

                    <div className="icons-containers">
                        <div className="icon-wrapper">
                            <MdDateRange className="features-icons" />
                        </div>
                        <h1 className="icons-heading">Easy Appointment Booking</h1>
                        <p className="icons-paragraph">
                            Schedule appointments with ease and manage your healthcare journey efficiently.
                        </p>
                    </div>

                    <div className="icons-containers">
                        <div className="icon-wrapper">
                            <GrHistory className="features-icons" />
                        </div>
                        <h1 className="icons-heading">Medical History Tracking</h1>
                        <p className="icons-paragraph">
                            Keep track of your past medical records and ensure continuity of care.
                        </p>
                    </div>

                    <div className="icons-containers">
                        <div className="icon-wrapper">
                            <BsGraphUp className="features-icons" />
                        </div>
                        <h1 className="icons-heading">Real Time Health Monitoring</h1>
                        <p className="icons-paragraph">
                           Live analysis of the patient's condition.
                        </p>
                    </div>

                    <div className="icons-containers">
                        <div className="icon-wrapper">
                            <MdHealthAndSafety className="features-icons" />
                        </div>
                        <h1 className="icons-heading">AI based Health Care recommendation</h1>
                        <p className="icons-paragraph">
                           Personalized health care recommendation based on the data.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

export default Home