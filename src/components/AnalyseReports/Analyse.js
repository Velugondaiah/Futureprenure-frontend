import React from 'react';
import { Link } from "react-router-dom";
import Header from "../Header/Header";
import { FiUpload, FiVolume2, FiSquare } from 'react-icons/fi';
import { FaHeartbeat } from 'react-icons/fa';
import "./Analyse.css";

const languages = [
    { id: "english", language: "English" },
    { id: "telugu", language: "Telugu / తెలుగు" },
    { id: "hindi", language: "Hindi / हिंदी" },
    { id: "tamil", language: "Tamil / தமிழ்" },
    { id: "kannada", language: "Kannada / ಕನ್ನಡ" },
    { id: "malayalam", language: "Malayalam / മലയാളം" },
    { id: "marathi", language: "Marathi / मराठी" },
    { id: "bengali", language: "Bengali / বাংলা" },
    { id: "gujarati", language: "Gujarati / ગુજરાતી" },
    { id: "punjabi", language: "Punjabi / ਪੰਜਾਬੀ" }
];

class Analyse extends React.Component {
    state = {
        languages: languages,
        selectedLanguage: "english",
        file: null,
        result: null,
        error: null,
        loading: false,
        recommendedSpecialist: null,
        speaking: false,
        speakingSectionIndex: null
    };

    handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            this.setState({ file, error: null });
        } else {
            this.setState({ error: "Please select a file." });
        }
    };

    handleLanguageChange = (e) => {
        this.setState({ selectedLanguage: e.target.value });
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        const { file, selectedLanguage } = this.state;

        if (!file) {
            this.setState({ error: "Please upload a file." });
            return;
        }

        this.setState({ error: null, loading: true, result: null });
      
        const formData = new FormData();
        formData.append('file', file);
        formData.append('language', selectedLanguage);

        try {
            const response = await fetch('https://backend-diagno-1.onrender.com/api/analyze', {
                // https://backend-diagno-1.onrender.com
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
                //
                mode: 'cors',
                credentials: 'omit'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze report');
            }

            if (data && data.success) {
                const { formattedOutput } = data;
                
                // Extract specialist from point 5 of the analysis
                const specialistMatch = formattedOutput.match(/5\.\s*Recommended\s*Specialist:[\s\S]*?Specialist:\s*(\w+)/);
                const specialist = specialistMatch ? specialistMatch[1].trim() : '';
                console.log(specialist)
                console.log('Extracted specialist:', specialist); // For debugging

                this.setState({
                    result: formattedOutput,
                    recommendedSpecialist: specialist,
                    error: null,
                    loading: false
                });
            } else {
                throw new Error(data.error || 'Failed to analyze report');
            }
        } catch (error) {
            console.error('Error:', error);
            this.setState({
                error: 'Analysis failed. Please try again.',
                loading: false
            });
        }
    };

    stopAudio = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            this.setState({ speaking: false, speakingSectionIndex: null });
        }
    };

    playAudio = (text, sectionIndex) => {
        if (!window.speechSynthesis) {
            alert('Text-to-speech is not supported in your browser.');
            return;
        }

        this.stopAudio();

        try {
            const utterance = new SpeechSynthesisUtterance(text);
            
            const langMap = {
                'english': 'en-US',
                'telugu': 'te-IN',
                'hindi': 'hi-IN',
                'tamil': 'ta-IN',
                'kannada': 'kn-IN',
                'malayalam': 'ml-IN',
                'marathi': 'mr-IN',
                'bengali': 'bn-IN'
            };
            
            utterance.lang = langMap[this.state.selectedLanguage] || 'en-US';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            
            utterance.onstart = () => {
                this.setState({ speaking: true, speakingSectionIndex: sectionIndex });
            };
            
            utterance.onend = () => {
                this.setState({ speaking: false, speakingSectionIndex: null });
            };
            
            utterance.onerror = () => {
                this.setState({ speaking: false, speakingSectionIndex: null });
            };

            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('Speech synthesis error:', error);
            this.setState({ speaking: false, speakingSectionIndex: null });
        }
    };

    componentWillUnmount() {
        this.stopAudio();
    }

    getSectionHeading = (sectionNumber) => {
        const headings = {
            english: {
                1: "Symptoms",
                2: "Diagnosis",
                3: "Severity Level",
                4: "Treatment Recommendations",
                5: "Recommended Specialist"
            },
            telugu: {
                1: "లక్షణాలు",
                2: "రోగనిర్ధారణ",
                3: "తీవ్రత స్థాయి",
                4: "చికిత్స సిఫార్సులు",
                5: "సిఫార్సు చేయబడిన నిపుణుడు"
            },
            hindi: {
                1: "लक्षण",
                2: "निदान",
                3: "गंभीरता का स्तर",
                4: "उपचार की सिफारिशें",
                5: "अनुशंसित विशेषज्ञ"
            },
            tamil: {
                1: "அறிகுறிகள்",
                2: "நோயறிதல்",
                3: "தீவிர நிலை",
                4: "சிகிச்சை பரிந்துரைகள்",
                5: "பரிந்துரைக்கப்பட்ட நிபுணர்"
            },
            kannada: {
                1: "ರೋಗಲಕ್ಷಣಗಳು",
                2: "ರೋಗನಿರ್ಣಯ",
                3: "ತೀವ್ರತೆಯ ಮಟ್ಟ",
                4: "ಚಿಕಿತ್ಸೆಯ ಶಿಫಾರಸುಗಳು",
                5: "ಶಿಫಾರಸು ಮಾಡಿದ ತಜ್ಞ"
            },
            malayalam: {
                1: "രോഗലക്ഷണങ്ങൾ",
                2: "രോഗനിർണ്ണയം",
                3: "തീവ്രത നില",
                4: "ചികിത്സാ ശുപാർശകൾ",
                5: "ശുപാർശ ചെയ്ത വിദഗ്ധൻ"
            },
            marathi: {
                1: "लक्षणे",
                2: "निदान",
                3: "तीव्रता पातळी",
                4: "उपचार शिफारसी",
                5: "शिफारस केलेले तज्ञ"
            },
            bengali: {
                1: "লক্ষণগুলি",
                2: "রোগ নির্ণয়",
                3: "তীব্রতার মাত্রা",
                4: "চিকিৎসার সুপারিশ",
                5: "সুপারিশকৃত বিশেষজ্ঞ"
            }
        };

        return headings[this.state.selectedLanguage]?.[sectionNumber] || headings.english[sectionNumber];
    };

    handleAppointmentClick = () => {
        const { recommendedSpecialist } = this.state;
        if (recommendedSpecialist) {
            this.props.history.push(`/appointments?specialist=${encodeURIComponent(recommendedSpecialist)}`);
        }
    };

    render() {
        const { languages, selectedLanguage, result, error, loading, recommendedSpecialist, speaking, speakingSectionIndex } = this.state;

        return (
            <>
                <Header />
                <div className="report-cont">
                    <div className="container-for-report">
                        <form onSubmit={this.handleSubmit}>
                            <div className="files">
                                <div className="file-upload-container">
                                    <label htmlFor="file-upload" className="custom-file-upload">
                                        <FiUpload className="upload-icon" />
                                        Upload Your Report
                                    </label>
                                    <input
                                        id="file-upload"
                                        className="file"
                                        type="file"
                                        accept="image/*"
                                        onChange={this.handleFileChange}
                                    />
                                </div>

                                <div className="language-dropdown-container">
                                    <label htmlFor="language-select">Choose a language:</label>
                                    <select
                                        id="language-select"
                                        value={selectedLanguage}
                                        onChange={this.handleLanguageChange}
                                        className="language-dropdown"
                                    >
                                        {languages.map((lang) => (
                                            <option key={lang.id} value={lang.id}>
                                                {lang.language}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {error && <p className="error-message">{error}</p>}

                            {this.state.file && (
                                <div className="proceed-button-container">
                                    <button className="proceed-button" type="submit" disabled={loading}>
                                        {loading ? 'Processing...' : 'Proceed'}
                                    </button>
                                </div>
                            )}
                        </form>

                        {loading && (
                            <div className="loader-container">
                                <FaHeartbeat className="heartbeat-icon" />
                            </div>
                        )}

                        {result && (
                            <div className="result-container">
                                <h2 className="result-heading">Medical Report Analysis</h2>
                                <div className="result-sections">
                                    {result.split(/(?=\d\.\s+[^:]+:)/)
                                        .filter(section => section.trim())
                                        .map((section, index) => {
                                            const match = section.match(/^(\d\.\s+[^:]+:)([\s\S]+)$/);
                                            if (!match) return null;
                                            
                                            const [_, title, content] = match;
                                            const sectionNumber = index + 1;
                                            const translatedTitle = this.getSectionHeading(sectionNumber);
                                            const isSpeakingThis = speaking && speakingSectionIndex === index;
                                            
                                            return (
                                                <div key={index} className="analysis-block">
                                                    <div className="section-header">
                                                        <div className="section-title">
                                                            {`${sectionNumber}. ${translatedTitle}:`}
                                                        </div>
                                                        <button 
                                                            className={`speech-button ${isSpeakingThis ? 'speaking' : ''}`}
                                                            onClick={() => {
                                                                if (isSpeakingThis) {
                                                                    this.stopAudio();
                                                                } else {
                                                                    this.playAudio(content.trim(), index);
                                                                }
                                                            }}
                                                        >
                                                            {isSpeakingThis ? <FiSquare /> : <FiVolume2 />}
                                                            <span>{isSpeakingThis ? 'Stop' : 'Listen'}</span>
                                                        </button>
                                                    </div>
                                                    <div className="section-content">
                                                        {content.trim()}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                                <div className="appointment-section">
                                  {recommendedSpecialist ? (
                                    <div className="specialist-info">
                                        <h3>Recommended Specialist: {recommendedSpecialist}</h3>
                                        <Link 
                                            to={{
                                                pathname: "/appointments",
                                                search: `?specialist=${encodeURIComponent(recommendedSpecialist)}`,
                                                state: { specialist: recommendedSpecialist.length > 0 ? recommendedSpecialist : "General Medicine" }
                                            }}
                                            className="appointment-link"
                                        >
                                            <button className="report-button">
                                                {recommendedSpecialist.length > 0 ? (
                                                    `Book Appointment with ${recommendedSpecialist}`
                                                ) : (
                                                    "General Medicine"
                                                )}
                                            </button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="no-specialist-info">
                                        <p>No specialist recommendation found in the analysis.</p>
                                        <p className="debug-info">
                                            Please ensure the medical report contains sufficient information 
                                            for specialist recommendation.
                                        </p>
                                        {process.env.NODE_ENV === 'development' && (
                                            <pre className="debug-output">
                                                {JSON.stringify({ result }, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                )}
                            </div>
                            </div>
                        )}
                      
                    </div>
                </div>
            </>
        );
    }
}

export default Analyse;