import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase-config';
import "./style.css";

const TeamsPage = ({ currentSport = 'basketball' }) => {
  const { user, userProfile, updateUserProfile } = useAuth();

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);

  // Smart features state
  const [searchQuery, setSearchQuery] = useState("");
  const [conferenceFilter, setConferenceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [favoriteTeams, setFavoriteTeams] = useState([]);
  const [teamInsights, setTeamInsights] = useState({});
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState([]);

  // Smart data with comprehensive team information
  const getFirebaseTeams = useCallback(async (sport) => {
    try {
      // Determine which collection to use based on sport
      const collectionName = sport === 'basketball' ? 'teams' : 'baseballTeams';

      console.log(`🔍 Fetching ${sport} teams from ${collectionName} collection`);

      const teamsQuery = query(
        collection(db, collectionName),
        orderBy('LastUpdated', 'desc')
      );

      const querySnapshot = await getDocs(teamsQuery);
      const firebaseTeams = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // Convert Firebase data to your app's format
        const teamData = {
          id: doc.id,
          name: data.TeamName || 'Unknown Team',
          shortName: extractShortName(data.TeamName),
          conference: data.Conference || data.region || 'NCAA Division I', // Better fallback
          seed: data.Seed || null,
          coach: data.CoachName || 'Head Coach TBD', // Better fallback
          wins: data.Wins || 0,
          losses: data.Losses || 0,
          winPct: data.Wins ? (data.Wins / (data.Wins + data.Losses)) : 0,
          ranking: data.Seed || Math.floor(Math.random() * 30) + 1, // Random ranking if no seed
          location: extractLocation(data.TeamName),
          sport: sport,
          // Better defaults
          founded: 1900,
          colors: sport === 'baseball' ? ['School Colors'] : ['Team Colors'],
          mascot: extractMascot(data.TeamName),
          arena: sport === 'baseball' ? 'Baseball Diamond' : 'Basketball Arena',
          capacity: sport === 'baseball' ? 3000 : 8000,
          players: [],
          recentGames: [],
          strengths: generateStrengths(sport),
          weaknesses: generateWeaknesses(sport)
        };

        firebaseTeams.push(teamData);
      });

      console.log(`✅ Loaded ${firebaseTeams.length} ${sport} teams`);
      return firebaseTeams;

    } catch (error) {
      console.error(`❌ Error fetching ${sport} teams:`, error);
      return [];
    }
  }, []);

  // ADD HELPER FUNCTIONS
  const extractShortName = (fullName) => {
    if (!fullName) return 'Team';

    // Extract university name from full name
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      // Look for common university keywords
      const universityIndex = parts.findIndex(part =>
        ['University', 'College', 'State'].includes(part)
      );

      if (universityIndex > 0) {
        return parts.slice(0, universityIndex + 1).join(' ');
      }
    }

    // Fallback: take first 2-3 words
    return parts.slice(0, Math.min(3, parts.length)).join(' ');
  };

  const extractLocation = (teamName) => {
    if (!teamName) return 'Unknown Location';

    // Simple extraction - you can enhance this
    const locationKeywords = ['University', 'College', 'State'];
    const parts = teamName.split(' ');

    for (let i = 0; i < parts.length; i++) {
      if (locationKeywords.includes(parts[i]) && i > 0) {
        return parts.slice(0, i).join(' ');
      }
    }

    return parts[0] || 'Unknown Location';
  };

  const extractMascot = (teamName) => {
    if (!teamName) return 'Team';

    // Extract potential mascot from team name
    const parts = teamName.split(' ');
    const mascotWords = ['Wildcats', 'Eagles', 'Bears', 'Tigers', 'Bulldogs', 'Cardinals'];

    for (const part of parts) {
      if (mascotWords.some(mascot => part.toLowerCase().includes(mascot.toLowerCase()))) {
        return part;
      }
    }

    return 'Team';
  };

  const generateStrengths = (sport) => {
    if (sport === 'baseball') {
      return ['Strong pitching staff', 'Experienced hitters', 'Good team chemistry'];
    } else {
      return ['Offensive firepower', 'Experienced coaching', 'Strong home court advantage'];
    }
  };

  const generateWeaknesses = (sport) => {
    if (sport === 'baseball') {
      return ['Inconsistent batting', 'Young pitching rotation'];
    } else {
      return ['Defensive consistency', 'Depth concerns'];
    }
  };

  // Initialize favorite teams from user profile
  useEffect(() => {
    if (userProfile?.preferences?.favoriteTeams) {
      setFavoriteTeams(userProfile.preferences.favoriteTeams);
    }
  }, [userProfile]);

  // Smart team filtering and sorting
  const getFilteredAndSortedTeams = useCallback(() => {
    let filteredTeams = teams;

    // Search filter
    if (searchQuery) {
      filteredTeams = filteredTeams.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.conference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.coach.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Conference filter
    if (conferenceFilter !== "all") {
      filteredTeams = filteredTeams.filter(team => team.conference === conferenceFilter);
    }

    // Sort teams
    filteredTeams.sort((a, b) => {
      switch (sortBy) {
        case "ranking":
          return a.ranking - b.ranking;
        case "wins":
          return b.wins - a.wins;
        case "winPct":
          return b.winPct - a.winPct;
        case "seed":
          return a.seed - b.seed;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filteredTeams;
  }, [teams, searchQuery, conferenceFilter, sortBy]);

  // Smart favorite team management
  const handleToggleFavorite = useCallback(async (teamName) => {
    try {
      let newFavorites;
      if (favoriteTeams.includes(teamName)) {
        newFavorites = favoriteTeams.filter(t => t !== teamName);
      } else {
        newFavorites = [...favoriteTeams, teamName];
      }

      setFavoriteTeams(newFavorites);

      // Update user profile in Firebase
      if (updateUserProfile) {
        await updateUserProfile({
          preferences: {
            ...userProfile?.preferences,
            favoriteTeams: newFavorites
          }
        });
      }
    } catch (error) {
      console.error("Error updating favorite teams:", error);
      setError("Failed to update favorite teams.");
    }
  }, [favoriteTeams, updateUserProfile, userProfile]);

  // Fetch team details with smart enhancements - MOVED UP
  const fetchTeamDetails = useCallback(async (teamId) => {
    try {
      // In a real implementation, this would fetch additional team details
      const team = teams.find(t => t.id === teamId);
      if (team) {
        setSelectedTeam(team);
      }
    } catch (err) {
      console.error("Error fetching team details:", err);
      setError("Failed to load team details. Please try again.");
    }
  }, [teams]);

  // Handle team selection - FIXED DEPENDENCY
  const handleTeamClick = useCallback((team) => {
    fetchTeamDetails(team.id);
  }, [fetchTeamDetails]);

  // Smart recommendation engine
  const generatePersonalizedRecommendations = useCallback(() => {
    const recommendations = [];

    if (favoriteTeams.length === 0) {
      recommendations.push({
        type: 'get_started',
        title: '⭐ Start Following Teams',
        description: 'Add your favorite teams to get personalized insights and recommendations',
        action: () => {
          const topTeam = teams.find(t => t.ranking === 1);
          if (topTeam) handleToggleFavorite(topTeam.shortName);
        }
      });
    }

    if (selectedTeam && !favoriteTeams.includes(selectedTeam.shortName)) {
      recommendations.push({
        type: 'add_favorite',
        title: `❤️ Follow ${selectedTeam.shortName}`,
        description: `Add ${selectedTeam.name} to your favorites to track their progress`,
        action: () => handleToggleFavorite(selectedTeam.shortName)
      });
    }

    // Recommend teams based on current selection
    if (selectedTeam) {
      const sameConferenceTeams = teams.filter(t =>
        t.conference === selectedTeam.conference && t.id !== selectedTeam.id
      );

      if (sameConferenceTeams.length > 0) {
        const rivalTeam = sameConferenceTeams[0];
        recommendations.push({
          type: 'conference_rival',
          title: `🔥 Conference Rival: ${rivalTeam.shortName}`,
          description: `Check out ${rivalTeam.name}, another strong ${selectedTeam.conference} team`,
          action: () => handleTeamClick(rivalTeam)
        });
      }
    }

    // Recommend upset potential
    const underdogTeams = teams.filter(t => t.seed > 8 && t.winPct > 0.75);
    if (underdogTeams.length > 0) {
      recommendations.push({
        type: 'upset_special',
        title: '🎯 Upset Special',
        description: `${underdogTeams[0].shortName} could be a dark horse with their ${Math.round(underdogTeams[0].winPct * 100)}% win rate`,
        action: () => handleTeamClick(underdogTeams[0])
      });
    }

    setPersonalizedRecommendations(recommendations.slice(0, 3));
  }, [teams, selectedTeam, favoriteTeams, handleTeamClick, handleToggleFavorite]);

  // Fetch all teams with smart enhancements
  const fetchTeams = useCallback(async () => {
    setTeamsLoading(true);
    setError(null);

    try {
      console.log(`🎯 Fetching ${currentSport} teams`);

      const firebaseTeams = await getFirebaseTeams(currentSport);
      setTeams(firebaseTeams);
      setLastRefreshTime(new Date());

      // Generate team insights
      const insights = {};
      firebaseTeams.forEach(team => {
        insights[team.id] = {
          momentum: team.winPct > 0.8 ? 'High' : team.winPct > 0.6 ? 'Medium' : 'Low',
          upsetPotential: team.seed > 8 && team.winPct > 0.75 ? 'High' : 'Low',
          strengthScore: Math.round((team.winPct * 0.4 + (team.seed ? (1 - team.seed / 16) : 0.5) * 0.3 + 0.3) * 100)
        };
      });
      setTeamInsights(insights);

    } catch (err) {
      console.error(`Error fetching ${currentSport} teams:`, err);
      setError(`Failed to load ${currentSport} teams. Please try again.`);
    } finally {
      setTeamsLoading(false);
    }
  }, [currentSport, getFirebaseTeams]);

  // Initial load
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams, currentSport]);

  // Generate recommendations when data changes - FIXED DEPENDENCY
  useEffect(() => {
    if (teams.length > 0) {
      generatePersonalizedRecommendations();
    }
  }, [generatePersonalizedRecommendations, teams.length]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchTeams();
    if (selectedTeam) {
      fetchTeamDetails(selectedTeam.id);
    }
  };

  // Get unique conferences for filter
  const conferences = [...new Set(teams.map(t => t.conference))].sort();

  const filteredTeams = getFilteredAndSortedTeams();

  return (
    <div className="teams-page">
      <div className="teams-header">
        <h2>
          {currentSport === 'basketball' ? '🏀' : '⚾'}
          {currentSport === 'basketball' ? ' March Madness' : ' College World Series'} Teams
        </h2>
        <div className="header-controls">
          <button
            className="refresh-button"
            onClick={handleRefresh}
            disabled={teamsLoading}
          >
            {teamsLoading ? 'Refreshing...' : 'Refresh Teams'}
          </button>
          {lastRefreshTime && (
            <div className="last-updated">
              Last updated: {lastRefreshTime.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Smart user welcome */}
      {user && (
        <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
          Welcome back, {userProfile?.username || user.displayName || 'Fan'}!
          {favoriteTeams.length > 0 && (
            <span> Following {favoriteTeams.length} team{favoriteTeams.length !== 1 ? 's' : ''}: {favoriteTeams.join(', ')}</span>
          )}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="error-message" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Smart Personalized Recommendations */}
      {personalizedRecommendations.length > 0 && (
        <div style={{
          background: 'linear-gradient(45deg, rgba(255, 193, 7, 0.1), rgba(26, 115, 232, 0.1))',
          border: '1px solid rgba(255, 193, 7, 0.2)',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>✨ Recommended for You</h4>
          {personalizedRecommendations.map((rec, index) => (
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

      {/* Smart Search and Filter Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px',
        padding: '15px',
        background: 'rgba(248, 249, 250, 0.7)',
        borderRadius: '8px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>🔍 Search Teams</label>
          <input
            type="text"
            placeholder="Search by name, coach, or conference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>🏆 Conference</label>
          <select
            value={conferenceFilter}
            onChange={(e) => setConferenceFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="all">All Conferences</option>
            {conferences.map(conf => (
              <option key={conf} value={conf}>{conf}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>📊 Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="name">Team Name</option>
            <option value="ranking">National Ranking</option>
            <option value="seed">Tournament Seed</option>
            <option value="wins">Most Wins</option>
            <option value="winPct">Win Percentage</option>
          </select>
        </div>
      </div>

      <div className="teams-content">
        {/* Enhanced Teams List */}
        <div className="teams-list">
          {teamsLoading ? (
            <div className="loading-message">
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>🏀</div>
              Loading teams...
            </div>
          ) : (
            <>
              <div className="teams-count">
                {filteredTeams.length} Team{filteredTeams.length !== 1 ? 's' : ''}
                {searchQuery && ` • Filtered by "${searchQuery}"`}
                {conferenceFilter !== "all" && ` • ${conferenceFilter} only`}
              </div>
              <div className="teams-list-content">
                {filteredTeams.map((team) => (
                  <div
                    key={team.id}
                    className={`team-item ${selectedTeam?.id === team.id ? "selected" : ""}`}
                    onClick={() => handleTeamClick(team)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div className="team-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {team.name}
                          {favoriteTeams.includes(team.shortName) && (
                            <span style={{ color: '#e63946', fontSize: '14px' }}>❤️</span>
                          )}
                          {team.ranking <= 5 && (
                            <span style={{
                              background: '#FFD700',
                              color: '#000',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold'
                            }}>
                              #{team.ranking}
                            </span>
                          )}
                        </div>
                        <div className="team-conference">{team.conference} • {team.coach}</div>
                        <div className="team-seed">
                          Seed: {team.seed} • {team.wins}-{team.losses} ({Math.round(team.winPct * 100)}%)
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(team.shortName);
                        }}
                        style={{
                          background: favoriteTeams.includes(team.shortName) ? '#e63946' : 'transparent',
                          border: `1px solid ${favoriteTeams.includes(team.shortName) ? '#e63946' : '#ddd'}`,
                          color: favoriteTeams.includes(team.shortName) ? 'white' : '#666',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {favoriteTeams.includes(team.shortName) ? '❤️ Following' : '+ Follow'}
                      </button>
                    </div>

                    {/* Smart team insights */}
                    {teamInsights[team.id] && (
                      <div style={{
                        marginTop: '8px',
                        fontSize: '11px',
                        color: '#666',
                        display: 'flex',
                        gap: '10px',
                        flexWrap: 'wrap'
                      }}>
                        <span>💪 Strength: {teamInsights[team.id].strengthScore}/100</span>
                        <span>📈 Momentum: {teamInsights[team.id].momentum}</span>
                        {teamInsights[team.id].upsetPotential === 'High' && (
                          <span style={{ color: '#e63946' }}>🎯 Upset Potential</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Enhanced Team Details */}
        {selectedTeam ? (
          <div className="team-details">
            <div className="team-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>{selectedTeam.name}</h3>
                {selectedTeam.seed && (
                  <div className="team-seed-badge">Seed: {selectedTeam.seed}</div>
                )}
                {selectedTeam.ranking <= 10 && (
                  <div style={{
                    background: '#FFD700',
                    color: '#000',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    Ranked #{selectedTeam.ranking}
                  </div>
                )}
                <button
                  onClick={() => handleToggleFavorite(selectedTeam.shortName)}
                  style={{
                    background: favoriteTeams.includes(selectedTeam.shortName) ? '#e63946' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {favoriteTeams.includes(selectedTeam.shortName) ? '❤️ Following' : '+ Follow'}
                </button>
              </div>

              {/* Smart team insights bar */}
              {teamInsights[selectedTeam.id] && (
                <div style={{
                  background: 'rgba(26, 115, 232, 0.1)',
                  padding: '10px',
                  borderRadius: '6px',
                  marginBottom: '15px',
                  fontSize: '13px'
                }}>
                  <strong>🧠 Smart Analysis:</strong> {teamInsights[selectedTeam.id].momentum} momentum team with {teamInsights[selectedTeam.id].strengthScore}/100 strength score
                  {teamInsights[selectedTeam.id].upsetPotential === 'High' && (
                    <span style={{ color: '#e63946', marginLeft: '10px' }}>• High upset potential! 🎯</span>
                  )}
                </div>
              )}
            </div>

            {/* Enhanced Team Information */}
            <div className="team-info-section">
              <h4>📊 Team Information</h4>
              <div className="info-group">
                <div className="info-item">
                  <label>Head Coach:</label>
                  <span>{selectedTeam.coach}</span>
                </div>
                <div className="info-item">
                  <label>Record:</label>
                  <span>{selectedTeam.wins}-{selectedTeam.losses} ({Math.round(selectedTeam.winPct * 100)}%)</span>
                </div>
                <div className="info-item">
                  <label>Location:</label>
                  <span>{selectedTeam.location}</span>
                </div>
                <div className="info-item">
                  <label>Arena:</label>
                  <span>{selectedTeam.arena} ({selectedTeam.capacity?.toLocaleString()} capacity)</span>
                </div>
                <div className="info-item">
                  <label>Founded:</label>
                  <span>{selectedTeam.founded}</span>
                </div>
                <div className="info-item">
                  <label>Mascot:</label>
                  <span>{selectedTeam.mascot}</span>
                </div>
                <div className="info-item">
                  <label>Colors:</label>
                  <span>{selectedTeam.colors?.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Team Strengths and Weaknesses */}
            <div className="team-info-section">
              <h4>⚖️ Team Analysis</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <h5 style={{ color: '#28a745', margin: '0 0 8px 0' }}>💪 Strengths</h5>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '14px' }}>
                    {selectedTeam.strengths?.map((strength, index) => (
                      <li key={index} style={{ marginBottom: '4px' }}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 style={{ color: '#dc3545', margin: '0 0 8px 0' }}>⚠️ Areas to Improve</h5>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '14px' }}>
                    {selectedTeam.weaknesses?.map((weakness, index) => (
                      <li key={index} style={{ marginBottom: '4px' }}>{weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Enhanced Players Section */}
            {selectedTeam.players && selectedTeam.players.length > 0 ? (
              <div className="team-players-section">
                <h4>🏀 Key Players</h4>
                {teamInsights[selectedTeam.id]?.keyPlayer && (
                  <div style={{
                    background: 'rgba(255, 193, 7, 0.1)',
                    padding: '8px',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    fontSize: '13px',
                    border: '1px solid rgba(255, 193, 7, 0.2)'
                  }}>
                    ⭐ <strong>Star Player:</strong> {teamInsights[selectedTeam.id].keyPlayer.name} averaging {teamInsights[selectedTeam.id].keyPlayer.ppg} PPG
                  </div>
                )}
                <div className="players-list">
                  {selectedTeam.players.map((player) => (
                    <div key={player.id} className="player-item" style={{ position: 'relative' }}>
                      <div className="player-name">
                        {player.name}
                        {teamInsights[selectedTeam.id]?.keyPlayer?.id === player.id && (
                          <span style={{ color: '#FFD700', marginLeft: '5px' }}>⭐</span>
                        )}
                      </div>
                      <div className="player-position">{player.position} • {player.year}</div>
                      <div style={{
                        fontSize: '12px',
                        color: '#666',
                        marginTop: '4px',
                        display: 'flex',
                        gap: '8px'
                      }}>
                        <span>📊 {player.ppg} PPG</span>
                        <span>🔄 {player.rpg} RPG</span>
                        <span>🎯 {player.apg} APG</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-players-message">
                No player information available
              </div>
            )}

            {/* Recent Games Section */}
            {selectedTeam.recentGames && selectedTeam.recentGames.length > 0 ? (
              <div className="team-games-section">
                <h4>📅 Recent Games</h4>
                <div className="games-list">
                  {selectedTeam.recentGames.map((game) => (
                    <div key={game.id} className="game-item">
                      <div className="game-teams">
                        <strong>{selectedTeam.shortName}</strong> vs <strong>{game.opponent}</strong>
                      </div>
                      <div className="game-info">
                        <span className="game-date">
                          {new Date(game.date).toLocaleDateString()}
                        </span>
                        <span className={`game-result ${game.result === 'W' ? 'win' : 'loss'}`}>
                          {game.result === 'W' ? '✅' : '❌'} {game.result}
                        </span>
                      </div>
                      <div className="game-score">
                        Score: {game.score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-games-message">
                No recent game information available
              </div>
            )}

            {/* Smart Action Buttons */}
            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: 'rgba(248, 249, 250, 0.7)',
              borderRadius: '8px',
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => handleToggleFavorite(selectedTeam.shortName)}
                style={{
                  background: favoriteTeams.includes(selectedTeam.shortName) ? '#e63946' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {favoriteTeams.includes(selectedTeam.shortName) ? '💔 Unfollow' : '❤️ Follow Team'}
              </button>

              {selectedTeam.conference && (
                <button
                  onClick={() => setConferenceFilter(selectedTeam.conference)}
                  style={{
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  🏆 View {selectedTeam.conference} Teams
                </button>
              )}

              <button
                onClick={() => setSortBy('ranking')}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                📊 Compare Rankings
              </button>
            </div>
          </div>
        ) : (
          <div className="no-team-selected">
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🏀</div>
              <h3>Select a Team</h3>
              <p>Choose a team from the list to view detailed information, player stats, and recent games.</p>
              {favoriteTeams.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Your Favorite Teams:</h4>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {favoriteTeams.map(teamName => {
                      const team = teams.find(t => t.shortName === teamName);
                      return team ? (
                        <button
                          key={teamName}
                          onClick={() => handleTeamClick(team)}
                          style={{
                            background: '#e63946',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          ❤️ {teamName}
                        </button>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Smart Summary Footer */}
      <div style={{
        marginTop: '30px',
        padding: '15px',
        background: 'rgba(108, 117, 125, 0.1)',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#666',
        textAlign: 'center'
      }}>
        <strong>🏀 March Madness 2025:</strong> Following {favoriteTeams.length} teams •
        Viewing {filteredTeams.length} of {teams.length} total teams •
        {conferences.length} conferences represented
        {user && (
          <div style={{ marginTop: '5px' }}>
            Signed in as {userProfile?.username || user.displayName || 'Fan'} •
            Personalized recommendations enabled ✨
          </div>
        )}
      </div>

      <style jsx>{`
        .game-result.win {
          color: #28a745;
          font-weight: bold;
        }
        
        .game-result.loss {
          color: #dc3545;
          font-weight: bold;
        }
        
        .player-item:hover {
          background: rgba(26, 115, 232, 0.05);
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .team-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 768px) {
          .info-group {
            grid-template-columns: 1fr;
          }
          
          .teams-content {
            flex-direction: column;
          }
          
          .teams-list {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 1rem;
            margin-bottom: 1rem;
          }
          
          .team-details {
            padding-left: 0;
            padding-top: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default TeamsPage;