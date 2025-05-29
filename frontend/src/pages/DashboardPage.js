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

  // SportsChatPlus Enhanced Analytics Features
  const [scPlusInsights, setScPlusInsights] = useState([]);
  //const [expertPredictions, setExpertPredictions] = useState([]);
  const [smartChatSuggestions, setSmartChatSuggestions] = useState([]);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState([]);
  const [userActivity, setUserActivity] = useState({
    gamesViewed: 0,
    messagesPosted: 0,
    favoriteTeams: [],
    lastActive: new Date(),
    chatStyle: 'casual' // SportsChatPlus learns user's chat style
  });

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Enhanced mock data with SportsChatPlus Expert Analysis
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
            excitement: "high",
            scPlusAnalysis: { 
              favorite: "Duke", 
              confidence: 73, 
              insight: "Strong offensive momentum in 2nd half" 
            }
          },
          { 
            id: 8, 
            team1: "Purdue", 
            team2: "Oregon", 
            time: "LIVE", 
            score1: 35, 
            score2: 38, 
            quarter: "1st Half",
            excitement: "medium",
            scPlusAnalysis: { 
              favorite: "Oregon", 
              confidence: 61, 
              insight: "Superior field goal percentage this game" 
            }
          }
        ];
      case "recent":
        return [
          { id: 9, team1: "Kansas", team2: "Florida", time: "Final", score1: 78, score2: 65, scPlusResult: "✅ Expert pick was correct" },
          { id: 10, team1: "Kentucky", team2: "Washington", time: "Final", score1: 67, score2: 74, scPlusResult: "⚡ Upset special!" },
          { id: 11, team1: "UCLA", team2: "Baylor", time: "Final", score1: 81, score2: 85, scPlusResult: "✅ Called it perfectly" }
        ];
      default:
        return [
          { 
            id: 1, 
            team1: "Maryland", 
            team2: "Texas", 
            time: "Mar 26, 7:10 PM", 
            spread: "-3.5", 
            round: "Sweet 16",
            scPlusAnalysis: { 
              favorite: "Maryland", 
              confidence: 68, 
              insight: "Home court advantage + recent strong form" 
            }
          },
          { 
            id: 2, 
            team1: "Creighton", 
            team2: "Tennessee", 
            time: "Mar 26, 8:20 PM", 
            spread: "-1.5", 
            round: "Sweet 16",
            scPlusAnalysis: { 
              favorite: "Tennessee", 
              confidence: 54, 
              insight: "Marginally better defensive statistics" 
            }
          },
          { 
            id: 3, 
            team1: "Arizona", 
            team2: "Gonzaga", 
            time: "Mar 27, 6:15 PM", 
            spread: "-2.0", 
            round: "Elite 8",
            scPlusAnalysis: { 
              favorite: "Gonzaga", 
              confidence: 71, 
              insight: "Elite three-point shooting gives them the edge" 
            }
          },
          { 
            id: 4, 
            team1: "UConn", 
            team2: "San Diego St", 
            time: "Mar 27, 7:45 PM", 
            spread: "-6.5", 
            round: "Elite 8",
            scPlusAnalysis: { 
              favorite: "UConn", 
              confidence: 77, 
              insight: "Tournament experience is a major factor" 
            }
          },
          { 
            id: 5, 
            team1: "North Carolina", 
            team2: "Alabama", 
            time: "Mar 28, 7:10 PM", 
            spread: "-4.0", 
            round: "Final Four",
            scPlusAnalysis: { 
              favorite: "North Carolina", 
              confidence: 63, 
              insight: "March Madness tradition favors Tar Heels" 
            }
          },
          { 
            id: 6, 
            team1: "Iowa St", 
            team2: "Illinois", 
            time: "Mar 28, 9:40 PM", 
            spread: "-1.0", 
            round: "Final Four",
            scPlusAnalysis: { 
              favorite: "Iowa St", 
              confidence: 52, 
              insight: "Coin flip game - could go either way" 
            }
          }
        ];
    }
  }, []);

  // SportsChatPlus Expert Insights generator
  const generateScPlusInsights = useCallback((gamesList) => {
    const insights = [];
    
    if (gamesList.length > 0) {
      // High-confidence expert picks
      const highConfidencePicks = gamesList.filter(game => 
        game.scPlusAnalysis && game.scPlusAnalysis.confidence > 70
      );
      
      if (highConfidencePicks.length > 0) {
        insights.push({
          type: 'expert_pick',
          title: '⭐ SportsChatPlus Expert Pick',
          description: `${highConfidencePicks[0].scPlusAnalysis.favorite} over ${highConfidencePicks[0].team1 === highConfidencePicks[0].scPlusAnalysis.favorite ? highConfidencePicks[0].team2 : highConfidencePicks[0].team1} - ${highConfidencePicks[0].scPlusAnalysis.confidence}% confidence`,
          reasoning: highConfidencePicks[0].scPlusAnalysis.insight,
          confidence: highConfidencePicks[0].scPlusAnalysis.confidence
        });
      }

      // Upset Watch
      const upsetCandidates = gamesList.filter(game => 
        game.spread && Math.abs(parseFloat(game.spread)) > 5
      );
      
      if (upsetCandidates.length > 0) {
        insights.push({
          type: 'upset_watch',
          title: '🚨 SportsChatPlus Upset Watch',
          description: `${upsetCandidates[0].team1} vs ${upsetCandidates[0].team2} - Large spread creates upset opportunity`,
          reasoning: "Our data shows games with 5+ point spreads have 23% upset rate"
        });
      }

      // Analytics Insight
      insights.push({
        type: 'analytics',
        title: '📊 Advanced Analytics',
        description: 'Teams with elite defensive ratings are outperforming expectations by 15% this tournament',
        reasoning: 'SportsChatPlus analysis of current tournament trends'
      });
    }
    
    setScPlusInsights(insights);
  }, []);

  // Smart Chat Suggestions based on user's style and context
  const generateSmartChatSuggestions = useCallback((gameContext, userStyle = 'casual') => {
    //const suggestions = [];
    
    if (gameContext) {
      const styleVariations = {
        casual: [
          `Who's backing ${gameContext.team1} tonight? 🏀`,
          `This matchup is fire! Anyone else hyped? 🔥`,
          `${gameContext.team2} might surprise some people!`
        ],
        analytical: [
          `${gameContext.team1}'s shooting stats give them a statistical edge`,
          `Fascinating defensive matchup between these programs`,
          `The spread reflects recent performance analytics accurately`
        ],
        enthusiastic: [
          `${gameContext.team1} IS GOING ALL THE WAY! 🏆`,
          `MARCH MADNESS MAGIC HAPPENING RIGHT HERE! ⚡`,
          `UPSET ALERT - ${gameContext.team2} IS DANGEROUS! 🚨`
        ]
      };
      
      setSmartChatSuggestions(styleVariations[userStyle] || styleVariations.casual);
    }
  }, []);

  // Smart game selection with activity tracking
  const handleGameClick = useCallback(async (game) => {
    try {
      setSelectedGame(game);
      
      // Generate smart chat suggestions for this game
      generateSmartChatSuggestions(game, userActivity.chatStyle);
      
      // Track user activity and learn preferences
      setUserActivity(prev => ({
        ...prev,
        gamesViewed: prev.gamesViewed + 1,
        // Learn from game selections
        favoriteTeams: [...new Set([...prev.favoriteTeams, game.team1, game.team2].slice(0, 5))]
      }));
    } catch (err) {
      console.error("Error selecting game:", err);
    }
  }, [userActivity.chatStyle, generateSmartChatSuggestions]);

  // Smart personalization engine (your original function enhanced)
  const generatePersonalizedRecommendations = useCallback((gamesList) => {
    const recommendations = [];
    
    if (gamesList.length > 0) {
      // Close games recommendation
      const closeGames = gamesList.filter(game => 
        game.spread && Math.abs(parseFloat(game.spread)) < 3
      );
      
      if (closeGames.length > 0) {
        recommendations.push({
          type: 'close_game',
          title: '🔥 Nail-Biter Alert!',
          description: `${closeGames[0].team1} vs ${closeGames[0].team2} - Spread: ${closeGames[0].spread}`,
          action: () => handleGameClick(closeGames[0])
        });
      }

      // Power user recommendations
      if (userActivity.gamesViewed > 5) {
        recommendations.push({
          type: 'power_user',
          title: '📈 Advanced Stats Ready',
          description: 'Check out detailed team analytics',
          action: () => setActiveMenu('stats')
        });
      }

      // Personalized pick based on viewing history
      if (userActivity.gamesViewed > 3) {
        recommendations.push({
          type: 'personalized_pick',
          title: '🎯 Picked Just for You',
          description: `Based on your viewing history: ${gamesList[0].team1} vs ${gamesList[0].team2}`,
          reasoning: 'Matches your preference for competitive games',
          action: () => handleGameClick(gamesList[0])
        });
      }

      // Smart betting opportunity
      const goodBets = gamesList.filter(game => 
        game.scPlusAnalysis && game.scPlusAnalysis.confidence > 65 && game.scPlusAnalysis.confidence < 80
      );
      
      if (goodBets.length > 0) {
        recommendations.push({
          type: 'smart_betting',
          title: '💡 Smart Bet Opportunity',
          description: `${goodBets[0].scPlusAnalysis.favorite} has optimal risk/reward`,
          reasoning: `${goodBets[0].scPlusAnalysis.confidence}% confidence with good payout potential`,
          action: () => handleGameClick(goodBets[0])
        });
      }

      // Social engagement boost
      if (userActivity.messagesPosted < 3) {
        recommendations.push({
          type: 'social_boost',
          title: '💬 Join the Conversation',
          description: 'Fans with similar interests are chatting now!',
          reasoning: 'Active chatters enjoy games 40% more',
          action: () => setActiveMenu('chat')
        });
      }
    }
    
    setPersonalizedRecommendations(recommendations);
  }, [userActivity, handleGameClick]);

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
      
      // Generate SportsChatPlus insights and recommendations
      generateScPlusInsights(filteredGames);
      generatePersonalizedRecommendations(filteredGames);
    } catch (err) {
      console.error(`Error fetching ${activeTab} games:`, err);
      setError(`Failed to load ${activeTab} games. Please try again.`);
      setGames(getMockGames(activeTab));
    } finally {
      setGamesLoading(false);
    }
  }, [activeTab, userProfile, getMockGames, generateScPlusInsights, generatePersonalizedRecommendations,]);

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

  // Smart message style detection
  const analyzeMessageStyle = useCallback((message) => {
    const exclamationCount = (message.match(/!/g) || []).length;
    const capsCount = (message.match(/[A-Z]/g) || []).length;
    const analyticalWords = ['percentage', 'statistics', 'analysis', 'data', 'performance', 'stats'];
    
    if (exclamationCount > 2 || capsCount > message.length * 0.3) {
      return 'enthusiastic';
    } else if (analyticalWords.some(word => message.toLowerCase().includes(word))) {
      return 'analytical';
    } else {
      return 'casual';
    }
  }, []);

  // Smart message handling with user context
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedGame?.id) return;

    try {
      // Learn from user's chat style
      const detectedStyle = analyzeMessageStyle(chatMessage);
      setUserActivity(prev => ({
        ...prev,
        chatStyle: detectedStyle,
        messagesPosted: prev.messagesPosted + 1
      }));

      const newMessage = {
        id: Date.now(),
        user: userProfile?.username || user?.displayName || "You",
        message: chatMessage,
        timestamp: "Just now",
        isCurrentUser: true,
        userId: user.uid,
        scPlusEnhanced: true // Mark SportsChatPlus enhanced messages
      };
      
      setChatMessages(prev => [...prev, newMessage]);
      setChatMessage("");
      
      // Generate new suggestions based on message and detected style
      setTimeout(() => {
        generateSmartChatSuggestions(selectedGame, detectedStyle);
      }, 1000);
      
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    }
  };

  // Enhanced global chat
  const handleSendGlobalMessage = (e) => {
    e.preventDefault();
    if (!globalChatMessage.trim()) return;

    // Analyze message style
    const detectedStyle = analyzeMessageStyle(globalChatMessage);
    
    const newMessage = {
      id: Date.now(),
      user: userProfile?.username || user?.displayName || "You",
      message: globalChatMessage,
      timestamp: "Just now",
      isCurrentUser: true,
      userId: user.uid,
      scPlusEnhanced: true
    };
    
    setGlobalChatMessages(prev => [...prev, newMessage]);
    setGlobalChatMessage("");
    
    setUserActivity(prev => ({
      ...prev,
      messagesPosted: prev.messagesPosted + 1,
      chatStyle: detectedStyle
    }));
  };

  // ✅ FIXED: Renamed from useSmartSuggestion to applySuggestion
  const applySuggestion = (suggestion) => {
    if (activeMenu === 'chat') {
      setGlobalChatMessage(suggestion);
    } else {
      setChatMessage(suggestion);
    }
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
      <div className="dashboard-page loading-state" data-theme={theme}>
        <div className="loading-box">
          <div className="loading-spinner"></div>
          <h2>Loading SportsChatPlus Dashboard...</h2>
          <p>Preparing your personalized experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page" data-theme={theme}>
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      {/* Enhanced Header with Smart User Info */}
      <header className="dashboard-header">
        <div className="logo-container">
          <h1 style={{
            background: 'linear-gradient(45deg, var(--accent-primary), var(--accent-secondary))',
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
                <span>Messages: {userActivity.messagesPosted} | </span>
              )}
              <span>Style: {userActivity.chatStyle}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Log Out
          </button>
        </div>
      </header>

      {/* SportsChatPlus Expert Insights Bar */}
      {scPlusInsights.length > 0 && (
        <div className="recommendations-panel">
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--accent-primary)' }}>
            ⭐ SportsChatPlus Expert Insights
          </h4>
          {scPlusInsights.slice(0, 2).map((insight, index) => (
            <div key={index} className="recommendation-item" onClick={insight.action}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <strong>{insight.title}</strong>
                {insight.confidence && (
                  <span style={{
                    marginLeft: '10px',
                    background: insight.confidence > 70 ? '#28a745' : '#ffc107',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '12px',
                    fontSize: '11px'
                  }}>
                    {insight.confidence}%
                  </span>
                )}
              </div>
              <div style={{ fontSize: '14px', marginBottom: '3px' }}>{insight.description}</div>
              {insight.reasoning && (
                <div style={{ fontSize: '12px', fontStyle: 'italic', opacity: 0.8 }}>
                  💡 {insight.reasoning}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Smart Recommendations (your original enhanced) */}
      {personalizedRecommendations.length > 0 && (
        <div className="recommendations-panel">
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--accent-secondary)' }}>✨ Personalized for You</h4>
          {personalizedRecommendations.slice(0, 2).map((rec, index) => (
            <div key={index} className="recommendation-item" onClick={rec.action}>
              <strong>{rec.title}</strong>
              <div style={{ fontSize: '14px', marginTop: '5px' }}>{rec.description}</div>
              {rec.reasoning && (
                <div style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '3px', opacity: 0.8 }}>
                  {rec.reasoning}
                </div>
              )}
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
                <span>Expert Games</span>
                {userActivity.gamesViewed > 0 && (
                  <span className="activity-badge">
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
                <span>Smart Bracket</span>
              </div>
              <div 
                className={`menu-item ${activeMenu === "bets" ? "active" : ""}`}
                onClick={() => setActiveMenu("bets")}
              >
                <i className="icon coin-icon"></i>
                <span>Smart Bets</span>
              </div>
              <div 
                className={`menu-item ${activeMenu === "chat" ? "active" : ""}`}
                onClick={() => setActiveMenu("chat")}
              >
                <i className="icon chat-icon"></i>
                <span>Smart Chat</span>
                {userActivity.messagesPosted > 0 && (
                  <span className="activity-badge success">
                    {userActivity.messagesPosted}
                  </span>
                )}
              </div>
              <div 
                className={`menu-item ${activeMenu === "stats" ? "active" : ""}`}
                onClick={() => setActiveMenu("stats")}
              >
                <i className="icon stats-icon"></i>
                <span>Analytics</span>
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
                  <div className="loading-message">Loading personalized games...</div>
                ) : error ? (
                  <div className="error-message">{error}</div>
                ) : (
                  <>
                    <div className="header-row">
                      <div className="match-up">Match Up</div>
                      <div className="time">Time</div>
                      <div className="spread">SC+ Analysis</div>
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
                              <span className="excitement-indicator">🔥</span>
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
                            {game.scPlusAnalysis ? (
                              <div style={{ fontSize: '12px' }}>
                                <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                                  ⭐ {game.scPlusAnalysis.favorite}
                                </div>
                                <div style={{ color: 'var(--text-tertiary)' }}>
                                  {game.scPlusAnalysis.confidence}%
                                </div>
                              </div>
                            ) : game.scPlusResult ? (
                              <span style={{ fontSize: '12px' }}>{game.scPlusResult}</span>
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
          
          {/* Smart Bracket View */}
          {activeMenu === "bracket" && (
            <div className="main-content placeholder-content">
              <h2>🏆 SportsChatPlus Smart Bracket</h2>
              <p>Advanced analytics and expert insights for tournament predictions.</p>
              
              <div style={{
                background: 'var(--bg-tertiary)',
                padding: '20px',
                borderRadius: '8px',
                marginTop: '20px',
                border: '1px solid var(--border-color)'
              }}>
                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '15px' }}>📊 Expert Bracket Analysis</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>78%</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>SC+ Accuracy Rate</div>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>Duke</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Championship Favorite</div>
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>4</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Predicted Upsets</div>
                  </div>
                </div>
                
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>⭐ Expert Predictions:</h4>
                  <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    <li>Duke vs Houston: Duke advances (73% confidence)</li>
                    <li>Purdue vs Arizona: Arizona upset special (58% confidence)</li>
                    <li>UConn vs Tennessee: UConn dominant win (81% confidence)</li>
                  </ul>
                </div>
              </div>

              {userProfile?.preferences?.favoriteTeams?.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Your Favorite Teams:</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {userProfile.preferences.favoriteTeams.map((team, index) => (
                      <span key={index} style={{
                        background: 'var(--accent-primary)',
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
          
          {/* Smart Bets View */}
          {activeMenu === "bets" && (
            <div className="main-content placeholder-content">
              <h2>💰 SportsChatPlus Smart Betting</h2>
              <p>Expert analysis and data-driven betting recommendations.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>+18%</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Expert ROI</div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>1,250</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Available Coins</div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>High</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Confidence Today</div>
                </div>
              </div>

              {/* Expert Betting Recommendations */}
              <div style={{
                background: 'var(--bg-tertiary)',
                padding: '20px',
                borderRadius: '8px',
                marginTop: '20px',
                border: '2px solid var(--accent-primary)'
              }}>
                <h3 style={{ color: 'var(--accent-primary)', marginBottom: '15px' }}>⭐ Expert Betting Picks</h3>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{
                    background: 'var(--bg-secondary)',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #28a745'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Duke vs Houston</strong>
                      <span style={{ background: '#28a745', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                        ✅ Expert Pick
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      Recommendation: Duke with 73% confidence
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '5px' }}>
                      Expected return: +180 coins
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Enhanced Smart Chat View */}
          {activeMenu === "chat" && (
            <div className="main-content global-chat-container">
              <div className="global-chat-header">
                <h2>💬 SportsChatPlus Smart Chat</h2>
                <p>Enhanced chat with personalized suggestions • {globalChatMessages.length} messages • Style: {userActivity.chatStyle}</p>
                {userActivity.messagesPosted > 0 && (
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '5px' }}>
                    You've posted {userActivity.messagesPosted} message{userActivity.messagesPosted !== 1 ? 's' : ''} today
                  </div>
                )}
              </div>

              {/* Smart Chat Suggestions */}
              {smartChatSuggestions.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ fontSize: '14px', margin: '0 0 10px 0', color: 'var(--text-secondary)' }}>
                    💡 Smart suggestions for you:
                  </h4>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {smartChatSuggestions.slice(0, 3).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => applySuggestion(suggestion)}
                        className="smart-suggestion"
                        style={{ 
                          padding: '5px 10px', 
                          fontSize: '12px',
                          cursor: 'pointer',
                          border: '1px solid var(--accent-primary)',
                          borderRadius: '15px',
                          background: 'var(--bg-secondary)'
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="global-chat-messages">
                {globalChatMessages.length === 0 ? (
                  <div className="empty-chat">
                    No messages yet. Start the conversation! 🏀
                  </div>
                ) : (
                  globalChatMessages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.isCurrentUser ? 'current-user' : ''}`}>
                      <div className="message-header">
                        <span className={`message-user ${msg.isCurrentUser ? 'current-user-name' : ''}`}>
                          {msg.isCurrentUser ? 'You' : msg.user}
                          {msg.scPlusEnhanced && ' ⭐'}
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
                  placeholder={`Smart suggestions match your ${userActivity.chatStyle} style. What's on your mind?`}
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

              {/* SportsChatPlus Expert Analysis */}
              {selectedGame.scPlusAnalysis && (
                <div style={{
                  background: 'var(--bg-tertiary)',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '2px solid var(--accent-primary)'
                }}>
                  <h3 style={{ margin: '0 0 10px 0', color: 'var(--accent-primary)' }}>
                    ⭐ SportsChatPlus Expert Analysis
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      Favorite: {selectedGame.scPlusAnalysis.favorite}
                    </strong>
                    <span style={{
                      background: selectedGame.scPlusAnalysis.confidence > 70 ? '#28a745' : '#ffc107',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {selectedGame.scPlusAnalysis.confidence}% confidence
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    💡 {selectedGame.scPlusAnalysis.insight}
                  </div>
                </div>
              )}

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
                  <div className="smart-insight">
                    <label>💡 Quick Insight:</label>
                    <span style={{ fontSize: '12px' }}>
                      {Math.abs(parseFloat(selectedGame.spread)) < 3 
                        ? "Expect a nail-biter - very close spread!" 
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

              {/* Enhanced Smart Betting Section */}
              {selectedGame.time !== "LIVE" && selectedGame.time !== "Final" && (
                <div className="betting-section">
                  <h3>🎲 Smart Betting</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                    ⭐ Expert analysis recommends betting on {selectedGame.scPlusAnalysis?.favorite} with {selectedGame.scPlusAnalysis?.confidence}% confidence
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
                      <div style={{ fontSize: '10px' }}>
                        {selectedGame.scPlusAnalysis?.favorite === selectedGame.team1 ? '✅ Expert Pick' : '❌ Risky'}
                      </div>
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
                      <div style={{ fontSize: '10px' }}>
                        {selectedGame.scPlusAnalysis?.favorite === selectedGame.team2 ? '✅ Expert Pick' : '❌ Risky'}
                      </div>
                    </button>
                  </div>
                  <p className="bet-note">⭐ SportsChatPlus analyzes 50+ data points for recommendations</p>
                </div>
              )}

              {/* Enhanced Chat Section */}
              <div className="chat-section">
                <h3>💬 Game Chat</h3>
                
                {/* Smart Chat Suggestions for this specific game */}
                {smartChatSuggestions.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '5px' }}>
                      💡 Smart suggestions:
                    </div>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {smartChatSuggestions.slice(0, 2).map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => applySuggestion(suggestion)}
                          style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            border: '1px solid var(--accent-primary)',
                            borderRadius: '10px',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer'
                          }}
                        >
                          {suggestion.length > 30 ? suggestion.substring(0, 30) + '...' : suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="chat-messages">
                  {chatMessages.length === 0 ? (
                    <div className="empty-chat">
                      Smart suggestions are ready to help you start the conversation! 🏀
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => (
                      <div key={index} className={`chat-message ${msg.isCurrentUser ? 'current-user' : ''}`}>
                        <div className="message-header">
                          <span className={`message-user ${msg.isCurrentUser ? 'current-user-name' : ''}`}>
                            {msg.isCurrentUser ? 'You' : msg.user}
                            {msg.scPlusEnhanced && ' ⭐'}
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
                    placeholder={`Smart suggestions match your ${userActivity.chatStyle} style. Share your thoughts...`}
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
            <span style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginLeft: '15px' }}>
              Last activity: {userActivity.lastActive.toLocaleTimeString()} • ⭐ Expert Analysis Active
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;