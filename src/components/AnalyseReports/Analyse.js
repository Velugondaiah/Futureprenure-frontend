import React from 'react';
import { Link } from "react-router-dom";
import Header from "../Header/Header";
import { FiUpload, FiVolume2, FiSquare } from 'react-icons/fi';
import { FaHeartbeat } from 'react-icons/fa';
import "./Analyse.css";
// const API_URL = process.env.REACT_APP_API_URL;

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
        originalSpecialist: null,
        speaking: false,
        speakingSectionIndex: null,
        corsError: false
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
            const response = await fetch('http://localhost:3009/api/analyze', {
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
                const { formattedOutput, originalAnalysis } = data;
                
                console.log('Formatted output:', formattedOutput);
                
                // Extract specialist name
                let specialist = '';
                let originalSpecialist = '';
                
                // Create a more inclusive regex pattern that works for all languages
                if (selectedLanguage === 'english') {
                    // For English, use the standard pattern
                    const specialistMatch = formattedOutput.match(/5\.\s*Recommended\s*Specialist:[\s\S]*?Specialist:\s*(\w+)/i);
                    if (specialistMatch) {
                        specialist = specialistMatch[1].trim();
                    }
                    originalSpecialist = specialist;
                } else {
                    // For other languages, use language-specific patterns
                    console.log(`Searching for specialist in ${selectedLanguage} content`);
                    
                    // Extract all content from section 5
                    const section5Match = formattedOutput.match(/5\..*$/ms);
                    if (section5Match) {
                        const section5Content = section5Match[0];
                        console.log("Section 5 content:", section5Content);
                        
                        // Language-specific patterns for the word "Specialist:" in different languages
                        const specialistPatterns = {
                            'telugu': /స్పెషలిస్ట్:\s*([^\n]+)/,
                            'hindi': /विशेषज्ञ:\s*([^\n]+)/,
                            'tamil': /நிபுணர்:\s*([^\n]+)/,
                            'kannada': /ತಜ್ಞ:\s*([^\n]+)/,
                            'malayalam': /വിദഗ്ധൻ:\s*([^\n]+)/,
                            'marathi': /तज्ञ:\s*([^\n]+)/,
                            'bengali': /বিশেষজ্ঞ:\s*([^\n]+)/,
                            'gujarati': /નિષ્ણાત:\s*([^\n]+)/,
                            'punjabi': /ਮਾਹਿਰ:\s*([^\n]+)/
                        };
                        
                        // Try the language-specific pattern first
                        const languagePattern = specialistPatterns[selectedLanguage];
                        if (languagePattern) {
                            const specialistLineMatch = section5Content.match(languagePattern);
                            if (specialistLineMatch) {
                                specialist = specialistLineMatch[1].trim();
                                console.log(`Found specialist in ${selectedLanguage}:`, specialist);
                            }
                        }
                        
                        // If no match, try a more general pattern - look for a pattern after the digit 5
                        if (!specialist) {
                            // General fallback pattern - find any word after a colon near the end of section 5
                            const generalPatternMatch = section5Content.match(/:\s*([^\n.,]+)/);
                            if (generalPatternMatch) {
                                specialist = generalPatternMatch[1].trim();
                                console.log("Found specialist using general pattern:", specialist);
                            }
                        }
                    }
                    
                    // For the original English name, extract from originalAnalysis if available
                    if (originalAnalysis) {
                        const originalSpecialistMatch = originalAnalysis.match(/5\.\s*Recommended\s*Specialist:[\s\S]*?Specialist:\s*(\w+)/i);
                        if (originalSpecialistMatch) {
                            originalSpecialist = originalSpecialistMatch[1].trim();
                            console.log('Extracted original English specialist:', originalSpecialist);
                        }
                    }
                    
                    // If we couldn't extract the original English specialist, use a mapping of common specialists
                    if (!originalSpecialist && specialist) {
                        // Specialist mappings for different languages
                        const specialistMappings = {
                            // Telugu mappings
                            'telugu': {
                                'కార్డియాలజిస్ట్': 'Cardiologist',
                                'న్యూరాలజిస్ట్': 'Neurologist',
                                'గ్యాస్ట్రోఎంటరాలజిస్ట్': 'Gastroenterologist',
                                'నెఫ్రాలజిస్ట్': 'Nephrologist',
                                'పల్మోనాలజిస్ట్': 'Pulmonologist',
                                'ఆంకాలజిస్ట్': 'Oncologist',
                                'డెర్మటాలజిస్ట్': 'Dermatologist',
                                'ఆర్థోపెడిస్ట్': 'Orthopedist',
                                'ఆఫ్తాల్మాలజిస్ట్': 'Ophthalmologist',
                                'ENT': 'ENT',
                                'ఎండోక్రినాలజిస్ట్': 'Endocrinologist'
                            },
                            // Hindi mappings
                            'hindi': {
                                'कार्डियोलॉजिस्ट': 'Cardiologist',
                                'न्यूरोलॉजिस्ट': 'Neurologist',
                                'गैस्ट्रोएंटरोलॉजिस्ट': 'Gastroenterologist',
                                'नेफ्रोलॉजिस्ट': 'Nephrologist',
                                'पल्मोनोलॉजिस्ट': 'Pulmonologist',
                                'ऑन्कोलॉजिस्ट': 'Oncologist',
                                'डर्मेटोलॉजिस्ट': 'Dermatologist',
                                'ऑर्थोपेडिस्ट': 'Orthopedist',
                                'ऑफ्थैल्मोलॉजिस्ट': 'Ophthalmologist',
                                'ENT': 'ENT',
                                'एंडोक्रिनोलॉजिस्ट': 'Endocrinologist'
                            },
                            // Tamil mappings
                            'tamil': {
                                'இதய மருத்துவர்': 'Cardiologist',
                                'நரம்பியல் மருத்துவர்': 'Neurologist',
                                'இரைப்பை மருத்துவர்': 'Gastroenterologist',
                                'சிறுநீரக மருத்துவர்': 'Nephrologist',
                                'நுரையீரல் மருத்துவர்': 'Pulmonologist',
                                'புற்றுநோய் மருத்துவர்': 'Oncologist',
                                'தோல் மருத்துவர்': 'Dermatologist',
                                'எலும்பியல் மருத்துவர்': 'Orthopedist',
                                'கண் மருத்துவர்': 'Ophthalmologist',
                                'ENT': 'ENT',
                                'நாளமில்லா சுரப்பி மருத்துவர்': 'Endocrinologist'
                            },
                            // Kannada mappings
                            'kannada': {
                                'ಹೃದಯ ತಜ್ಞ': 'Cardiologist',
                                'ನರ ತಜ್ಞ': 'Neurologist',
                                'ಜಠರ ತಜ್ಞ': 'Gastroenterologist',
                                'ಮೂತ್ರಕೋಶ ತಜ್ಞ': 'Nephrologist',
                                'ಶ್ವಾಸಕೋಶ ತಜ್ಞ': 'Pulmonologist',
                                'ಕ್ಯಾನ್ಸರ್ ತಜ್ಞ': 'Oncologist',
                                'ಚರ್ಮ ತಜ್ಞ': 'Dermatologist',
                                'ಮೂಳೆ ತಜ್ಞ': 'Orthopedist',
                                'ನೇತ್ರ ತಜ್ಞ': 'Ophthalmologist',
                                'ENT': 'ENT',
                                'ಅಂತಃಸ್ರಾವಿ ತಜ್ಞ': 'Endocrinologist'
                            },
                            // Add mappings for other languages as needed
                        };
                        
                        // Use the language-specific mapping if available
                        const languageMapping = specialistMappings[selectedLanguage];
                        if (languageMapping && languageMapping[specialist]) {
                            originalSpecialist = languageMapping[specialist];
                            console.log(`Mapped ${selectedLanguage} specialist "${specialist}" to English: ${originalSpecialist}`);
                        } else {
                            // Generic mapping for common transliterated words
                            const genericMapping = {
                                'कार्डियोलॉजिस्ट': 'Cardiologist',
                                'ಹೃದಯ ತಜ್ಞ': 'Cardiologist',
                                'இதய மருத்துவர்': 'Cardiologist',
                                'ഹൃദയരോഗ വിദഗ്ധ': 'Cardiologist',
                                'हृदयरोग तज्ञ': 'Cardiologist',
                                'হৃদরোগ বিশেষজ্ঞ': 'Cardiologist',
                                
                                // Common transliterations across languages
                                'cardiologist': 'Cardiologist',
                                'neurologist': 'Neurologist',
                                'gastroenterologist': 'Gastroenterologist',
                                'nephrologist': 'Nephrologist',
                                'pulmonologist': 'Pulmonologist',
                                'oncologist': 'Oncologist',
                                'dermatologist': 'Dermatologist',
                                'orthopedist': 'Orthopedist',
                                'ophthalmologist': 'Ophthalmologist',
                                'ent': 'ENT',
                                'endocrinologist': 'Endocrinologist'
                            };
                            
                            // Try case-insensitive matching with generic mapping
                            const lowerSpecialist = specialist.toLowerCase();
                            for (const [key, value] of Object.entries(genericMapping)) {
                                if (lowerSpecialist.includes(key.toLowerCase())) {
                                    originalSpecialist = value;
                                    console.log(`Mapped generic term "${key}" to "${value}"`);
                                    break;
                                }
                            }
                            
                            // If still no match, just use the original
                            if (!originalSpecialist) {
                                originalSpecialist = specialist;
                                console.log('Could not map specialist, using original value');
                            }
                        }
                    }
                }
                
                console.log('Translated specialist:', specialist);
                console.log('Original specialist (for database):', originalSpecialist);
                
                // Debug info for translation issues
                if (!specialist && formattedOutput) {
                    console.log('Failed to extract specialist from output. Full text sample:');
                    console.log(formattedOutput.substring(formattedOutput.length - 500));
                }

                this.setState({
                    result: formattedOutput,
                    recommendedSpecialist: specialist || "Not found",
                    originalSpecialist: originalSpecialist || specialist || "General Medicine",
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

    componentDidMount() {
        // Load voices when component mounts
        this.loadVoices();
        
        // Set up voice change event handler
        if (window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = this.loadVoices;
        }
    }
    
    loadVoices = () => {
        if (window.speechSynthesis) {
            const voices = window.speechSynthesis.getVoices();
            console.log(`Loaded ${voices.length} voices:`, voices.map(v => `${v.name} (${v.lang})`).join(', '));
            this.setState({ voices });
        }
    };

    stopAudio = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            
            // Clear any utterances that might be in the queue
            this.utterances = [];
        }
        
        this.setState({ speaking: false, speakingSectionIndex: null });
    };

    playAudio = (text, sectionIndex) => {
        if (!window.speechSynthesis) {
            alert('Text-to-speech is not supported in your browser.');
            return;
        }

        // First stop any ongoing speech
        this.stopAudio();

        try {
            // Set speaking state
            this.setState({ speaking: true, speakingSectionIndex: sectionIndex });
            
            // Get all available voices
            const availableVoices = window.speechSynthesis.getVoices() || [];
            console.log("Available voices:", availableVoices.map(v => `${v.name} (${v.lang})`));
            
            // Language code mapping with regional variants for better clarity
            const langMap = {
                'english': { code: 'en', variant: 'en-US' },
                'telugu': { code: 'te', variant: 'te-IN' },
                'hindi': { code: 'hi', variant: 'hi-IN' },
                'tamil': { code: 'ta', variant: 'ta-IN' },
                'kannada': { code: 'kn', variant: 'kn-IN' },
                'malayalam': { code: 'ml', variant: 'ml-IN' },
                'marathi': { code: 'mr', variant: 'mr-IN' },
                'bengali': { code: 'bn', variant: 'bn-IN' },
                'gujarati': { code: 'gu', variant: 'gu-IN' },
                'punjabi': { code: 'pa', variant: 'pa-IN' }
            };
            
            const langInfo = langMap[this.state.selectedLanguage] || langMap.english;
            console.log(`Playing audio in ${this.state.selectedLanguage} (${langInfo.variant})`);
            
            // Use a more sophisticated voice selection algorithm
            let selectedVoice = null;
            
            if (availableVoices.length > 0) {
                // Prioritize voices based on quality and match (order matters)
                const voiceCandidates = [
                    // Try exact match with the full language-region code
                    availableVoices.find(v => v.lang.toLowerCase() === langInfo.variant.toLowerCase()),
                    
                    // Try premium/enhanced voices that might have better quality
                    availableVoices.find(v => 
                        v.lang.toLowerCase().startsWith(langInfo.code.toLowerCase()) && 
                        (v.name.includes('Enhanced') || v.name.includes('Premium') || v.name.includes('Neural'))
                    ),
                    
                    // Try Google voices which often have better quality for Indian languages
                    availableVoices.find(v => 
                        v.lang.toLowerCase().startsWith(langInfo.code.toLowerCase()) && 
                        v.name.includes('Google')
                    ),
                    
                    // Try any voice with the language code
                    availableVoices.find(v => 
                        v.lang.toLowerCase().startsWith(langInfo.code.toLowerCase())
                    ),
                    
                    // For Indian languages, try Microsoft voices which sometimes work well
                    availableVoices.find(v => 
                        v.name.includes('Microsoft') && 
                        v.lang.toLowerCase().startsWith(langInfo.code.toLowerCase())
                    ),
                    
                    // Last resort: any English voice (preferably Google) for better clarity
                    availableVoices.find(v => v.name.includes('Google') && v.lang.startsWith('en')),
                    
                    // Absolute fallback: any voice
                    availableVoices[0]
                ];
                
                // Select the first non-null voice from the candidates
                selectedVoice = voiceCandidates.find(v => v !== undefined);
                
                if (selectedVoice) {
                    console.log(`Selected voice: ${selectedVoice.name} (${selectedVoice.lang})`);
                } else {
                    console.log('No suitable voice found, using browser default');
                }
            }
            
            // Optimize chunk size based on language
            const maxChunkLength = this.state.selectedLanguage === 'english' ? 150 : 80;
            
            // Improved text chunking - break at punctuation for more natural pauses
            const punctuationRegex = /(?<=[.!?།॥;])\s+/;
            const sentences = text.split(punctuationRegex);
            
            const chunks = [];
            let currentChunk = '';
            
            sentences.forEach(sentence => {
                // Remove excessive whitespace
                const cleanSentence = sentence.trim().replace(/\s+/g, ' ');
                
                if (!cleanSentence) return; // Skip empty sentences
                
                if (currentChunk.length + cleanSentence.length < maxChunkLength) {
                    currentChunk += (currentChunk ? ' ' : '') + cleanSentence;
                } else {
                    // For longer sentences, try to break at natural pause points like commas
                    if (cleanSentence.length > maxChunkLength && cleanSentence.includes(',')) {
                        const subParts = cleanSentence.split(/(?<=,)\s+/);
                        
                        if (currentChunk) chunks.push(currentChunk);
                        
                        let subChunk = '';
                        subParts.forEach(part => {
                            if (subChunk.length + part.length < maxChunkLength) {
                                subChunk += (subChunk ? ' ' : '') + part;
                            } else {
                                if (subChunk) chunks.push(subChunk);
                                subChunk = part;
                            }
                        });
                        
                        if (subChunk) currentChunk = subChunk;
                        else currentChunk = '';
                    } else {
                        if (currentChunk) chunks.push(currentChunk);
                        currentChunk = cleanSentence;
                    }
                }
            });
            
            if (currentChunk) chunks.push(currentChunk);
            
            console.log(`Split text into ${chunks.length} chunks for better pronunciation`);
            
            // Store utterances for possible later cancellation
            this.utterances = [];
            
            // Create optimized utterances for each chunk
            const utterances = chunks.map(chunk => {
                const utterance = new SpeechSynthesisUtterance(chunk);
                
                // Set the language variant for better results
                utterance.lang = langInfo.variant;
                
                // Set voice if found
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }
                
                // Optimize speech parameters based on language for better clarity
                // Non-English languages often need slower rates
                if (this.state.selectedLanguage === 'english') {
                    utterance.rate = 0.95;  // Slightly slower than default
                    utterance.pitch = 1.0;  // Normal pitch
                } else {
                    utterance.rate = 0.8;   // Slower for better clarity in non-English languages
                    utterance.pitch = 1.05; // Slightly higher pitch can improve clarity
                }
                
                utterance.volume = 1.0;     // Maximum volume
                
                // Save the utterance for possible cancellation
                this.utterances.push(utterance);
                
                return utterance;
            });
            
            if (utterances.length === 0) {
                console.error('No utterances created');
                this.setState({ speaking: false, speakingSectionIndex: null });
                return;
            }
            
            // Create a chain of utterances with proper pauses between chunks
            for (let i = 0; i < utterances.length - 1; i++) {
                utterances[i].onend = () => {
                    console.log(`Finished chunk ${i+1}/${utterances.length}`);
                    if (this.state.speaking) {
                        console.log(`Speaking next chunk ${i+2}/${utterances.length}`);
                        
                        // Add a slight pause between chunks for better comprehension
                        setTimeout(() => {
                            if (this.state.speaking) {
                                window.speechSynthesis.speak(utterances[i+1]);
                            }
                        }, 150); // Longer pause between chunks for better comprehension
                    }
                };
            }
            
            // Set the final utterance to finish
            utterances[utterances.length - 1].onend = () => {
                console.log('Finished all speech');
                this.setState({ speaking: false, speakingSectionIndex: null });
            };
            
            // Handle errors
            utterances.forEach((utterance, index) => {
                utterance.onerror = (e) => {
                    console.error(`Speech error in chunk ${index+1}:`, e);
                    
                    // Log detailed error information
                    if (e.error) console.error('Error type:', e.error);
                    if (e.message) console.error('Error message:', e.message);
                    
                    // Try to continue with next chunk on error
                    if (this.state.speaking && index < utterances.length - 1) {
                        setTimeout(() => {
                            window.speechSynthesis.speak(utterances[index+1]);
                        }, 100);
                    } else {
                        this.setState({ speaking: false, speakingSectionIndex: null });
                    }
                };
            });
            
            // Fix for Chrome and Edge TTS issues: restart synthesis if it stops unexpectedly
            // This is a workaround for a known bug in Chrome's TTS implementation
            let lastTimestamp = Date.now();
            const checkInterval = 1000; // Check every 1 second
            
            this.ttsWatchdog = setInterval(() => {
                if (this.state.speaking && !window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
                    const now = Date.now();
                    if (now - lastTimestamp > 500) { // Allow a small delay to account for natural pauses
                        console.log('Speech stopped unexpectedly, attempting to resume');
                        const currentIndex = this.utterances.findIndex(u => u === utterances[utterances.length - 1]);
                        if (currentIndex >= 0 && currentIndex < utterances.length - 1) {
                            window.speechSynthesis.speak(utterances[currentIndex + 1]);
                        }
                    }
                }
                lastTimestamp = Date.now();
            }, checkInterval);
            
            // Start speaking the first chunk
            console.log(`Starting speech with ${utterances.length} chunks`);
            window.speechSynthesis.speak(utterances[0]);
            
        } catch (error) {
            console.error('Text-to-speech error:', error);
            this.setState({ speaking: false, speakingSectionIndex: null });
        }
    };

    componentWillUnmount() {
        this.stopAudio();
        
        // Clear the TTS watchdog interval
        if (this.ttsWatchdog) {
            clearInterval(this.ttsWatchdog);
        }
        
        // Clean up the voice change event handler
        if (window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = null;
        }
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
        const { languages, selectedLanguage, result, error, loading, recommendedSpecialist, originalSpecialist, speaking, speakingSectionIndex, corsError } = this.state;

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
                                                search: `?specialist=${encodeURIComponent(originalSpecialist || recommendedSpecialist)}`,
                                                state: { specialist: originalSpecialist || recommendedSpecialist }
                                            }}
                                            className="appointment-link"
                                        >
                                            <button className="report-button">
                                                {`Book Appointment with ${recommendedSpecialist}`}
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