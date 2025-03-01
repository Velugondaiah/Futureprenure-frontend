import { useHistory } from 'react-router-dom';
import Header from "../Header/Header"
import { FaStethoscope, FaUserMd, FaHospital, FaHeartbeat } from 'react-icons/fa';
import { AiOutlineSafety, AiFillRobot } from 'react-icons/ai';
import { MdOutlinePrivacyTip, MdSpeed } from 'react-icons/md';
import { GiHealthNormal, GiArtificialIntelligence } from 'react-icons/gi';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import "./Aboutus.css"

const AboutUs = () => {
    const history = useHistory();
//
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    return(
        <>
        <Header/>
        <div className="about-container">
            {/* Hero Section */}
            <div className="hero-section">
                <motion.div 
                    className="hero-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="hero-title">
                        <span className="highlight">Revolutionizing</span> Healthcare 
                        <br />with <span className="highlight-alt">AI Technology</span>
                    </h1>
                    <p className="hero-description">
                        At Diagno AI, we're committed to making advanced medical diagnostics 
                        accessible to everyone through cutting-edge artificial intelligence.
                    </p>
                    <div className="hero-badges">
                        <div className="badge">
                            <AiFillRobot className="badge-icon" />
                            <span>AI Powered</span>
                        </div>
                        <div className="badge">
                            <MdSpeed className="badge-icon" />
                            <span>Fast Results</span>
                        </div>
                        <div className="badge">
                            <FaHeartbeat className="badge-icon" />
                            <span>Reliable Care</span>
                        </div>
                    </div>
                </motion.div>
                <motion.div 
                    className="hero-image"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <img src="https://res.cloudinary.com/dbroxheos/image/upload/v1736185368/jjj_mgdhro.png" alt="Healthcare AI" />
                </motion.div>
            </div>

            {/* Vision Section */}
            <motion.div 
                className="vision-section"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
            >
                <div className="vision-content">
                    <div className="vision-text">
                        <h2 className="section-title">Our Vision</h2>
                        <p className="vision-description">
                            To transform healthcare delivery through artificial intelligence, 
                            making it more accurate, accessible, and affordable for everyone.
                        </p>
                    </div>
                    <div className="vision-stats">
                        {[
                            { icon: GiArtificialIntelligence, number: "98%", label: "Accuracy Rate" },
                            { icon: MdSpeed, number: "24/7", label: "Availability" },
                            { icon: FaHeartbeat, number: "50k+", label: "Users Served" }
                        ].map((stat, index) => (
                            <div className="stat-card" key={index}>
                                <stat.icon className="stat-icon" />
                                <div className="stat-info">
                                    <span className="stat-number">{stat.number}</span>
                                    <span className="stat-label">{stat.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Features Section */}
            <motion.div 
                className="features-section"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
            >
                <h2 className="section-title">Why Choose Diagno AI?</h2>
                <div className="features-grid">
                    {[
                        { icon: FaStethoscope, title: "Advanced Diagnostics", desc: "State-of-the-art AI technology for accurate medical analysis" },
                        { icon: FaUserMd, title: "Expert Support", desc: "Access to qualified healthcare professionals" },
                        { icon: AiOutlineSafety, title: "Reliable Results", desc: "High accuracy rates backed by continuous learning" },
                        { icon: MdOutlinePrivacyTip, title: "Privacy First", desc: "Your data is protected with enterprise-grade security" },
                        { icon: GiHealthNormal, title: "Comprehensive Care", desc: "Complete healthcare solutions under one platform" },
                        { icon: FaHospital, title: "Hospital Network", desc: "Connected with leading healthcare facilities" }
                    ].map((feature, index) => (
                        <div className="feature-card" key={index}>
                            <div className="feature-icon-wrapper">
                                <feature.icon className="feature-icon" />
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Process Section */}
            <motion.div 
                className="process-section"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
            >
                <div className="process-content">
                    <h2 className="section-title">How It Works</h2>
                    <div className="process-steps">
                        {[
                            { number: 1, title: "Upload Reports", desc: "Securely upload your medical reports or scans" },
                            { number: 2, title: "AI Analysis", desc: "Our advanced AI performs detailed analysis of your reports" },
                            { number: 3, title: "Expert Review", desc: "Get comprehensive insights from healthcare professionals" }
                        ].map((step, index) => (
                            <div key={index} className="step-container">
                                <div className="step">
                                    <div className="step-number">{step.number}</div>
                                    <div className="step-content">
                                        <h3>{step.title}</h3>
                                        <p>{step.desc}</p>
                                    </div>
                                </div>
                                {index < 2 && <div className="step-connector" />}
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div 
                className="cta-section"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
            >
                <div className="cta-content">
                    <h2>Ready to Experience the Future of Healthcare?</h2>
                    <p>Join thousands of users who trust Diagno AI for their healthcare needs</p>
                    <button 
                        className="cta-button"
                        onClick={() => history.push('/services')}
                    >
                        Get Started Now
                    </button>
                </div>
            </motion.div>
        </div>
        </>
    )
}

export default AboutUs