const { useState, useEffect, useRef } = React;

// Game constants
const INITIAL_HIDE_TIME = 60; // 60 minutes
const RADAR_DISTANCES = [5, 3, 1, 0.5, 0.25];

function HideAndSeekGame() {
  // Game state
  const [gameState, setGameState] = useState('setup');
  const [playerRole, setPlayerRole] = useState(null);
  const [totalPlayers, setTotalPlayers] = useState(4);
  const [gameCode, setGameCode] = useState('');
  
  // Timer state
  const [hideTimeRemaining, setHideTimeRemaining] = useState(INITIAL_HIDE_TIME * 60);
  const [huntingTime, setHuntingTime] = useState(0);
  
  // Location tracking
  const [myLocation, setMyLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  
  // Seeker question pools
  const [questionPools, setQuestionPools] = useState({
    matching: 3,
    measuring: 3,
    radar: 2,
    thermometer: 2,
    photo: 1
  });
  
  // Hider cards
  const [hiderHand, setHiderHand] = useState([]);
  const [timeBonus, setTimeBonus] = useState(0);
  
  // Active question
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [selectedQuestionData, setSelectedQuestionData] = useState({});
  
  // Initialize map
  useEffect(() => {
    if (gameState !== 'setup' && mapRef.current && !mapInstanceRef.current) {
      console.log('Initializing map...');
      mapInstanceRef.current = L.map(mapRef.current).setView([52.9548, -1.1581], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);
      
      console.log('Map initialized');
    }
  }, [gameState]);
  
  // Update marker when location changes
  useEffect(() => {
    if (mapInstanceRef.current && myLocation) {
      console.log('Updating location on map:', myLocation);
      
      if (markerRef.current) {
        markerRef.current.setLatLng([myLocation.lat, myLocation.lng]);
      } else {
        // Custom marker color based on role
        const markerColor = playerRole === 'hider' ? 'red' : 'blue';
        const markerIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>`,
          iconSize: [20, 20]
        });
        
        markerRef.current = L.marker([myLocation.lat, myLocation.lng], { icon: markerIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`You are here<br>Accuracy: ${Math.round(myLocation.accuracy)}m`);
      }
      
      // Center map on user location
      mapInstanceRef.current.setView([myLocation.lat, myLocation.lng], 15);
    }
  }, [myLocation, playerRole]);
  
  // GPS tracking
  useEffect(() => {
    if ('geolocation' in navigator && gameState !== 'setup') {
      console.log('Starting GPS tracking...');
      
      const id = navigator.geolocation.watchPosition(
        (position) => {
          console.log('GPS position received:', position.coords);
          setMyLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
          setLocationError(null);
        },
        (error) => {
          console.error('GPS Error:', error);
          setLocationError(error.message);
        },
        { 
          enableHighAccuracy: true, 
          maximumAge: 1000, 
          timeout: 10000 
        }
      );
      
      return () => {
        console.log('Stopping GPS tracking');
        navigator.geolocation.clearWatch(id);
      };
    } else if (gameState !== 'setup') {
      setLocationError('Geolocation not supported by your browser');
    }
  }, [gameState]);
  
  // Timer management
  useEffect(() => {
    let interval;
    
    if (gameState === 'hiding' && hideTimeRemaining > 0) {
      interval = setInterval(() => {
        setHideTimeRemaining(prev => {
          if (prev <= 1) {
            setGameState('hunting');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (gameState === 'hunting') {
      interval = setInterval(() => {
        setHuntingTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [gameState, hideTimeRemaining]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const startGame = (role) => {
    console.log('Starting game as:', role);
    setPlayerRole(role);
    setGameState('hiding');
    setGameCode(Math.random().toString(36).substring(7).toUpperCase());
  };
  
  const useQuestion = (type) => {
    if (questionPools[type] <= 0) return;
    setActiveQuestion({ type });
    setSelectedQuestionData({});
  };
  
  const submitQuestion = () => {
    console.log('Submitting question:', activeQuestion.type, selectedQuestionData);
    
    setQuestionPools(prev => ({
      ...prev,
      [activeQuestion.type]: prev[activeQuestion.type] - 1
    }));
    
    alert('Question sent to hider! Waiting for response...');
    setActiveQuestion(null);
    
    // Simulate hider drawing a card
    if (playerRole === 'hider') {
      drawHiderCard();
    }
  };
  
  const drawHiderCard = () => {
    if (hiderHand.length >= 6) {
      alert('Hand is full! Discard a card first.');
      return;
    }
    
    const cardTypes = ['veto', 'time5', 'time10', 'time15', 'time20', 'duplicate'];
    const randomCard = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    
    setHiderHand(prev => [...prev, {
      id: Date.now() + Math.random(),
      type: randomCard,
      value: randomCard.startsWith('time') ? parseInt(randomCard.slice(4)) : null
    }]);
    
    console.log('Drew card:', randomCard);
  };
  
  const playHiderCard = (cardId) => {
    alert('Veto played! Question cancelled.');
    setHiderHand(prev => prev.filter(card => card.id !== cardId));
  };
  
  const discardHiderCard = (cardId) => {
    if (confirm('Discard this card?')) {
      setHiderHand(prev => prev.filter(card => card.id !== cardId));
    }
  };
  
  const endGame = () => {
    const timeBonusFromCards = hiderHand
      .filter(card => card.type.startsWith('time'))
      .reduce((sum, card) => sum + card.value, 0);
    
    setTimeBonus(timeBonusFromCards);
    setGameState('finished');
  };
  
  // Setup Screen
  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-6xl font-black mb-2 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              JET LAG
            </h1>
            <p className="text-2xl text-purple-300 font-bold">Nottingham Edition</p>
            <p className="text-sm text-purple-400 mt-2">Hide & Seek Game</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 space-y-6 border-2 border-purple-500/30">
            {/* Quick Instructions */}
            <div className="bg-purple-900/30 rounded-lg p-4 text-sm">
              <p className="font-bold text-purple-300 mb-2">📋 Quick Rules:</p>
              <ul className="space-y-1 text-purple-200">
                <li>• Hider gets 60 mins to hide near a pub</li>
                <li>• Seekers use question cards to track</li>
                <li>• Game ends when hider is spotted</li>
                <li>• Allow GPS when asked!</li>
              </ul>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2 text-purple-300">Number of Players</label>
              <select
                value={totalPlayers}
                onChange={(e) => setTotalPlayers(parseInt(e.target.value))}
                className="w-full bg-slate-700 border-2 border-purple-500/50 rounded-lg px-4 py-3 text-white"
              >
                <option value={4}>4 Players (1 Hider vs 3 Seekers)</option>
                <option value={5}>5 Players (1 Hider vs 2 Teams)</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => startGame('hider')}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105"
              >
                🎯 I'm the HIDER
              </button>
              
              <button
                onClick={() => startGame('seeker')}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105"
              >
                🔍 I'm a SEEKER
              </button>
            </div>
          </div>
          
          <div className="text-center text-purple-300 text-sm">
            <p>🎮 Based on Jet Lag: The Game</p>
            <p className="text-xs mt-1 text-purple-400">For private use only</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Main Game Screen
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-purple-900 to-slate-800 border-b-2 border-purple-500/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-orange-400 to-pink-600 bg-clip-text text-transparent">
              {playerRole === 'hider' ? '🎯 HIDER' : '🔍 SEEKER'}
            </h2>
            <p className="text-sm text-purple-300">Code: {gameCode}</p>
          </div>
          
          <div className="text-right">
            {gameState === 'hiding' && (
              <div className="text-orange-400 font-bold text-lg">
                ⏱️ {formatTime(hideTimeRemaining)}
              </div>
            )}
            {gameState === 'hunting' && (
              <div className="text-green-400 font-bold text-lg">
                🏆 {formatTime(huntingTime)}
              </div>
            )}
          </div>
        </div>
        
        {/* GPS Status */}
        {locationError && (
          <div className="mt-2 text-red-400 text-sm">
            ⚠️ GPS Error: {locationError}
          </div>
        )}
        {myLocation && (
          <div className="mt-2 text-green-400 text-xs">
            ✓ GPS Active (±{Math.round(myLocation.accuracy)}m)
          </div>
        )}
      </div>
      
      {/* Map */}
      <div ref={mapRef} id="map" className="relative"></div>
      
      {/* Controls */}
      <div className="flex-1 overflow-y-auto">
        {/* Seeker Controls */}
        {playerRole === 'seeker' && gameState === 'hunting' && !activeQuestion && (
          <div className="p-4 space-y-3">
            <h3 className="text-lg font-bold text-purple-300 mb-2">🎯 Question Cards</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <QuestionCard
                type="matching"
                count={questionPools.matching}
                onClick={() => useQuestion('matching')}
                emoji="🎯"
                label="MATCHING"
                subtitle="Draw 3, Pick 1"
                color="orange"
              />
              
              <QuestionCard
                type="measuring"
                count={questionPools.measuring}
                onClick={() => useQuestion('measuring')}
                emoji="📏"
                label="MEASURING"
                subtitle="Draw 3, Pick 1"
                color="green"
              />
              
              <QuestionCard
                type="radar"
                count={questionPools.radar}
                onClick={() => useQuestion('radar')}
                emoji="📡"
                label="RADAR"
                subtitle="Draw 2, Pick 1"
                color="orange"
              />
              
              <QuestionCard
                type="thermometer"
                count={questionPools.thermometer}
                onClick={() => useQuestion('thermometer')}
                emoji="🌡️"
                label="THERMOMETER"
                subtitle="Draw 2, Pick 1"
                color="yellow"
              />
              
              <div className="col-span-2">
                <QuestionCard
                  type="photo"
                  count={questionPools.photo}
                  onClick={() => useQuestion('photo')}
                  emoji="📷"
                  label="PHOTO"
                  subtitle="Draw 1"
                  color="blue"
                />
              </div>
            </div>
            
            <button
              onClick={endGame}
              className="w-full mt-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold py-3 rounded-lg"
            >
              🎯 Found the Hider! End Game
            </button>
          </div>
        )}
        
        {/* Question Input Interface */}
        {activeQuestion && playerRole === 'seeker' && (
          <QuestionInput
            activeQuestion={activeQuestion}
            selectedQuestionData={selectedQuestionData}
            setSelectedQuestionData={setSelectedQuestionData}
            onCancel={() => setActiveQuestion(null)}
            onSubmit={submitQuestion}
          />
        )}
        
        {/* Hider Controls */}
        {playerRole === 'hider' && (
          <HiderControls
            hiderHand={hiderHand}
            drawCard={drawHiderCard}
            playCard={playHiderCard}
            discardCard={discardHiderCard}
            gameState={gameState}
            endGame={endGame}
          />
        )}
        
        {/* Finished Screen */}
        {gameState === 'finished' && (
          <FinishedScreen
            playerRole={playerRole}
            huntingTime={huntingTime}
            timeBonus={timeBonus}
          />
        )}
      </div>
    </div>
  );
}

// Question Card Component
function QuestionCard({ count, onClick, emoji, label, subtitle, color }) {
  const colorClasses = {
    orange: 'border-orange-500/50',
    green: 'border-green-500/50',
    yellow: 'border-yellow-500/50',
    blue: 'border-blue-500/50'
  };
  
  const textColors = {
    orange: 'text-orange-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    blue: 'text-blue-400'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={count === 0}
      className={`${count > 0 ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-800 opacity-50'} border-2 ${colorClasses[color]} rounded-xl p-4 transition-all`}
    >
      <div className="text-3xl mb-2">{emoji}</div>
      <div className="text-sm font-bold">{label}</div>
      <div className="text-xs text-purple-400 mt-1">{subtitle}</div>
      <div className={`${textColors[color]} font-bold mt-2`}>{count} left</div>
    </button>
  );
}

// Question Input Component
function QuestionInput({ activeQuestion, selectedQuestionData, setSelectedQuestionData, onCancel, onSubmit }) {
  return (
    <div className="p-4 space-y-4">
      <div className="bg-slate-800 border-2 border-purple-500/50 rounded-xl p-4">
        <h3 className="text-xl font-bold text-purple-300 mb-4">
          {activeQuestion.type.toUpperCase()} Question
        </h3>
        
        {activeQuestion.type === 'radar' && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-purple-300">Select Distance</label>
            <div className="grid grid-cols-3 gap-2">
              {RADAR_DISTANCES.map(dist => (
                <button
                  key={dist}
                  onClick={() => setSelectedQuestionData({ distance: dist })}
                  className={`py-3 px-4 rounded-lg font-bold ${
                    selectedQuestionData.distance === dist
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-700 text-purple-300'
                  }`}
                >
                  {dist} mi
                </button>
              ))}
              <button
                onClick={() => {
                  const custom = prompt('Enter custom distance in miles:');
                  if (custom) setSelectedQuestionData({ distance: parseFloat(custom) });
                }}
                className="py-3 px-4 rounded-lg font-bold bg-slate-700 text-purple-300"
              >
                Custom
              </button>
            </div>
            <p className="text-sm text-purple-400 mt-2">
              Are you within {selectedQuestionData.distance || '?'} miles of me?
            </p>
          </div>
        )}
        
        {activeQuestion.type === 'matching' && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-purple-300">Specify Location/Landmark</label>
            <input
              type="text"
              placeholder="e.g., Nottingham Castle, nearest pub"
              className="w-full bg-slate-700 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
              onChange={(e) => setSelectedQuestionData({ landmark: e.target.value })}
            />
            <p className="text-sm text-purple-400">
              Is your nearest {selectedQuestionData.landmark || '...'} the same as mine?
            </p>
          </div>
        )}
        
        {activeQuestion.type === 'measuring' && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-purple-300">Specify Location/Landmark</label>
            <input
              type="text"
              placeholder="e.g., City Centre, Trent River"
              className="w-full bg-slate-700 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
              onChange={(e) => setSelectedQuestionData({ ...selectedQuestionData, landmark: e.target.value })}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedQuestionData(prev => ({ ...prev, comparison: 'closer' }))}
                className={`flex-1 py-2 rounded-lg font-bold ${
                  selectedQuestionData.comparison === 'closer' ? 'bg-green-500' : 'bg-slate-700'
                }`}
              >
                Closer
              </button>
              <button
                onClick={() => setSelectedQuestionData(prev => ({ ...prev, comparison: 'further' }))}
                className={`flex-1 py-2 rounded-lg font-bold ${
                  selectedQuestionData.comparison === 'further' ? 'bg-red-500' : 'bg-slate-700'
                }`}
              >
                Further
              </button>
            </div>
          </div>
        )}
        
        {activeQuestion.type === 'thermometer' && (
          <div className="space-y-3">
            <p className="text-sm text-purple-400">
              After moving 100m, am I warmer (closer) or colder (further)?
            </p>
          </div>
        )}
        
        {activeQuestion.type === 'photo' && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-purple-300">What should they photograph?</label>
            <input
              type="text"
              placeholder="e.g., tallest building visible"
              className="w-full bg-slate-700 border border-purple-500/50 rounded-lg px-4 py-3 text-white"
              onChange={(e) => setSelectedQuestionData({ requirement: e.target.value })}
            />
          </div>
        )}
        
        <div className="flex gap-2 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-700 text-white font-bold py-3 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-3 rounded-lg"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

// Hider Controls Component
function HiderControls({ hiderHand, drawCard, playCard, discardCard, gameState, endGame }) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-purple-300">🛡️ Your Hand ({hiderHand.length}/6)</h3>
        <button
          onClick={drawCard}
          disabled={hiderHand.length >= 6}
          className="text-sm bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-4 py-2 rounded-lg font-bold"
        >
          + Draw
        </button>
      </div>
      
      {hiderHand.length === 0 && (
        <div className="text-center py-8 text-purple-400">
          <p>No cards yet. Answer seeker questions to draw cards!</p>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-2">
        {hiderHand.map(card => (
          <HiderCard
            key={card.id}
            card={card}
            onPlay={() => playCard(card.id)}
            onDiscard={() => discardCard(card.id)}
          />
        ))}
      </div>
      
      {gameState === 'hunting' && (
        <button
          onClick={endGame}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-lg"
        >
          🏁 I've Been Caught - End Game
        </button>
      )}
    </div>
  );
}

// Hider Card Component
function HiderCard({ card, onPlay, onDiscard }) {
  return (
    <div className="bg-slate-700 border-2 border-purple-500/50 rounded-lg p-3 relative">
      <button
        onClick={onDiscard}
        className="absolute top-1 right-1 text-red-400 text-xl"
      >
        ×
      </button>
      
      {card.type === 'veto' && (
        <>
          <div className="text-3xl text-center mb-1">🛡️</div>
          <div className="text-xs font-bold text-center">VETO</div>
          <button
            onClick={onPlay}
            className="mt-2 w-full bg-red-500 text-white text-xs py-1 rounded font-bold"
          >
            Play
          </button>
        </>
      )}
      
      {card.type.startsWith('time') && (
        <>
          <div className="text-3xl text-center mb-1">⏱️</div>
          <div className="text-xs font-bold text-center">+{card.value}m</div>
          <div className="text-xs text-center text-green-400">Bonus</div>
        </>
      )}
      
      {card.type === 'duplicate' && (
        <>
          <div className="text-3xl text-center mb-1">📋</div>
          <div className="text-xs font-bold text-center">COPY</div>
        </>
      )}
    </div>
  );
}

// Finished Screen Component
function FinishedScreen({ playerRole, huntingTime, timeBonus }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="p-6">
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-8 text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-4xl font-black mb-6">GAME OVER!</h2>
        
        {playerRole === 'hider' && (
          <div className="space-y-3 text-xl bg-black/20 rounded-xl p-6">
            <div className="flex justify-between">
              <span>Hunting Time:</span>
              <span className="font-bold">{formatTime(huntingTime)}</span>
            </div>
            <div className="flex justify-between text-green-300">
              <span>Time Bonus:</span>
              <span className="font-bold">+{timeBonus} mins</span>
            </div>
            <div className="border-t-2 border-white/30 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl">Final Score:</span>
                <span className="text-3xl font-black">
                  {formatTime(huntingTime + (timeBonus * 60))}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-white text-purple-600 font-bold py-3 px-8 rounded-lg"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<HideAndSeekGame />);