import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const StatsPage = ({ activeMenu }) => {
  const { user, userProfile } = useAuth();
  
  // State to track which tab is currently active
  const [activeStatsTab, setActiveStatsTab] = useState("games");

  // Filters for each type of stat
  const [gameStatsFilter, setGameStatsFilter] = useState("highScoring");
  const [playerStatsFilter, setPlayerStatsFilter] = useState("ppg");
  const [teamStatsFilter, setTeamStatsFilter] = useState("winPct");

  // Data arrays to hold the fetched statistics
  const [gameStatsList, setGameStatsList] = useState([]);
  const [playerStatsList, setPlayerStatsList] = useState([]);
  const [teamStatsList, setTeamStatsList] = useState([]);

  // Loading indicator
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Smart personalization state
  const [personalizedStats, setPersonalizedStats] = useState([]);
  const [userInsights, setUserInsights] = useState({
    favoriteCategories: [],
    viewHistory: [],
    recommendations: []
  });

  // Smart mock data with more realistic stats
  const getSmartMockGameStats = (filter) => {
    const baseGames = [
      { id: 1, team1: "Duke", team2: "North Carolina", date: "2025-03-15", score1: 94, score2: 91, totalScore: 185, scoreDiff: 3 },
      { id: 2, team1: "Kansas", team2: "Kentucky", date: "2025-03-14", score1: 87, score2: 82, totalScore: 169, scoreDiff: 5 },
      { id: 3, team1: "Gonzaga", team2: "Arizona", date: "2025-03-13", score1: 78, score2: 99, totalScore: 177, scoreDiff: 21 },
      { id: 4, team1: "UCLA", team2: "Michigan", date: "2025-03-12", score1: 68, score2: 65, totalScore: 133, scoreDiff: 3 },
      { id: 5, team1: "Villanova", team2: "Purdue", date: "2025-03-11", score1: 85, score2: 89, totalScore: 174, scoreDiff: 4 },
      { id: 6, team1: "Texas", team2: "Baylor", date: "2025-03-10", score1: 72, score2: 95, totalScore: 167, scoreDiff: 23 },
      { id: 7, team1: "Tennessee", team2: "Auburn", date: "2025-03-09", score1: 81, score2: 79, totalScore: 160, scoreDiff: 2 },
      { id: 8, team1: "Houston", team2: "Alabama", date: "2025-03-08", score1: 76, score2: 84, totalScore: 160, scoreDiff: 8 }
    ];

    switch (filter) {
      case 'highScoring':
        return baseGames.sort((a, b) => b.totalScore - a.totalScore);
      case 'closeGames':
        return baseGames.filter(game => game.scoreDiff <= 5).sort((a, b) => a.scoreDiff - b.scoreDiff);
      case 'blowouts':
        return baseGames.filter(game => game.scoreDiff > 15).sort((a, b) => b.scoreDiff - a.scoreDiff);
      default:
        return baseGames;
    }
  };

  const getSmartMockPlayerStats = (filter) => {
    const basePlayers = [
      { id: 1, name: "Tyler Johnson", team: "Duke", position: "G", ppg: 24.8, rpg: 6.2, apg: 8.1 },
      { id: 2, name: "Marcus Williams", team: "North Carolina", position: "F", ppg: 22.3, rpg: 11.5, apg: 3.4 },
      { id: 3, name: "Alex Thompson", team: "Kansas", position: "C", ppg: 18.7, rpg: 12.8, apg: 2.1 },
      { id: 4, name: "Jordan Davis", team: "Kentucky", position: "G", ppg: 21.9, rpg: 4.3, apg: 7.8 },
      { id: 5, name: "Ryan Martinez", team: "Gonzaga", position: "F", ppg: 19.6, rpg: 9.4, apg: 4.2 },
      { id: 6, name: "Chris Anderson", team: "Arizona", position: "G", ppg: 20.1, rpg: 5.1, apg: 6.9 },
      { id: 7, name: "Mike Roberts", team: "UCLA", position: "C", ppg: 16.8, rpg: 10.7, apg: 1.8 },
      { id: 8, name: "David Wilson", team: "Michigan", position: "F", ppg: 17.9, rpg: 8.6, apg: 3.7 }
    ];

    switch (filter) {
      case 'ppg':
        return basePlayers.sort((a, b) => b.ppg - a.ppg);
      case 'rpg':
        return basePlayers.sort((a, b) => b.rpg - a.rpg);
      case 'apg':
        return basePlayers.sort((a, b) => b.apg - a.apg);
      default:
        return basePlayers;
    }
  };

  const getSmartMockTeamStats = (filter) => {
    const baseTeams = [
      { id: 1, name: "Duke", wins: 28, losses: 4, winPct: 0.875, ppg: 84.2, differential: 12.8 },
      { id: 2, name: "North Carolina", wins: 26, losses: 6, winPct: 0.812, ppg: 81.5, differential: 9.3 },
      { id: 3, name: "Kansas", wins: 27, losses: 5, winPct: 0.844, ppg: 79.8, differential: 11.2 },
      { id: 4, name: "Kentucky", wins: 24, losses: 8, winPct: 0.750, ppg: 78.9, differential: 7.4 },
      { id: 5, name: "Gonzaga", wins: 29, losses: 3, winPct: 0.906, ppg: 86.1, differential: 15.7 },
      { id: 6, name: "Arizona", wins: 25, losses: 7, winPct: 0.781, ppg: 82.3, differential: 8.9 },
      { id: 7, name: "UCLA", wins: 23, losses: 9, winPct: 0.719, ppg: 75.6, differential: 4.2 },
      { id: 8, name: "Michigan", wins: 22, losses: 10, winPct: 0.688, ppg: 77.1, differential: 5.8 }
    ];

    switch (filter) {
      case 'winPct':
        return baseTeams.sort((a, b) => b.winPct - a.winPct);
      case 'ppg':
        return baseTeams.sort((a, b) => b.ppg - a.ppg);
      case 'differential':
        return baseTeams.sort((a, b) => b.differential - a.differential);
      default:
        return baseTeams;
    }
  };

  // Smart API simulation with Firebase user context
  const fetchGameStats = useCallback(async () => {
    setStatsLoading(true);
    setError(null);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const data = getSmartMockGameStats(gameStatsFilter);
      setGameStatsList(Array.isArray(data) ? data : []);
      
      // Track user activity for personalization
      setUserInsights(prev => ({
        ...prev,
        viewHistory: [...prev.viewHistory.slice(-9), { type: 'games', filter: gameStatsFilter, timestamp: new Date() }]
      }));
    } catch (err) {
      console.error("Error fetching game stats:", err);
      setError("Failed to load game statistics. Please try again.");
      setGameStatsList([]);
    } finally {
      setStatsLoading(false);
    }
  }, [gameStatsFilter]);

  const fetchPlayerStats = useCallback(async () => {
    setStatsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const data = getSmartMockPlayerStats(playerStatsFilter);
      setPlayerStatsList(Array.isArray(data) ? data : []);
      
      setUserInsights(prev => ({
        ...prev,
        viewHistory: [...prev.viewHistory.slice(-9), { type: 'players', filter: playerStatsFilter, timestamp: new Date() }]
      }));
    } catch (err) {
      console.error("Error fetching player stats:", err);
      setError("Failed to load player statistics. Please try again.");
      setPlayerStatsList([]);
    } finally {
      setStatsLoading(false);
    }
  }, [playerStatsFilter]);

  const fetchTeamStats = useCallback(async () => {
    setStatsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const data = getSmartMockTeamStats(teamStatsFilter);
      setTeamStatsList(Array.isArray(data) ? data : []);
      
      setUserInsights(prev => ({
        ...prev,
        viewHistory: [...prev.viewHistory.slice(-9), { type: 'teams', filter: teamStatsFilter, timestamp: new Date() }]
      }));
    } catch (err) {
      console.error("Error fetching team stats:", err);
      setError("Failed to load team statistics. Please try again.");
      setTeamStatsList([]);
    } finally {
      setStatsLoading(false);
    }
  }, [teamStatsFilter]);

  // Smart personalization engine
  const generatePersonalizedStats = useCallback(() => {
    const insights = [];
    
    // Analyze user's favorite categories
    const categoryCount = userInsights.viewHistory.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
    
    const favoriteCategory = Object.keys(categoryCount).reduce((a, b) => 
      categoryCount[a] > categoryCount[b] ? a : b, 'games'
    );
    
    if (categoryCount[favoriteCategory] > 2) {
      insights.push({
        type: 'favorite_category',
        title: `📊 You're a ${favoriteCategory} stats expert!`,
        description: `You've viewed ${favoriteCategory} stats ${categoryCount[favoriteCategory]} times`,
        action: () => setActiveStatsTab(favoriteCategory)
      });
    }

    // Recommend based on user profile preferences
    if (userProfile?.preferences?.favoriteTeams?.length > 0) {
      const favoriteTeam = userProfile.preferences.favoriteTeams[0];
      insights.push({
        type: 'team_focus',
        title: `🏀 ${favoriteTeam} Performance`,
        description: `Check out how ${favoriteTeam} is performing this season`,
        action: () => {
          setActiveStatsTab('teams');
          setTeamStatsFilter('winPct');
        }
      });
    }

    // Smart recommendations based on current data
    if (activeStatsTab === 'games' && gameStatsList.length > 0) {
      const highScoringGame = gameStatsList.find(game => game.totalScore > 180);
      if (highScoringGame) {
        insights.push({
          type: 'interesting_stat',
          title: '🔥 High-Scoring Alert!',
          description: `${highScoringGame.team1} vs ${highScoringGame.team2} had ${highScoringGame.totalScore} total points!`,
          action: () => setGameStatsFilter('highScoring')
        });
      }
    }

    setPersonalizedStats(insights.slice(0, 3));
  }, [userInsights, userProfile, activeStatsTab, gameStatsList]);

  // Auto-fetch stats when tab or filter changes
  useEffect(() => {
    if (activeMenu === "stats" && activeStatsTab === "games") {
      fetchGameStats();
    }
  }, [activeMenu, activeStatsTab, gameStatsFilter, fetchGameStats]);

  useEffect(() => {
    if (activeMenu === "stats" && activeStatsTab === "players") {
      fetchPlayerStats();
    }
  }, [activeMenu, activeStatsTab, playerStatsFilter, fetchPlayerStats]);

  useEffect(() => {
    if (activeMenu === "stats" && activeStatsTab === "teams") {
      fetchTeamStats();
    }
  }, [activeMenu, activeStatsTab, teamStatsFilter, fetchTeamStats]);

  // Generate personalized recommendations
  useEffect(() => {
    generatePersonalizedStats();
  }, [generatePersonalizedStats]);

  // Render game stats table with smart enhancements
  const renderGameStats = () => {
    if (statsLoading) return (
      <div className="loading-message">
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>📊</div>
        Loading game statistics...
      </div>
    );
    
    if (error) return <div className="error-message">{error}</div>;
    
    if (!Array.isArray(gameStatsList) || gameStatsList.length === 0) {
      return <div className="no-games-message">No game statistics available.</div>;
    }

    return (
      <div className="game-stats-container">
        <div className="filter-controls">
          <button 
            className={`filter-button ${gameStatsFilter === 'highScoring' ? 'active' : ''}`} 
            onClick={() => setGameStatsFilter('highScoring')}
          >
            🔥 Highest Scoring
          </button>
          <button 
            className={`filter-button ${gameStatsFilter === 'closeGames' ? 'active' : ''}`} 
            onClick={() => setGameStatsFilter('closeGames')}
          >
            ⚡ Closest Games
          </button>
          <button 
            className={`filter-button ${gameStatsFilter === 'blowouts' ? 'active' : ''}`} 
            onClick={() => setGameStatsFilter('blowouts')}
          >
            💥 Biggest Blowouts
          </button>
        </div>
        <div className="stats-table-container">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Matchup</th>
                <th>Date</th>
                <th>Score</th>
                {gameStatsFilter === 'highScoring' && <th>Total Points</th>}
                {(gameStatsFilter === 'closeGames' || gameStatsFilter === 'blowouts') && <th>Margin</th>}
              </tr>
            </thead>
            <tbody>
              {gameStatsList.map((game, index) => (
                <tr key={game.id} className={index < 3 ? 'top-performer' : ''}>
                  <td>
                    <span style={{ 
                      fontWeight: 'bold',
                      color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#666'
                    }}>
                      {index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}`}
                    </span>
                  </td>
                  <td>
                    <strong>{game.team1}</strong> vs <strong>{game.team2}</strong>
                  </td>
                  <td>{new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                  <td>
                    <span style={{ fontWeight: 'bold' }}>{game.score1} - {game.score2}</span>
                  </td>
                  {gameStatsFilter === 'highScoring' && (
                    <td>
                      <strong style={{ color: game.totalScore > 180 ? '#e63946' : '#007bff' }}>
                        {game.totalScore}
                      </strong>
                    </td>
                  )}
                  {(gameStatsFilter === 'closeGames' || gameStatsFilter === 'blowouts') && (
                    <td>
                      <strong style={{ color: game.scoreDiff <= 3 ? '#e63946' : '#007bff' }}>
                        {game.scoreDiff}
                      </strong>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render player stats table with smart enhancements
  const renderPlayerStats = () => {
    if (statsLoading) return (
      <div className="loading-message">
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>👤</div>
        Loading player statistics...
      </div>
    );
    
    if (error) return <div className="error-message">{error}</div>;
    
    if (!Array.isArray(playerStatsList) || playerStatsList.length === 0) {
      return <div className="no-games-message">No player statistics available.</div>;
    }

    return (
      <div className="player-stats-container">
        <div className="filter-controls">
          <button 
            className={`filter-button ${playerStatsFilter === 'ppg' ? 'active' : ''}`} 
            onClick={() => setPlayerStatsFilter('ppg')}
          >
            🏀 Points Per Game
          </button>
          <button 
            className={`filter-button ${playerStatsFilter === 'rpg' ? 'active' : ''}`} 
            onClick={() => setPlayerStatsFilter('rpg')}
          >
            📈 Rebounds Per Game
          </button>
          <button 
            className={`filter-button ${playerStatsFilter === 'apg' ? 'active' : ''}`} 
            onClick={() => setPlayerStatsFilter('apg')}
          >
            🎯 Assists Per Game
          </button>
        </div>
        <div className="stats-table-container">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Team</th>
                <th>Position</th>
                {playerStatsFilter === 'ppg' && <th>PPG</th>}
                {playerStatsFilter === 'rpg' && <th>RPG</th>}
                {playerStatsFilter === 'apg' && <th>APG</th>}
              </tr>
            </thead>
            <tbody>
              {playerStatsList.map((player, index) => (
                <tr key={player.id} className={index < 3 ? 'top-performer' : ''}>
                  <td>
                    <span style={{ 
                      fontWeight: 'bold',
                      color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#666'
                    }}>
                      {index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}`}
                    </span>
                  </td>
                  <td><strong>{player.name}</strong></td>
                  <td>{player.team}</td>
                  <td>{player.position}</td>
                  {playerStatsFilter === 'ppg' && (
                    <td>
                      <strong style={{ color: player.ppg > 22 ? '#e63946' : '#007bff' }}>
                        {player.ppg}
                      </strong>
                    </td>
                  )}
                  {playerStatsFilter === 'rpg' && (
                    <td>
                      <strong style={{ color: player.rpg > 10 ? '#e63946' : '#007bff' }}>
                        {player.rpg}
                      </strong>
                    </td>
                  )}
                  {playerStatsFilter === 'apg' && (
                    <td>
                      <strong style={{ color: player.apg > 7 ? '#e63946' : '#007bff' }}>
                        {player.apg}
                      </strong>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render team stats table with smart enhancements
  const renderTeamStats = () => {
    if (statsLoading) return (
      <div className="loading-message">
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>🏆</div>
        Loading team statistics...
      </div>
    );
    
    if (error) return <div className="error-message">{error}</div>;
    
    if (!Array.isArray(teamStatsList) || teamStatsList.length === 0) {
      return <div className="no-games-message">No team statistics available.</div>;
    }

    return (
      <div className="team-stats-container">
        <div className="filter-controls">
          <button 
            className={`filter-button ${teamStatsFilter === 'winPct' ? 'active' : ''}`} 
            onClick={() => setTeamStatsFilter('winPct')}
          >
            🏆 Win Percentage
          </button>
          <button 
            className={`filter-button ${teamStatsFilter === 'ppg' ? 'active' : ''}`} 
            onClick={() => setTeamStatsFilter('ppg')}
          >
            📊 Points Per Game
          </button>
          <button 
            className={`filter-button ${teamStatsFilter === 'differential' ? 'active' : ''}`} 
            onClick={() => setTeamStatsFilter('differential')}
          >
            ⚖️ Point Differential
          </button>
        </div>
        <div className="stats-table-container">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                {teamStatsFilter === 'winPct' && <><th>Record</th><th>Win %</th></>}
                {teamStatsFilter === 'ppg' && <th>PPG</th>}
                {teamStatsFilter === 'differential' && <th>Differential</th>}
              </tr>
            </thead>
            <tbody>
              {teamStatsList.map((team, index) => (
                <tr key={team.id} className={index < 3 ? 'top-performer' : ''}>
                  <td>
                    <span style={{ 
                      fontWeight: 'bold',
                      color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#666'
                    }}>
                      {index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}`}
                    </span>
                  </td>
                  <td>
                    <strong style={{ 
                      color: userProfile?.preferences?.favoriteTeams?.includes(team.name) ? '#e63946' : 'inherit'
                    }}>
                      {team.name}
                      {userProfile?.preferences?.favoriteTeams?.includes(team.name) && ' ❤️'}
                    </strong>
                  </td>
                  {teamStatsFilter === 'winPct' && (
                    <>
                      <td>{team.wins}-{team.losses}</td>
                      <td>
                        <strong style={{ color: team.winPct > 0.8 ? '#28a745' : '#007bff' }}>
                          {Math.round(team.winPct * 100)}%
                        </strong>
                      </td>
                    </>
                  )}
                  {teamStatsFilter === 'ppg' && (
                    <td>
                      <strong style={{ color: team.ppg > 82 ? '#e63946' : '#007bff' }}>
                        {team.ppg}
                      </strong>
                    </td>
                  )}
                  {teamStatsFilter === 'differential' && (
                    <td>
                      <strong style={{ color: team.differential > 10 ? '#28a745' : '#007bff' }}>
                        +{team.differential}
                      </strong>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="stats-page">
      <div className="stats-header">
        <h2>📊 Tournament Statistics</h2>
        <p>View detailed statistics for games, players, and teams • Enhanced with AI insights</p>
        {user && (
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Welcome back, {userProfile?.username || user.displayName || 'Fan'}! 
            {userInsights.viewHistory.length > 0 && (
              <span> • You've viewed {userInsights.viewHistory.length} stat categories recently</span>
            )}
          </div>
        )}
      </div>

      {/* Smart Personalized Recommendations */}
      {personalizedStats.length > 0 && (
        <div style={{
          background: 'linear-gradient(45deg, rgba(40, 167, 69, 0.1), rgba(26, 115, 232, 0.1))',
          border: '1px solid rgba(40, 167, 69, 0.2)',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#28a745' }}>✨ Personalized Insights</h4>
          {personalizedStats.map((insight, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.7)',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }} onClick={insight.action}>
              <strong>{insight.title}</strong>
              <div style={{ fontSize: '14px', color: '#666' }}>{insight.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Tabs */}
      <div className="stats-tabs">
        <div 
          className={`stats-tab ${activeStatsTab === 'games' ? 'active' : ''}`} 
          onClick={() => setActiveStatsTab('games')}
        >
          🎮 Games
          {userInsights.viewHistory.filter(v => v.type === 'games').length > 0 && (
            <span style={{ 
              marginLeft: '5px', 
              fontSize: '10px', 
              background: '#e63946', 
              color: 'white', 
              borderRadius: '8px', 
              padding: '1px 4px' 
            }}>
              {userInsights.viewHistory.filter(v => v.type === 'games').length}
            </span>
          )}
        </div>
        <div 
          className={`stats-tab ${activeStatsTab === 'players' ? 'active' : ''}`} 
          onClick={() => setActiveStatsTab('players')}
        >
          👤 Players
          {userInsights.viewHistory.filter(v => v.type === 'players').length > 0 && (
            <span style={{ 
              marginLeft: '5px', 
              fontSize: '10px', 
              background: '#e63946', 
              color: 'white', 
              borderRadius: '8px', 
              padding: '1px 4px' 
            }}>
              {userInsights.viewHistory.filter(v => v.type === 'players').length}
            </span>
          )}
        </div>
        <div 
          className={`stats-tab ${activeStatsTab === 'teams' ? 'active' : ''}`} 
          onClick={() => setActiveStatsTab('teams')}
        >
          🏆 Teams
          {userInsights.viewHistory.filter(v => v.type === 'teams').length > 0 && (
            <span style={{ 
              marginLeft: '5px', 
              fontSize: '10px', 
              background: '#e63946', 
              color: 'white', 
              borderRadius: '8px', 
              padding: '1px 4px' 
            }}>
              {userInsights.viewHistory.filter(v => v.type === 'teams').length}
            </span>
          )}
        </div>
      </div>

      {/* Render appropriate table based on selected tab */}
      <div className="stats-content">
        {activeStatsTab === 'games' && renderGameStats()}
        {activeStatsTab === 'players' && renderPlayerStats()}
        {activeStatsTab === 'teams' && renderTeamStats()}
      </div>

      {/* Smart footer with user activity */}
      {userInsights.viewHistory.length > 0 && (
        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: 'rgba(108, 117, 125, 0.1)',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center'
        }}>
          <strong>📈 Your Stats Journey:</strong> You've explored {userInsights.viewHistory.length} different stat categories. 
          Keep exploring to get more personalized insights!
        </div>
      )}

      <style jsx>{`
        .top-performer {
          background: rgba(255, 215, 0, 0.1) !important;
        }
        
        .top-performer:hover {
          background: rgba(255, 215, 0, 0.2) !important;
        }
        
        .filter-button {
          transition: all 0.2s ease;
        }
        
        .filter-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .stats-table tbody tr:hover {
          background: rgba(26, 115, 232, 0.05);
        }
      `}</style>
    </div>
  );
};

export default StatsPage;