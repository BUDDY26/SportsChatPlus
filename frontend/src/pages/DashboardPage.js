import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import StatsPage from './StatsPage';
import TeamsPage from './TeamsPage';
import "./style.css";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, userProfile, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // March Madness state
  const [selectedGame, setSelectedGame] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [activeMenu, setActiveMenu] = useState("games");
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  
  // Global chat state
  const [globalChatMessage, setGlobalChatMessage] = useState("");
  const [globalChatMessages, setGlobalChatMessages] = useState([
    { id: 1, user: "SportsFan123", message: "Welcome to the global chat!", timestamp: "1 hour ago" },
    { id: 2, user: "BasketballExpert", message: "Who do you think will win the championship?", timestamp: "45 minutes ago" },
    { id: 3, user: "MarchMadnessFan", message: "My bracket is already busted!", timestamp: "30 minutes ago" }
  ]);

  // Smart personalization state
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState([]);
  const [userActivity, setUserActivity] = useState({
    gamesViewed: 0,
    messagesPosted: 0,
    favoriteTeams: [],
    lastActive: new Date()
  });

  // Enhanced mock data with smarter structure
  const getMockGames = useCallback((tab) => {
    switch (tab) {
      case "live":
        return [
          { 
            id: 7, 
            team1: "Duke", 
            team2: "Houston", 
            time: "LIVE", 
            score1: 54, 
            score2: 52, 
            quarter: "2nd Half",
            excitement: "high" // Smart classification
          },
          { 
            id: 8, 
            team1: "Purdue", 
            team2: "Oregon", 
            time: "LIVE", 
            score1: 35, 
            score2: 38, 
            quarter: "1st Half",
            excitement: "medium"
          }
        ];
      case "recent":
        return [
          { id: 9, team1: "Kansas", team2: "Florida", time: "Final", score1: 78, score2: 65 },
          { id: 10, team1: "Kentucky", team2: "Washington", time: "Final", score1: 67, score2: 74 },
          { id: 11, team1: "UCLA", team2: "Baylor", time: "Final", score1: 81, score2: 85 }
        ];
      default:
        return [
          { id: 1, team1: "Maryland", team2: "Texas", time: "Mar 26, 7:10 PM", spread: "-3.5", round: "Sweet 16" },
          { id: 2, team1: "Creighton", team2: "Tennessee", time: "Mar 26, 8:20 PM", spread: "-1.5", round: "Sweet 16" },
          { id: 3, team1: "Arizona", team2: "Gonzaga", time: "Mar 27, 6:15 PM", spread: "-2.0", round: "Elite 8" },
          { id: 4, team1: "UConn", team2: "San Diego St", time: "Mar 27, 7:45 PM", spread: "-6.5", round: "Elite 8" },
          { id: 5, team1: "North Carolina", team2: "Alabama", time: "Mar 28, 7:10 PM", spread: "-4.0", round: "Final Four" },
          { id: 6, team1: "Iowa St", team2: "Illinois", time: "Mar 28, 9:40 PM", spread: "-1.0", round: "Final Four" }
        ];
    }
  }, []);

  // Smart game selection with activity tracking
  const handleGameClick = useCallback(async (game) => {
    try {
      setSelectedGame(game);
      
      // Track user activity
      setUserActivity(prev => ({
        ...prev,
        gamesViewed: prev.gamesViewed + 1
      }));
    } catch (err) {
      console.error("Error selecting game:", err);
    }
  }, []);

  // Smart recommendation engine
  const generatePersonalizedRecommendations = useCallback((gamesList) => {
    const recommendations = [];
    
    if (gamesList.length > 0) {
      // Recommend close games
      const closeGames = gamesList.filter(game => 
        game.spread && Math.abs(parseFloat(game.spread)) < 3
      );
      
      if (closeGames.length > 0) {
        recommendations.push({
          type: 'close_game',
          title: '🔥 Close Matchup Alert!',
          description: `${closeGames[0].team1} vs ${closeGames[0].team2} - Spread: ${closeGames[0].spread}`,
          action: () => handleGameClick(closeGames[0])
        });
      }

      // Recommend based on user activity
      if (userActivity.gamesViewed > 5) {
        recommendations.push({
          type: 'power_user',
          title: '⭐ For the Expert Fan',
          description: 'Check out advanced team statistics',
          action: () => setActiveMenu('stats')
        });
      }
    }

    setPersonalizedRecommendations(recommendations);
  }, [userActivity.gamesViewed, handleGameClick]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Smart activity tracking
  useEffect(() => {
    const trackActivity = () => {
      setUserActivity(prev => ({
        ...prev,
        lastActive: new Date()
      }));
    };

    const interval = setInterval(trackActivity, 30000); // Track every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch chat messages for selected game
  const fetchChatMessages = useCallback(async () => {
    if (!selectedGame?.id) return;
    
    try {
      // In a real implementation, this would use Firebase Firestore
      // For now, using mock data with Firebase user info
      setChatMessages([
        { 
          id: 1, 
          user: "BasketballFan22", 
          message: "Can't wait for this game!", 
          timestamp: "2 hours ago",
          isCurrentUser: false
        },
        { 
          id: 2, 
          user: userProfile?.username || user?.displayName || "You", 
          message: "This should be exciting!", 
          timestamp: "1 hour ago",
          isCurrentUser: true
        },
        { 
          id: 3, 
          user: "MarchMadnessFan", 
          message: "What's everyone's prediction?", 
          timestamp: "45 minutes ago",
          isCurrentUser: false
        }
      ]);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    }
  }, [selectedGame, userProfile, user]);

  // Smart games fetching with personalization
  const fetchGames = useCallback(async () => {
    setGamesLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would connect to your sports API
      // For now, using enhanced mock data with smart recommendations
      const mockGames = getMockGames(activeTab);
      
      // Smart filtering based on user preferences
      let filteredGames = mockGames;
      if (userProfile?.preferences?.favoriteTeams?.length > 0) {
        const favoriteGames = mockGames.filter(game => 
          userProfile.preferences.favoriteTeams.some(team => 
            game.team1.toLowerCase().includes(team.toLowerCase()) ||
            game.team2.toLowerCase().includes(team.toLowerCase())
          )
        );
        
        if (favoriteGames.length > 0) {
          // Prioritize favorite team games
          filteredGames = [
            ...favoriteGames,
            ...mockGames.filter(game => !favoriteGames.includes(game))
          ];
        }
      }
      
      setGames(filteredGames);
      setLastRefreshTime(new Date());
      
      // Generate smart recommendations
      generatePersonalizedRecommendations(filteredGames);
    } catch (err) {
      console.error(`Error fetching ${activeTab} games:`, err);
      setError(`Failed to load ${activeTab} games. Please try again.`);
      setGames(getMockGames(activeTab));
    } finally {
      setGamesLoading(false);
    }
  }, [activeTab, userProfile, getMockGames, generatePersonalizedRecommendations]);

  // Fetch games when active tab changes
  useEffect(() => {
    if (!loading && user) {
      fetchGames();
    }
  }, [activeTab, loading, user, fetchGames]);

  // Fetch chat messages when a game is selected
  useEffect(() => {
    if (selectedGame && !loading) {
      fetchChatMessages();
    }
  }, [selectedGame, loading, fetchChatMessages]);

  // Enhanced logout with activity tracking
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Smart message handling with user context
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedGame?.id) return;

    try {
      // In a real implementation, this would use Firebase Firestore
      const newMessage = {
        id: Date.now(),
        user: userProfile?.username || user?.displayName || "You",
        message: chatMessage,
        timestamp: "Just now",
        isCurrentUser: true,
        userId: user.uid
      };
      
      setChatMessages(prev => [...prev, newMessage]);
      setChatMessage("");
      
      // Track user activity
      setUserActivity(prev => ({
        ...prev,
        messagesPosted: prev.messagesPosted + 1
      }));
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    }
  };

  // Enhanced global chat
  const handleSendGlobalMessage = (e) => {
    e.preventDefault();
    if (!globalChatMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      user: userProfile?.username || user?.displayName || "You",
      message: globalChatMessage,
      timestamp: "Just now",
      isCurrentUser: true,
      userId: user.uid
    };
    
    setGlobalChatMessages(prev => [...prev, newMessage]);
    setGlobalChatMessage("");
    
    // Track activity
    setUserActivity(prev => ({
      ...prev,
      messagesPosted: prev.messagesPosted + 1
    }));
  };

  // Enhanced betting with user context
  const handlePlaceBet = async (teamId, amount) => {
    if (!selectedGame?.id) return;
    
    try {
      // In a real implementation, this would use Firebase to store bets
      console.log(`User ${user.uid} placed bet on team ${teamId} for ${amount} coins`);
      
      // Smart feedback
      const teamName = teamId === 1 ? selectedGame.team1 : selectedGame.team2;
      setError(""); // Clear any previous errors
      
      // Show success message (you might want to add a success state)
      alert(`Bet placed successfully on ${teamName}! Good luck! 🍀`);
    } catch (err) {
      console.error("Error placing bet:", err);
      setError("Failed to place bet. Please try again.");
    }
  };

  const handleManualRefresh = () => {
    fetchGames();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="dashboard-page">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          flexDirection: 'column'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏀</div>
          <h2 style={{ color: '#1a73e8' }}>Loading Dashboard...</h2>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #1a73e8',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '20px auto'
          }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          top: '20px',
          right: '80px',
          background: 'rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          fontSize: '20px',
          zIndex: 1000,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease'
        }}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      {/* Enhanced Header with Smart User Info */}
      <header className="dashboard-header">
        <div className="logo-container">
          <h1 style={{
            background: 'linear-gradient(45deg, #007bff, #1a73e8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🏀 SportsChat+
          </h1>
        </div>
        <div className="user-controls">
          <div style={{ textAlign: 'right' }}>
            <span className="username">
              Welcome, {userProfile?.username || user?.displayName || "Fan"}! 
            </span>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              {userActivity.gamesViewed > 0 && (
                <span>Games viewed: {userActivity.gamesViewed} | </span>
              )}
              {userActivity.messagesPosted > 0 && (
                <span>Messages: {userActivity.messagesPosted}</span>
              )}
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Log Out
          </button>
        </div>
      </header>

      {/* Smart Recommendations Bar */}
      {personalizedRecommendations.length > 0 && (
        <div style={{
          background: 'linear-gradient(45deg, rgba(26, 115, 232, 0.1), rgba(0, 123, 255, 0.1))',
          border: '1px solid rgba(26, 115, 232, 0.2)',
          borderRadius: '8px',
          padding: '15px',
          margin: '0 auto 20px',
          maxWidth: '1200px',
          width: '100%'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1a73e8' }}>✨ Personalized for You</h4>
          {personalizedRecommendations.slice(0, 2).map((rec, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.7)',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }} onClick={rec.action}>
              <strong>{rec.title}</strong>
              <div style={{ fontSize: '14px', color: '#666' }}>{rec.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="march-madness-container">
          {/* Sidebar Navigation */}
          <div className="sidebar">
            <div className="menu-items">
              <div 
                className={`menu-item ${activeMenu === "games" ? "active" : ""}`}
                onClick={() => setActiveMenu("games")}
              >
                <i className="icon game-icon"></i>
                <span>Live Games</span>
                {userActivity.gamesViewed > 0 && (
                  <span style={{ 
                    marginLeft: 'auto', 
                    fontSize: '12px', 
                    background: '#e63946', 
                    color: 'white', 
                    borderRadius: '10px', 
                    padding: '2px 6px' 
                  }}>
                    {userActivity.gamesViewed}
                  </span>
                )}
              </div>
              <div 
                className={`menu-item ${activeMenu === "teams" ? "active" : ""}`}
                onClick={() => setActiveMenu("teams")}
              >
                <i className="icon team-icon"></i>
                <span>Teams</span>
              </div>
              <div 
                className={`menu-item ${activeMenu === "bracket" ? "active" : ""}`}
                onClick={() => setActiveMenu("bracket")}
              >
                <i className="icon bracket-icon"></i>
                <span>Bracket</span>
              </div>
              <div 
                className={`menu-item ${activeMenu === "bets" ? "active" : ""}`}
                onClick={() => setActiveMenu("bets")}
              >
                <i className="icon coin-icon"></i>
                <span>My Bets</span>
              </div>
              <div 
                className={`menu-item ${activeMenu === "chat" ? "active" : ""}`}
                onClick={() => setActiveMenu("chat")}
              >
                <i className="icon chat-icon"></i>
                <span>Global Chat</span>
                {userActivity.messagesPosted > 0 && (
                  <span style={{ 
                    marginLeft: 'auto', 
                    fontSize: '12px', 
                    background: '#28a745', 
                    color: 'white', 
                    borderRadius: '10px', 
                    padding: '2px 6px' 
                  }}>
                    {userActivity.messagesPosted}
                  </span>
                )}
              </div>
              <div 
                className={`menu-item ${activeMenu === "stats" ? "active" : ""}`}
                onClick={() => setActiveMenu("stats")}
              >
                <i className="icon stats-icon"></i>
                <span>Stats</span>
              </div>
            </div>
          </div>

          {/* Main Content Area - Games View */}
          {activeMenu === "games" && (
            <div className="main-content">
              {/* Tab Navigation */}
              <div className="tabs">
                <div
                  className={`tab ${activeTab === "upcoming" ? "active" : ""}`}
                  onClick={() => setActiveTab("upcoming")}
                >
                  Upcoming
                </div>
                <div
                  className={`tab ${activeTab === "live" ? "active" : ""}`}
                  onClick={() => setActiveTab("live")}
                >
                  Live
                </div>
                <div
                  className={`tab ${activeTab === "recent" ? "active" : ""}`}
                  onClick={() => setActiveTab("recent")}
                >
                  Recent
                </div>
                <button 
                  className="refresh-button" 
                  onClick={handleManualRefresh}
                  disabled={gamesLoading}
                >
                  {gamesLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {/* Last refresh time */}
              {lastRefreshTime && (
                <div className="last-updated">
                  Last updated: {lastRefreshTime.toLocaleTimeString()}
                </div>
              )}

              {/* Games List */}
              <div className="games-list">
                {gamesLoading ? (
                  <div className="loading-message">Loading games...</div>
                ) : error ? (
                  <div className="error-message">{error}</div>
                ) : (
                  <>
                    <div className="header-row">
                      <div className="match-up">Match Up</div>
                      <div className="time">Time</div>
                      <div className="spread">
                        {activeTab === "upcoming" ? "Round" : "Score"}
                      </div>
                    </div>
                    {games.length === 0 ? (
                      <div className="no-games-message">
                        No {activeTab} games available
                      </div>
                    ) : (
                      games.map((game) => (
                        <div
                          key={game.id}
                          className={`game-row ${selectedGame?.id === game.id ? "selected" : ""}`}
                          onClick={() => handleGameClick(game)}
                        >
                          <div className="match-up">
                            {game.team1} vs {game.team2}
                            {game.excitement === 'high' && (
                              <span style={{ marginLeft: '8px', fontSize: '12px' }}>🔥</span>
                            )}
                          </div>
                          <div className="time">
                            {game.time === "LIVE" ? (
                              <span className="live-indicator">LIVE</span>
                            ) : (
                              game.time
                            )}
                          </div>
                          <div className="spread">
                            {activeTab === "upcoming" ? (
                              game.round
                            ) : (
                              <span className="score">
                                {game.score1} - {game.score2}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Teams View */}
          {activeMenu === "teams" && (
            <div className="main-content">
              <TeamsPage />
            </div>
          )}
          
          {/* Bracket View */}
          {activeMenu === "bracket" && (
            <div className="main-content placeholder-content">
              <h2>🏆 Tournament Bracket</h2>
              <p>Interactive bracket view coming soon!</p>
              {userProfile?.preferences?.favoriteTeams?.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Your Favorite Teams:</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {userProfile.preferences.favoriteTeams.map((team, index) => (
                      <span key={index} style={{
                        background: '#1a73e8',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {team}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* My Bets View */}
          {activeMenu === "bets" && (
            <div className="main-content placeholder-content">
              <h2>💰 My Bets</h2>
              <p>Your betting history and active bets will be displayed here.</p>
              <div style={{ marginTop: '20px' }}>
                <h4>Quick Stats:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginTop: '10px' }}>
                  <div style={{ background: 'rgba(40, 167, 69, 0.1)', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>0</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Active Bets</div>
                  </div>
                  <div style={{ background: 'rgba(26, 115, 232, 0.1)', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a73e8' }}>1000</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Coins Available</div>
                  </div>
                  <div style={{ background: 'rgba(255, 193, 7, 0.1)', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>0</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Total Winnings</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Enhanced Global Chat View */}
          {activeMenu === "chat" && (
            <div className="main-content global-chat-container">
              <div className="global-chat-header">
                <h2>💬 Global Chat</h2>
                <p>Chat with other March Madness fans • {globalChatMessages.length} messages</p>
                {userActivity.messagesPosted > 0 && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    You've posted {userActivity.messagesPosted} message{userActivity.messagesPosted !== 1 ? 's' : ''} today
                  </div>
                )}
              </div>
              <div className="global-chat-messages">
                {globalChatMessages.length === 0 ? (
                  <div className="empty-chat">
                    No messages yet. Be the first to start the conversation! 🏀
                  </div>
                ) : (
                  globalChatMessages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.isCurrentUser ? 'current-user' : ''}`}>
                      <div className="message-header">
                        <span className={`message-user ${msg.isCurrentUser ? 'current-user-name' : ''}`}>
                          {msg.isCurrentUser ? 'You' : msg.user}
                          {msg.isCurrentUser && ' 👤'}
                        </span>
                        <span className="message-time">{msg.timestamp}</span>
                      </div>
                      <div className="message-content" style={{
                        background: msg.isCurrentUser ? 'rgba(26, 115, 232, 0.1)' : 'transparent',
                        padding: msg.isCurrentUser ? '8px' : '5px',
                        borderRadius: msg.isCurrentUser ? '4px' : '0',
                        marginTop: '5px'
                      }}>
                        {msg.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form className="chat-input" onSubmit={handleSendGlobalMessage}>
                <input
                  type="text"
                  placeholder={`What's on your mind, ${userProfile?.username || 'fan'}?`}
                  value={globalChatMessage}
                  onChange={(e) => setGlobalChatMessage(e.target.value)}
                />
                <button type="submit" disabled={!globalChatMessage.trim()}>
                  Send
                </button>
              </form>
            </div>
          )}
          
          {/* Enhanced Stats View */}
          {activeMenu === "stats" && (
            <div className="main-content">
              <StatsPage activeMenu={activeMenu} />
            </div>
          )}

          {/* Enhanced Game Detail Panel */}
          {selectedGame && activeMenu === "games" && (
            <div className="game-detail">
              <div className="game-header">
                <h2>
                  {selectedGame.team1} vs {selectedGame.team2}
                </h2>
                {selectedGame.time === "LIVE" && (
                  <span className="live-badge">LIVE</span>
                )}
                {selectedGame.excitement === 'high' && (
                  <span style={{ 
                    background: '#e63946', 
                    color: 'white', 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    marginLeft: '10px'
                  }}>
                    🔥 HOT
                  </span>
                )}
              </div>

              {/* Enhanced Game Info */}
              <div className="game-info">
                <div className="info-item">
                  <label>Round:</label>
                  <span>{selectedGame.round || "TBD"}</span>
                </div>
                
                <div className="info-item">
                  <label>Location:</label>
                  <span>{selectedGame.location || "TBD"}</span>
                </div>
                
                <div className="info-item">
                  <label>Date & Time:</label>
                  <span>
                    {selectedGame.time === "LIVE" ? "In Progress" : 
                     selectedGame.time === "Final" ? "Completed" : 
                     selectedGame.time}
                  </span>
                </div>

                {/* Smart insights */}
                {selectedGame.spread && (
                  <div className="info-item" style={{ 
                    background: 'rgba(26, 115, 232, 0.1)', 
                    padding: '8px', 
                    borderRadius: '4px', 
                    marginTop: '10px' 
                  }}>
                    <label>💡 Smart Insight:</label>
                    <span style={{ fontSize: '12px' }}>
                      {Math.abs(parseFloat(selectedGame.spread)) < 3 
                        ? "This is expected to be a very close game!" 
                        : "One team is heavily favored to win."}
                    </span>
                  </div>
                )}
              </div>

              {/* Score Display (for LIVE or completed games) */}
              {(selectedGame.time === "LIVE" || selectedGame.time === "Final") && (
                <div className="score-display">
                  <div className="team-score">
                    <div className="team">{selectedGame.team1}</div>
                    <div className="score">{selectedGame.score1}</div>
                  </div>
                  <div className="versus">VS</div>
                  <div className="team-score">
                    <div className="team">{selectedGame.team2}</div>
                    <div className="score">{selectedGame.score2}</div>
                  </div>
                  {selectedGame.time === "LIVE" && (
                    <div className="period">{selectedGame.quarter || "In Progress"}</div>
                  )}
                </div>
              )}

              {/* Enhanced Betting Section */}
              {selectedGame.time !== "LIVE" && selectedGame.time !== "Final" && (
                <div className="betting-section">
                  <h3>🎲 Place a Bet</h3>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                    You have 1000 coins available
                  </div>
                  <div className="betting-buttons">
                    <button 
                      className="bet-button"
                      onClick={() => handlePlaceBet(1, 100)}
                      style={{ position: 'relative' }}
                    >
                      Bet on {selectedGame.team1}
                      {selectedGame.spread && (
                        <div style={{ fontSize: '11px', opacity: 0.8 }}>
                          Spread: {selectedGame.spread}
                        </div>
                      )}
                    </button>
                    <button 
                      className="bet-button"
                      onClick={() => handlePlaceBet(2, 100)}
                      style={{ position: 'relative' }}
                    >
                      Bet on {selectedGame.team2}
                      {selectedGame.spread && (
                        <div style={{ fontSize: '11px', opacity: 0.8 }}>
                          Spread: {parseFloat(selectedGame.spread) > 0 ? '+' : ''}{(-parseFloat(selectedGame.spread)).toFixed(1)}
                        </div>
                      )}
                    </button>
                  </div>
                  <p className="bet-note">Standard bet is 100 coins • Higher risk, higher reward!</p>
                </div>
              )}

              {/* Enhanced Chat Section */}
              <div className="chat-section">
                <h3>💬 Game Chat</h3>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                  Chat with other fans watching this game
                </div>
                <div className="chat-messages">
                  {chatMessages.length === 0 ? (
                    <div className="empty-chat">
                      No messages yet. Be the first to chat about this game! 🏀
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => (
                      <div key={index} className={`chat-message ${msg.isCurrentUser ? 'current-user' : ''}`}>
                        <div className="message-header">
                          <span className={`message-user ${msg.isCurrentUser ? 'current-user-name' : ''}`}>
                            {msg.isCurrentUser ? 'You' : msg.user}
                            {msg.isCurrentUser && ' 👤'}
                          </span>
                          <span className="message-time">{msg.timestamp}</span>
                        </div>
                        <div className="message-content" style={{
                          background: msg.isCurrentUser ? 'rgba(26, 115, 232, 0.1)' : 'transparent',
                          padding: msg.isCurrentUser ? '8px' : '5px',
                          borderRadius: msg.isCurrentUser ? '4px' : '0',
                          marginTop: '5px'
                        }}>
                          {msg.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <form className="chat-input" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    placeholder={`Share your thoughts on ${selectedGame.team1} vs ${selectedGame.team2}...`}
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                  />
                  <button type="submit" disabled={!chatMessage.trim()}>
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="dashboard-footer">
        <div className="disclaimer">
          <p>
            SportsChatPlus.com is not affiliated with the National Collegiate
            Athletic Association (NCAA®) or March Madness Athletic Association,
            neither of which has supplied, reviewed, approved, or endorsed the
            material on this site. SportsChatPlus.com is solely responsible for
            this site but makes no guarantee about the accuracy or completeness
            of the information herein.
          </p>
          <div className="footer-links">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <span style={{ color: '#666', fontSize: '12px', marginLeft: '15px' }}>
              Last active: {userActivity.lastActive.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .current-user-name {
          color: #1a73e8 !important;
          font-weight: bold;
        }
        
        .chat-message.current-user {
          border-left: 3px solid #1a73e8;
          padding-left: 8px;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;