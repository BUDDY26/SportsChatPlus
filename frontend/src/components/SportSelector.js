// SportSelector.js - Add this as a new component
import React from 'react';

const SportSelector = ({ currentSport, onSportChange }) => {
  const sports = [
    { 
      key: 'basketball', 
      name: 'March Madness', 
      icon: '🏀',
      season: '2025 NCAA Basketball Tournament'
    },
    { 
      key: 'baseball', 
      name: 'College World Series', 
      icon: '⚾',
      season: '2025 NCAA Baseball Tournament'
    }
  ];

  return (
    <div className="sport-selector">
      <label style={{ 
        fontSize: '12px', 
        color: 'var(--text-light)', 
        marginBottom: '5px',
        display: 'block'
      }}>
        Tournament:
      </label>
      <div style={{ display: 'flex', gap: '8px' }}>
        {sports.map(sport => (
          <button
            key={sport.key}
            onClick={() => onSportChange(sport.key)}
            className={`sport-button ${currentSport === sport.key ? 'active' : ''}`}
            title={sport.season}
          >
            <span className="sport-icon">{sport.icon}</span>
            <span className="sport-name">{sport.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SportSelector;