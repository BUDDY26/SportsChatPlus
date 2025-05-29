import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from '../contexts/AuthContext';
import "./style.css";

const TeamsPage = () => {
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

  // Smart mock data with comprehensive team information
  const getSmartMockTeams = useCallback(() => {
    return [
      {
        id: 1,
        name: "Duke Blue Devils",
        shortName: "Duke",
        conference: "ACC",
        seed: 1,
        coach: "Jon Scheyer",
        wins: 28,
        losses: 4,
        winPct: 0.875,
        ranking: 1,
        location: "Durham, NC",
        founded: 1838,
        colors: ["Duke Blue", "White"],
        mascot: "Blue Devil",
        arena: "Cameron Indoor Stadium",
        capacity: 9314,
        players: [
          { id: 1, name: "Tyler Johnson", position: "PG", year: "Junior", ppg: 24.8, rpg: 6.2, apg: 8.1 },
          { id: 2, name: "Marcus Thompson", position: "SF", year: "Senior", ppg: 18.9, rpg: 7.4, apg: 3.2 },
          { id: 3, name: "David Wilson", position: "C", year: "Sophomore", ppg: 16.2, rpg: 9.8, apg: 1.9 }
        ],
        recentGames: [
          { id: 1, opponent: "North Carolina", result: "W", score: "94-91", date: "2025-03-15" },
          { id: 2, opponent: "Virginia", result: "W", score: "78-65", date: "2025-03-12" }
        ],
        strengths: ["Offensive firepower", "Experienced coaching", "Strong home court advantage"],
        weaknesses: ["Defensive consistency", "Depth concerns"]
      },
      {
        id: 2,
        name: "North Carolina Tar Heels",
        shortName: "UNC",
        conference: "ACC",
        seed: 2,
        coach: "Hubert Davis",
        wins: 26,
        losses: 6,
        winPct: 0.812,
        ranking: 3,
        location: "Chapel Hill, NC",
        founded: 1789,
        colors: ["Carolina Blue", "White"],
        mascot: "Rameses",
        arena: "Dean Smith Center",
        capacity: 21750,
        players: [
          { id: 4, name: "Marcus Williams", position: "PF", year: "Senior", ppg: 22.3, rpg: 11.5, apg: 3.4 },
          { id: 5, name: "Alex Davis", position: "SG", year: "Junior", ppg: 19.1, rpg: 4.6, apg: 5.8 },
          { id: 6, name: "Ryan Mitchell", position: "C", year: "Freshman", ppg: 12.7, rpg: 8.2, apg: 1.3 }
        ],
        recentGames: [
          { id: 3, opponent: "Duke", result: "L", score: "91-94", date: "2025-03-15" },
          { id: 4, opponent: "NC State", result: "W", score: "85-72", date: "2025-03-10" }
        ],
        strengths: ["Rebounding dominance", "Fast break offense", "Veteran leadership"],
        weaknesses: ["Three-point shooting", "Turnovers"]
      },
      {
        id: 3,
        name: "Gonzaga Bulldogs",
        shortName: "Gonzaga",
        conference: "WCC",
        seed: 1,
        coach: "Mark Few",
        wins: 29,
        losses: 3,
        winPct: 0.906,
        ranking: 2,
        location: "Spokane, WA",
        founded: 1887,
        colors: ["Navy Blue", "Silver"],
        mascot: "Spike the Bulldog",
        arena: "McCarthey Athletic Center",
        capacity: 6000,
        players: [
          { id: 7, name: "Ryan Martinez", position: "SF", year: "Senior", ppg: 19.6, rpg: 9.4, apg: 4.2 },
          { id: 8, name: "Jake Peterson", position: "PG", year: "Junior", ppg: 17.8, rpg: 3.9, apg: 9.1 },
          { id: 9, name: "Connor Brown", position: "C", year: "Sophomore", ppg: 15.4, rpg: 10.6, apg: 2.1 }
        ],
        recentGames: [
          { id: 5, opponent: "Saint Mary's", result: "W", score: "88-76", date: "2025-03-14" },
          { id: 6, opponent: "BYU", result: "W", score: "92-68", date: "2025-03-11" }
        ],
        strengths: ["Balanced scoring", "Team chemistry", "Coaching excellence"],
        weaknesses: ["Lack of marquee wins", "Conference strength"]
      },
      {
        id: 4,
        name: "Kansas Jayhawks",
        shortName: "Kansas",
        conference: "Big 12",
        seed: 1,
        coach: "Bill Self",
        wins: 27,
        losses: 5,
        winPct: 0.844,
        ranking: 4,
        location: "Lawrence, KS",
        founded: 1865,
        colors: ["Crimson", "Blue"],
        mascot: "Big Jay",
        arena: "Allen Fieldhouse",
        capacity: 16300,
        players: [
          { id: 10, name: "Jordan Davis", position: "PG", year: "Senior", ppg: 21.9, rpg: 4.3, apg: 7.8 },
          { id: 11, name: "Michael Johnson", position: "PF", year: "Junior", ppg: 18.2, rpg: 8.7, apg: 2.9 },
          { id: 12, name: "Chris Wilson", position: "C", year: "Sophomore", ppg: 14.6, rpg: 9.3, apg: 1.6 }
        ],
        recentGames: [
          { id: 7, opponent: "Texas", result: "W", score: "81-75", date: "2025-03-13" },
          { id: 8, opponent: "Baylor", result: "L", score: "72-76", date: "2025-03-09" }
        ],
        strengths: ["Tournament experience", "Depth", "Allen Fieldhouse advantage"],
        weaknesses: ["Inconsistent shooting", "Youth at key positions"]
      },
      {
        id: 5,
        name: "Kentucky Wildcats",
        shortName: "Kentucky",
        conference: "SEC",
        seed: 3,
        coach: "John Calipari",
        wins: 24,
        losses: 8,
        winPct: 0.750,
        ranking: 6,
        location: "Lexington, KY",
        founded: 1865,
        colors: ["Blue", "White"],
        mascot: "Wildcat",
        arena: "Rupp Arena",
        capacity: 23500,
        players: [
          { id: 13, name: "Antonio Reed", position: "SG", year: "Freshman", ppg: 20.1, rpg: 5.2, apg: 4.7 },
          { id: 14, name: "Tyler Washington", position: "PF", year: "Sophomore", ppg: 16.8, rpg: 8.9, apg: 2.3 },
          { id: 15, name: "Malik Jackson", position: "C", year: "Freshman", ppg: 13.9, rpg: 7.6, apg: 1.1 }
        ],
        recentGames: [
          { id: 9, opponent: "Tennessee", result: "W", score: "79-74", date: "2025-03-12" },
          { id: 10, opponent: "Auburn", result: "L", score: "68-73", date: "2025-03-08" }
        ],
        strengths: ["Recruiting talent", "Athletic ability", "Big Blue Nation support"],
        weaknesses: ["Team chemistry", "Experience", "Consistency"]
      },
      {
        id: 6,
        name: "Arizona Wildcats",
        shortName: "Arizona",
        conference: "Pac-12",
        seed: 2,
        coach: "Tommy Lloyd",
        wins: 25,
        losses: 7,
        winPct: 0.781,
        ranking: 5,
        location: "Tucson, AZ",
        founded: 1885,
        colors: ["Cardinal Red", "Navy Blue"],
        mascot: "Wilbur & Wilma Wildcat",
        arena: "McKale Center",
        capacity: 14644,
        players: [
          { id: 16, name: "Chris Anderson", position: "PG", year: "Junior", ppg: 20.1, rpg: 5.1, apg: 6.9 },
          { id: 17, name: "Isaiah Thompson", position: "SF", year: "Senior", ppg: 17.4, rpg: 6.8, apg: 3.5 },
          { id: 18, name: "Darius Williams", position: "C", year: "Junior", ppg: 15.2, rpg: 9.1, apg: 1.8 }
        ],
        recentGames: [
          { id: 11, opponent: "UCLA", result: "W", score: "84-76", date: "2025-03-14" },
          { id: 12, opponent: "Oregon", result: "W", score: "77-69", date: "2025-03-11" }
        ],
        strengths: ["Balanced attack", "Defensive intensity", "Pac-12 dominance"],
        weaknesses: ["Road performance", "Free throw shooting"]
      }
    ];
  }, []);

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

  // Handle team selection
  const handleTeamClick = useCallback((team) => {
    fetchTeamDetails(team.id);
  }, []);

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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTeams = getSmartMockTeams();
      setTeams(mockTeams);
      setLastRefreshTime(new Date());
      
      // Generate team insights
      const insights = {};
      mockTeams.forEach(team => {
        insights[team.id] = {
          momentum: team.winPct > 0.8 ? 'High' : team.winPct > 0.6 ? 'Medium' : 'Low',
          upsetPotential: team.seed > 8 && team.winPct > 0.75 ? 'High' : 'Low',
          keyPlayer: team.players.reduce((prev, current) => (prev.ppg > current.ppg) ? prev : current),
          strengthScore: Math.round((team.winPct * 0.4 + (1 - team.seed / 16) * 0.3 + (team.ranking <= 10 ? 1 : 0.5) * 0.3) * 100)
        };
      });
      setTeamInsights(insights);
      
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError("Failed to load teams. Please try again.");
    } finally {
      setTeamsLoading(false);
    }
  }, [getSmartMockTeams]);

  // Fetch team details with smart enhancements
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

  // Initial load
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Generate recommendations when data changes
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
        <h2>🏀 Tournament Teams</h2>
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
                  <label>Conference:</label>
                  <span>{selectedTeam.conference}</span>
                </div>
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