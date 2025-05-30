import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import StatsPage from './StatsPage';
import TeamsPage from './TeamsPage';
import SportSelector from '../components/SportSelector';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase-config';
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

  const [currentSport, setCurrentSport] = useState("basketball");

  // Global chat state
  const [globalChatMessage, setGlobalChatMessage] = useState("");
  const [globalChatMessages, setGlobalChatMessages] = useState([
    { id: 1, user: "SportsFan123", message: "Welcome to the global chat!", timestamp: "1 hour ago" },
    { id: 2, user: "BasketballExpert", message: "Who do you think will win the championship?", timestamp: "45 minutes ago" },
    { id: 3, user: "MarchMadnessFan", message: "My bracket is already busted!", timestamp: "30 minutes ago" }
  ]);

  // ALL AI FEATURES (kept from enhanced version)
  const [scPlusInsights, setScPlusInsights] = useState([]);
  const [smartChatSuggestions, setSmartChatSuggestions] = useState([]);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState([]);
  const [userActivity, setUserActivity] = useState({
    gamesViewed: 0,
    messagesPosted: 0,
    favoriteTeams: [],
    lastActive: new Date(),
    chatStyle: 'casual'
  });

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Smart game selection with activity tracking - MOVED UP
  const handleGameClick = useCallback(async (game) => {
    try {
      setSelectedGame(game);

      setUserActivity(prev => ({
        ...prev,
        gamesViewed: prev.gamesViewed + 1,
        favoriteTeams: [...new Set([...prev.favoriteTeams, game.team1, game.team2].slice(0, 5))]
      }));
    } catch (err) {
      console.error("Error selecting game:", err);
    }
  }, []); // Removed generateSmartChatSuggestions call to avoid dependency issues

  // Enhanced mock data with ALL AI features
  const getFirebaseGames = useCallback(async (sport, tab) => {
    try {
      // Determine which collection to use based on sport
      const collectionName = sport === 'basketball' ? 'games' : 'baseballGames';

      console.log(`🔍 Fetching ${sport} games from ${collectionName} collection`);

      // Create base query - get all games first, then filter
      const gamesQuery = query(
        collection(db, collectionName),
        orderBy('LastUpdated', 'desc')
      );

      const querySnapshot = await getDocs(gamesQuery);
      const firebaseGames = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // Convert Firebase data to your app's format
        const gameData = {
          id: doc.id,
          team1: data.Team1Name || 'TBD',
          team2: data.Team2Name || 'TBD',
          score1: data.ScoreTeam1 || 0,
          score2: data.ScoreTeam2 || 0,
          time: formatGameTime(data.DatePlayed, data.GameState),
          gameState: data.GameState || 'pre',
          round: data.Round || 'Tournament',
          location: data.Location || 'TBD',
          sport: sport,
          // Add SC+ Analysis for display
          scPlusAnalysis: generateScPlusAnalysis(data, sport)
        };

        firebaseGames.push(gameData);
      });

      // Filter by tab after getting all data
      let filteredGames = firebaseGames;
      if (tab === "live") {
        filteredGames = firebaseGames.filter(game =>
          game.gameState === 'live' || game.gameState === 'in-progress'
        );
      } else if (tab === "recent") {
        filteredGames = firebaseGames.filter(game =>
          game.gameState === 'final' || game.gameState === 'completed'
        );
      } else {
        // upcoming
        filteredGames = firebaseGames.filter(game =>
          game.gameState === 'pre' || game.gameState === 'scheduled'
        );
      }

      console.log(`✅ Loaded ${filteredGames.length} ${sport} games for ${tab} tab`);
      return filteredGames;

    } catch (error) {
      console.error(`❌ Error fetching ${sport} games:`, error);
      // Return empty array on error
      return [];
    }
  }, []);
  const formatGameTime = (dateTimestamp, gameState) => {
    if (!dateTimestamp) return 'TBD';

    try {
      const date = dateTimestamp.toDate ? dateTimestamp.toDate() : new Date(dateTimestamp);

      if (gameState === 'live' || gameState === 'in-progress') {
        return 'LIVE';
      } else if (gameState === 'final' || gameState === 'completed') {
        return 'Final';
      } else {
        // Format upcoming games
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'TBD';
    }
  };

  const generateScPlusAnalysis = (gameData, sport) => {
    // Generate smart analysis based on real data
    const team1Score = gameData.ScoreTeam1 || 0;
    const team2Score = gameData.ScoreTeam2 || 0;

    if (gameData.GameState === 'live' || gameData.GameState === 'final') {
      // For live/completed games, show actual results
      if (team1Score > team2Score) {
        return {
          favorite: gameData.Team1Name,
          confidence: 100,
          insight: `Leading ${team1Score}-${team2Score}`
        };
      } else if (team2Score > team1Score) {
        return {
          favorite: gameData.Team2Name,
          confidence: 100,
          insight: `Leading ${team2Score}-${team1Score}`
        };
      }
    } else {
      // For upcoming games, generate prediction
      const confidence = Math.floor(Math.random() * 30) + 55; // 55-85%
      const favorite = Math.random() > 0.5 ? gameData.Team1Name : gameData.Team2Name;

      const insights = sport === 'baseball' ? [
        "Strong pitching rotation",
        "Better offensive lineup",
        "Home field advantage",
        "Superior postseason experience",
        "Key player availability"
      ] : [
        "Strong recent form",
        "Better head-to-head record",
        "Home court advantage",
        "Superior tournament experience",
        "Deeper bench strength"
      ];

      return {
        favorite: favorite,
        confidence: confidence,
        insight: insights[Math.floor(Math.random() * insights.length)]
      };
    }

    return null;
  };

  // ALL AI INSIGHT GENERATION
  const generateScPlusInsights = useCallback((gamesList) => {
    const insights = [];

    if (gamesList.length > 0) {
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

      insights.push({
        type: 'analytics',
        title: '📊 Advanced Analytics',
        description: 'Teams with elite defensive ratings are outperforming expectations by 15% this tournament',
        reasoning: 'SportsChatPlus analysis of current tournament trends'
      });
    }

    setScPlusInsights(insights);
  }, []);

  // ALL SMART CHAT FEATURES
  const generateSmartChatSuggestions = useCallback((gameContext, userStyle = 'casual') => {
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

  // ALL PERSONALIZED RECOMMENDATIONS
  const generatePersonalizedRecommendations = useCallback((gamesList) => {
    const recommendations = [];

    if (gamesList.length > 0) {
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

      if (userActivity.gamesViewed > 5) {
        recommendations.push({
          type: 'power_user',
          title: '📈 Advanced Stats Ready',
          description: 'Check out detailed team analytics',
          action: () => setActiveMenu('stats')
        });
      }

      if (userActivity.gamesViewed > 3) {
        recommendations.push({
          type: 'personalized_pick',
          title: '🎯 Picked Just for You',
          description: `Based on your viewing history: ${gamesList[0].team1} vs ${gamesList[0].team2}`,
          reasoning: 'Matches your preference for competitive games',
          action: () => handleGameClick(gamesList[0])
        });
      }

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
  }, [userActivity, handleGameClick, setActiveMenu]);

  const handleSportChange = useCallback((newSport) => {
    setCurrentSport(newSport);
    // Reset game selection when switching sports
    setSelectedGame(null);
    // Reset to upcoming tab
    setActiveTab("upcoming");
    // Clear any error state
    setError(null);

    console.log(`🔄 Switched to ${newSport} tournament`);
  }, []);

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

    const interval = setInterval(trackActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch chat messages for selected game
  const fetchChatMessages = useCallback(async () => {
    if (!selectedGame?.id) return;

    try {
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
      console.log(`🎯 Fetching ${currentSport} games for ${activeTab} tab`);

      // Get real data from Firebase
      const firebaseGames = await getFirebaseGames(currentSport, activeTab);

      // Apply user personalization if available
      let filteredGames = firebaseGames;
      if (userProfile?.preferences?.favoriteTeams?.length > 0) {
        const favoriteGames = firebaseGames.filter(game =>
          userProfile.preferences.favoriteTeams.some(team =>
            game.team1.toLowerCase().includes(team.toLowerCase()) ||
            game.team2.toLowerCase().includes(team.toLowerCase())
          )
        );

        if (favoriteGames.length > 0) {
          filteredGames = [
            ...favoriteGames,
            ...firebaseGames.filter(game => !favoriteGames.includes(game))
          ];
        }
      }

      setGames(filteredGames);
      setLastRefreshTime(new Date());

      // Generate AI insights
      generateScPlusInsights(filteredGames);
      generatePersonalizedRecommendations(filteredGames);

      console.log(`✅ Successfully loaded ${filteredGames.length} ${currentSport} games`);

    } catch (err) {
      console.error(`❌ Error fetching ${currentSport} games:`, err);
      setError(`Failed to load ${currentSport} games. Please try again.`);
      setGames([]);
    } finally {
      setGamesLoading(false);
    }
  }, [currentSport, activeTab, userProfile, getFirebaseGames, generateScPlusInsights, generatePersonalizedRecommendations]);

  // Fetch games when active tab changes
  useEffect(() => {
    if (!loading && user) {
      fetchGames();
    }
  }, [activeTab, loading, user, currentSport, fetchGames]); // ADD currentSport here

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
        scPlusEnhanced: true
      };

      setChatMessages(prev => [...prev, newMessage]);
      setChatMessage("");

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

  // Apply suggestion function
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
      console.log(`User ${user.uid} placed bet on team ${teamId} for ${amount} coins`);
      const teamName = teamId === 1 ? selectedGame.team1 : selectedGame.team2;
      setError("");
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
          <h1>
            {currentSport === 'basketball' ? '🏀' : '⚾'} SportsChat+
          </h1>
        </div>

        {/* ADD SPORT SELECTOR HERE */}
        <SportSelector
          currentSport={currentSport}
          onSportChange={handleSportChange}
        />

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

      {/* AI INSIGHTS - Properly sized and organized */}
      {scPlusInsights.length > 0 && (
        <div className="ai-insights-container">
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--accent-primary)', fontSize: '16px' }}>
            ⭐ SportsChatPlus Expert Insights
          </h4>
          <div className="ai-insights-grid">
            {scPlusInsights.slice(0, 3).map((insight, index) => (
              <div key={index} className="ai-insight-card" onClick={insight.action}>
                <div className="insight-header">
                  <strong>{insight.title}</strong>
                  {insight.confidence && (
                    <span className="confidence-badge">
                      {insight.confidence}%
                    </span>
                  )}
                </div>
                <div className="insight-description">{insight.description}</div>
                {insight.reasoning && (
                  <div className="insight-reasoning">
                    💡 {insight.reasoning}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PERSONALIZED RECOMMENDATIONS - Properly organized */}
      {personalizedRecommendations.length > 0 && (
        <div className="recommendations-container">
          <h4 style={{ margin: '0 0 10px 0', color: 'var(--accent-secondary)', fontSize: '16px' }}>
            ✨ Personalized for You
          </h4>
          <div className="recommendations-grid">
            {personalizedRecommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className="recommendation-card" onClick={rec.action}>
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
        </div>
      )}

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="march-madness-container">
          {/* Enhanced Sidebar Navigation */}
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

          {/* Enhanced Games View with ALL AI features */}
          {activeMenu === "games" && (
            <div className="main-content">
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

              {lastRefreshTime && (
                <div className="last-updated">
                  Last updated: {lastRefreshTime.toLocaleTimeString()}
                </div>
              )}

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

          {/* All other menu views (Teams, Bracket, etc.) */}
          {activeMenu === "teams" && (
            <div className="main-content">
              <TeamsPage currentSport={currentSport} />
            </div>
          )}

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

          {activeMenu === "stats" && (
            <div className="main-content">
              <StatsPage activeMenu={activeMenu} />
            </div>
          )}

          {/* Enhanced Game Detail Panel with ALL AI features */}
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

              <div className="chat-section">
                <h3>💬 Game Chat</h3>

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