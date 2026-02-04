const { useState, useEffect, useRef } = React;

// Card types and their configurations
const CARD_CONFIG = {
    matching: { count: 3, color: '#3b82f6', label: 'Matching', icon: '🔵' },
    measuring: { count: 3, color: '#10b981', label: 'Measuring', icon: '🟢' },
    radar: { count: 2, color: '#f59e0b', label: 'Radar', icon: '🟠' },
    thermometer: { count: 2, color: '#eab308', label: 'Thermometer', icon: '🟡' },
    photo: { count: 1, color: '#06b6d4', label: 'Photo', icon: '🔷' }
};

const RADAR_DISTANCES = ['5 mi', '3 mi', '1 mi', '½ mi', '¼ mi', 'Custom'];
const NOTTINGHAM_CENTER = [52.9548, -1.1581];

function App() {
    const [gameStarted, setGameStarted] = useState(false);
    const [seekerCards, setSeekerCards] = useState({
        matching: 3,
        measuring: 3,
        radar: 2,
        thermometer: 2,
        photo: 1
    });
    const [usedQuestions, setUsedQuestions] = useState([]);
    const [myLocation, setMyLocation] = useState(null);
    const [gpsAccuracy, setGpsAccuracy] = useState(null);
    
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const myMarkerRef = useRef(null);
    const questionMarkersRef = useRef([]);
    const watchIdRef = useRef(null);

    // Initialize map
    useEffect(() => {
        if (gameStarted && mapRef.current && !mapInstanceRef.current) {
            const map = L.map(mapRef.current).setView(NOTTINGHAM_CENTER, 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);
            mapInstanceRef.current = map;
        }
    }, [gameStarted]);

    // GPS tracking
    useEffect(() => {
        if (gameStarted && 'geolocation' in navigator) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const newLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setMyLocation(newLocation);
                    setGpsAccuracy(Math.round(position.coords.accuracy));
                    updateMyMarker(newLocation);
                },
                (error) => console.error('GPS error:', error),
                {
                    enableHighAccuracy: true,
                    maximumAge: 5000,
                    timeout: 10000
                }
            );

            return () => {
                if (watchIdRef.current) {
                    navigator.geolocation.clearWatch(watchIdRef.current);
                }
            };
        }
    }, [gameStarted]);

    function updateMyMarker(location) {
        if (!mapInstanceRef.current) return;
        
        if (myMarkerRef.current) {
            myMarkerRef.current.setLatLng([location.lat, location.lng]);
        } else {
            const icon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [20, 20]
            });
            myMarkerRef.current = L.marker([location.lat, location.lng], { icon }).addTo(mapInstanceRef.current);
            myMarkerRef.current.bindPopup('You are here');
        }
        
        mapInstanceRef.current.setView([location.lat, location.lng], mapInstanceRef.current.getZoom());
    }

    function addQuestionMarker(question) {
        if (!mapInstanceRef.current || !question.location) return;
        
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: ${CARD_CONFIG[question.type].color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 16px;">${CARD_CONFIG[question.type].icon}</div>`,
            iconSize: [30, 30]
        });
        
        const marker = L.marker([question.location.lat, question.location.lng], { icon }).addTo(mapInstanceRef.current);
        marker.bindPopup(`${CARD_CONFIG[question.type].label}<br>${question.details || ''}<br>${question.timeUsed}`);
        questionMarkersRef.current.push(marker);
    }

    function useQuestion(type) {
        if (seekerCards[type] <= 0) return;
        setShowModal(true);
        setModalContent({ type, action: 'ask' });
    }

    function confirmQuestion(type, details) {
        if (!myLocation) {
            alert('Waiting for GPS location...');
            return;
        }

        setSeekerCards(prev => ({
            ...prev,
            [type]: prev[type] - 1
        }));
        
        const question = {
            type: type,
            details: details,
            location: { ...myLocation },
            timestamp: Date.now(),
            timeUsed: new Date().toLocaleTimeString()
        };
        
        setUsedQuestions(prev => [...prev, question]);
        addQuestionMarker(question);
        setShowModal(false);
        
        alert(`Question asked from this location!\n\nSend the question to the hider via WhatsApp/Snap.\n\nHider will answer and draw a card.`);
    }

    function resetGame() {
        if (confirm('Reset the game? This will clear all progress.')) {
            setGameStarted(false);
            setSeekerCards({
                matching: 3,
                measuring: 3,
                radar: 2,
                thermometer: 2,
                photo: 1
            });
            setUsedQuestions([]);
            
            // Clear map markers
            questionMarkersRef.current.forEach(marker => marker.remove());
            questionMarkersRef.current = [];
            if (myMarkerRef.current) {
                myMarkerRef.current.remove();
                myMarkerRef.current = null;
            }
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        }
    }

    // Setup screen
    if (!gameStarted) {
        return (
            <div className="container">
                <div className="header">
                    <h1>🔍 Seeker App</h1>
                    <p>Track your questions on the map</p>
                </div>
                <div className="content">
                    <div style={{textAlign: 'center', padding: '40px 20px'}}>
                        <div style={{fontSize: '80px', marginBottom: '20px'}}>🗺️</div>
                        <h2 style={{marginBottom: '15px'}}>Ready to Hunt?</h2>
                        <p style={{color: '#6b7280', marginBottom: '30px', lineHeight: '1.6'}}>
                            Your GPS location will be tracked so you can see where you asked each question on the map.
                            Send questions to the hider via WhatsApp/Snap.
                        </p>
                    </div>

                    <div className="status status-info">
                        <strong>How it works:</strong>
                        <ul style={{marginLeft: '20px', marginTop: '10px', fontSize: '13px', lineHeight: '1.6'}}>
                            <li>Track which questions you've used</li>
                            <li>See on map where you asked each question</li>
                            <li>Send questions to hider via WhatsApp/Snap</li>
                            <li>Each question marks your location on the map</li>
                        </ul>
                    </div>

                    <button 
                        className="button button-primary"
                        onClick={() => setGameStarted(true)}
                        style={{marginTop: '20px', fontSize: '18px', padding: '18px'}}
                    >
                        Start Hunting 🔍
                    </button>
                </div>
            </div>
        );
    }

    // Game screen
    return (
        <div className="container">
            <div className="header">
                <h1>🔍 Seeker</h1>
                <p>Hunting Mode</p>
            </div>

            <div className="content">
                {/* GPS Status */}
                {myLocation && (
                    <div className="gps-status">
                        <span>📍 GPS Active</span>
                        <span className="gps-accuracy">±{gpsAccuracy}m</span>
                    </div>
                )}

                {/* Map */}
                <div className="map-container">
                    <div id="map" ref={mapRef}></div>
                </div>

                {/* Available Questions */}
                <h3 style={{marginTop: '20px', marginBottom: '15px'}}>
                    Available Questions ({Object.values(seekerCards).reduce((a,b) => a+b, 0)} remaining)
                </h3>
                <div className="card-grid">
                    {Object.entries(seekerCards).map(([type, count]) => (
                        <div
                            key={type}
                            className={`card card-${type}`}
                            onClick={() => count > 0 && useQuestion(type)}
                            style={{ 
                                opacity: count === 0 ? 0.3 : 1,
                                cursor: count === 0 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <div style={{fontSize: '28px', marginBottom: '5px'}}>
                                {CARD_CONFIG[type].icon}
                            </div>
                            <span className="card-count">{count}</span>
                            <span className="card-label">{CARD_CONFIG[type].label}</span>
                        </div>
                    ))}
                </div>

                {/* Question History */}
                {usedQuestions.length > 0 && (
                    <>
                        <h3 style={{marginTop: '25px', marginBottom: '15px'}}>
                            Questions Asked ({usedQuestions.length})
                        </h3>
                        <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                            {usedQuestions.slice().reverse().map((q, idx) => (
                                <div key={idx} className="hand-card" style={{marginBottom: '8px'}}>
                                    <div>
                                        <div style={{fontWeight: 'bold', marginBottom: '3px'}}>
                                            {CARD_CONFIG[q.type].icon} {CARD_CONFIG[q.type].label}
                                        </div>
                                        {q.details && (
                                            <div style={{fontSize: '13px', color: '#374151', marginBottom: '2px'}}>
                                                {q.details}
                                            </div>
                                        )}
                                        <div style={{fontSize: '12px', color: '#6b7280'}}>
                                            {q.timeUsed}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Controls */}
                <button 
                    className="button button-secondary"
                    onClick={resetGame}
                    style={{marginTop: '20px'}}
                >
                    🔄 Reset Game
                </button>
            </div>

            {/* Question Modal */}
            {showModal && modalContent?.action === 'ask' && (
                <QuestionModal
                    type={modalContent.type}
                    onClose={() => setShowModal(false)}
                    onConfirm={confirmQuestion}
                />
            )}
        </div>
    );
}

// Question Modal Component
function QuestionModal({ type, onClose, onConfirm }) {
    const [input, setInput] = useState('');
    const [distance, setDistance] = useState('1 mi');

    function handleConfirm() {
        let details = '';
        
        if (type === 'matching' || type === 'measuring') {
            if (!input.trim()) {
                alert('Please specify a landmark!');
                return;
            }
            details = input;
        } else if (type === 'radar') {
            details = distance === 'Custom' ? input : distance;
            if (distance === 'Custom' && !input.trim()) {
                alert('Please enter a custom distance!');
                return;
            }
        } else if (type === 'thermometer') {
            details = 'Warmer/Colder check';
        } else if (type === 'photo') {
            if (!input.trim()) {
                alert('Please specify what to photograph!');
                return;
            }
            details = input;
        }
        
        onConfirm(type, details);
    }

    return (
        <div className="modal">
            <div className="modal-content">
                <div className="modal-title">
                    {CARD_CONFIG[type].icon} {CARD_CONFIG[type].label} Question
                </div>

                {type === 'matching' && (
                    <div>
                        <p style={{marginBottom: '15px', color: '#6b7280', fontSize: '14px'}}>
                            Ask: "Is your nearest [X] the same as mine?"
                        </p>
                        <input
                            type="text"
                            className="text-input"
                            placeholder="e.g., Pub, Tram stop, Park..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            autoFocus
                        />
                    </div>
                )}

                {type === 'measuring' && (
                    <div>
                        <p style={{marginBottom: '15px', color: '#6b7280', fontSize: '14px'}}>
                            Ask: "Are you closer to [X] than me?"
                        </p>
                        <input
                            type="text"
                            className="text-input"
                            placeholder="e.g., Nottingham Castle, City Centre..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            autoFocus
                        />
                    </div>
                )}

                {type === 'radar' && (
                    <div>
                        <p style={{marginBottom: '15px', color: '#6b7280', fontSize: '14px'}}>
                            Ask: "Are you within [distance] of me?"
                        </p>
                        <select 
                            className="select-input"
                            value={distance}
                            onChange={(e) => setDistance(e.target.value)}
                        >
                            {RADAR_DISTANCES.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                        {distance === 'Custom' && (
                            <input
                                type="text"
                                className="text-input"
                                placeholder="e.g., 2 mi, 500m..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                autoFocus
                            />
                        )}
                    </div>
                )}

                {type === 'thermometer' && (
                    <div>
                        <p style={{marginBottom: '15px', color: '#6b7280', fontSize: '14px'}}>
                            Move at least 100m from your last position, then ask:<br/>
                            <strong>"Am I warmer or colder than before?"</strong>
                        </p>
                    </div>
                )}

                {type === 'photo' && (
                    <div>
                        <p style={{marginBottom: '15px', color: '#6b7280', fontSize: '14px'}}>
                            Ask: "Send me a photo of [X]"
                        </p>
                        <input
                            type="text"
                            className="text-input"
                            placeholder="e.g., Tallest building, Red door, Tram..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            autoFocus
                        />
                    </div>
                )}

                <div className="status status-warning" style={{marginTop: '15px', fontSize: '13px'}}>
                    💬 You'll need to send this question to the hider via WhatsApp/Snap!
                </div>

                <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                    <button 
                        className="button button-secondary"
                        onClick={onClose}
                        style={{flex: 1}}
                    >
                        Cancel
                    </button>
                    <button 
                        className="button button-primary"
                        onClick={handleConfirm}
                        style={{flex: 1}}
                    >
                        Use Question
                    </button>
                </div>
            </div>
        </div>
    );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
