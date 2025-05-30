require("dotenv").config();

const axios = require("axios");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
}

const db = admin.firestore();

// Get sport from command line or default to basketball
const SPORT = process.argv[2] || 'basketball';

console.log(`[${new Date().toISOString()}] 🚀 Starting NCAA ${SPORT.toUpperCase()} Data Fetcher`);
console.log(`Target: Populate database while you build the app`);

// API Endpoints - FIXED FOR BASEBALL
const NCAA_API_ENDPOINTS = {
  basketball: "https://ncaa-api.henrygd.me/scoreboard/basketball-men/d1/march-madness",
  baseball: "https://ncaa-api.henrygd.me/scoreboard/baseball/d1"  // CORRECT BASEBALL ENDPOINT
};

// Collections mapping for both sports
const COLLECTIONS = {
  basketball: {
    games: 'games',           // Your existing collection
    teams: 'teams',           // Your existing collection
    players: 'players',       // Your existing collection
    gameStats: 'gameStats'    // Your existing collection
  },
  baseball: {
    games: 'baseballGames',
    teams: 'baseballTeams', 
    players: 'baseballPlayers',
    gameStats: 'baseballGameStats'
  }
};

// Fetch intervals based on activity
const FETCH_INTERVALS = {
  LIVE_GAMES: 2 * 60 * 1000,      // 2 minutes when games are live
  UPCOMING_GAMES: 10 * 60 * 1000, // 10 minutes when games start soon
  TOURNAMENT_ACTIVE: 30 * 60 * 1000, // 30 minutes during tournament
  OFF_SEASON: 4 * 60 * 60 * 1000  // 4 hours when no tournament
};

class NCAADataFetcher {
  constructor(sport) {
    this.sport = sport;
    this.collections = COLLECTIONS[sport];
    this.apiEndpoint = NCAA_API_ENDPOINTS[sport];
    this.isRunning = false;
    this.fetchCount = 0;
    this.lastFetchTime = null;
    this.currentTimer = null;
    
    if (!this.apiEndpoint) {
      throw new Error(`Invalid sport: ${sport}. Use 'basketball' or 'baseball'`);
    }
  }

  // Start the fetcher
  async start() {
    if (this.isRunning) {
      console.log("⚠️ Fetcher already running");
      return;
    }

    console.log(`🎯 Starting ${this.sport} data fetcher...`);
    this.isRunning = true;

    try {
      // Test database connection
      await this.testConnection();
      
      // Initial fetch
      await this.fetchData();
      
      // Schedule recurring fetches
      await this.scheduleNext();
      
      console.log(`✅ ${this.sport} fetcher is now running!`);
      console.log(`📊 Database will be populated automatically`);
      console.log(`🔄 Fetch frequency adjusts based on game activity`);
      console.log(`⏭️ Skips placeholder TBA games until real tournament data is available`);
      
    } catch (error) {
      console.error(`❌ Failed to start fetcher:`, error);
      this.isRunning = false;
    }
  }

  // Test database connection
  async testConnection() {
    try {
      const testRef = db.collection('test').doc('fetcher_test');
      await testRef.set({ 
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        sport: this.sport,
        test: true 
      });
      await testRef.delete();
      console.log("✅ Database connection successful");
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      throw error;
    }
  }

  // Main data fetching method
  async fetchData() {
    const startTime = Date.now();
    this.fetchCount++;
    
    try {
      console.log(`\n📡 [Fetch #${this.fetchCount}] Getting ${this.sport} data...`);
      
      // Get data from NCAA API
      const response = await axios.get(this.apiEndpoint, { 
        timeout: 30000,
        headers: {
          'User-Agent': 'SportsChat+ NCAA Fetcher 1.0'
        }
      });
      
      if (!response.data || !response.data.games) {
        console.log(`❌ No games data received from API`);
        return { success: false, error: 'No games data' };
      }

      console.log(`📋 Received ${response.data.games.length} games from API`);

      // Process the games
      const results = await this.processGames(response.data.games);
      
      // Update last fetch time
      this.lastFetchTime = new Date();
      
      // Log results
      const duration = Date.now() - startTime;
      console.log(`✅ Fetch completed in ${duration}ms`);
      console.log(`   📈 New: ${results.newGames}, Updated: ${results.updatedGames}, Skipped: ${results.skippedGames}`);
      
      // Log to database for monitoring
      await this.logFetchResult(results, duration);
      
      return { success: true, results, duration };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Fetch failed after ${duration}ms:`, error.message);
      
      await this.logFetchResult({ error: error.message }, duration);
      return { success: false, error: error.message, duration };
    }
  }

  // Process games from API response - FIXED ROUND FILTER
  async processGames(games) {
    const results = { newGames: 0, updatedGames: 0, skippedGames: 0, errors: 0, placeholderSkipped: 0 };
    
    for (const gameItem of games) {
      try {
        const gameData = gameItem.game;
        if (!gameData) {
          results.errors++;
          continue;
        }

        // Extract ALL data first to avoid variable scope issues
        const team1Name = gameData.away?.names?.full || gameData.away?.names?.short;
        const team2Name = gameData.home?.names?.full || gameData.home?.names?.short;
        const team1Score = parseInt(gameData.away?.score) || 0;
        const team2Score = parseInt(gameData.home?.score) || 0;
        const gameState = gameData.gameState || 'unknown';
        const round = gameData.bracketRound || 'Unknown Round';
        const location = gameData.venue?.name || 'Unknown Location';
        const gameDate = this.parseGameDate(gameData.startDate);
        
        // Basic validation
        if (!team1Name || !team2Name) {
          results.errors++;
          continue;
        }

        // 🔧 FILTER 1: Skip placeholder/TBA games
        if (team1Name === 'TBA' || team2Name === 'TBA' ||
            team1Name.includes('TBA') || team2Name.includes('TBA') ||
            team1Name.toLowerCase().includes('tba') || team2Name.toLowerCase().includes('tba')) {
          console.log(`⏭️ Skipping placeholder game: ${team1Name} vs ${team2Name}`);
          results.placeholderSkipped++;
          continue;
        }

        // 🔧 FILTER 2: Skip template games
        if (team1Name.includes('vs') || team2Name.includes('vs') ||
            team1Name === 'Unknown' || team2Name === 'Unknown') {
          console.log(`⏭️ Skipping template game: ${team1Name} vs ${team2Name}`);
          results.placeholderSkipped++;
          continue;
        }

        // 🎯 FILTER 3: Tournament date filter - Only games from May 30, 2025 forward
        const tournamentStartDate = new Date('2025-05-30');
        if (gameDate < tournamentStartDate) {
          console.log(`⏭️ Skipping old game: ${team1Name} vs ${team2Name} (Date: ${gameDate.toDateString()})`);
          results.placeholderSkipped++;
          continue;
        }

        // 🏆 FILTER 4: Tournament round filter - FIXED TO INCLUDE REGIONALS
        const roundLower = round.toLowerCase();
        if (!round || (!roundLower.includes('regional') && 
                      !roundLower.includes('regionals') &&  // FIXED: Added plural
                      !roundLower.includes('super regional') &&
                      !roundLower.includes('super regionals') &&  // FIXED: Added plural
                      !roundLower.includes('college world series') &&
                      !roundLower.includes('cws') &&
                      !roundLower.includes('championship') &&
                      !roundLower.includes('final'))) {
          console.log(`⏭️ Skipping non-tournament game: ${team1Name} vs ${team2Name} (Round: ${round})`);
          results.placeholderSkipped++;
          continue;
        }

        // Passed all filters - process this game
        console.log(`✅ Processing tournament game: ${team1Name} vs ${team2Name} (${round})`);

        // Create game identifier for duplicate detection
        const gameIdentifier = `${team1Name}_${team2Name}_${gameDate.toISOString().split('T')[0]}`;

        // Check if game already exists
        const existingGameQuery = await db.collection(this.collections.games)
          .where('gameIdentifier', '==', gameIdentifier)
          .limit(1)
          .get();

        let needsUpdate = true;
        let isNewGame = existingGameQuery.empty;

        if (!isNewGame) {
          // Check if update is needed
          const existingGame = existingGameQuery.docs[0].data();
          const lastScores = this.getExistingScores(existingGame);
          
          // Skip if scores haven't changed and updated recently
          if (lastScores[0] === team1Score && lastScores[1] === team2Score) {
            const lastUpdated = this.getLastUpdated(existingGame);
            if (lastUpdated && (Date.now() - lastUpdated.getTime()) < 5 * 60 * 1000) {
              needsUpdate = false;
            }
          }
        }

        if (!needsUpdate) {
          results.skippedGames++;
          continue;
        }

        // Prepare game document
        const gameDoc = this.createGameDocument(
          team1Name, team2Name, team1Score, team2Score,
          gameState, round, location, gameDate, gameIdentifier
        );

        // Save or update game
        if (isNewGame) {
          await db.collection(this.collections.games).add(gameDoc);
          results.newGames++;
          console.log(`  ➕ NEW: ${team1Name} vs ${team2Name} (${round})`);
        } else {
          const gameDocRef = existingGameQuery.docs[0].ref;
          await gameDocRef.update(gameDoc);
          results.updatedGames++;
          console.log(`  🔄 UPDATE: ${team1Name} vs ${team2Name} (${team1Score}-${team2Score})`);
        }

        // Create teams if they don't exist
        await this.ensureTeamsExist(team1Name, team2Name, gameData);

      } catch (gameError) {
        console.error(`❌ Error processing game:`, gameError.message);
        results.errors++;
      }
    }

    // Enhanced logging with filter info
    if (results.placeholderSkipped > 0) {
      console.log(`⏭️ Skipped ${results.placeholderSkipped} placeholder/TBA/old/non-tournament games`);
    }

    return results;
  }

  // FIXED: Baseball schema to match existing basketball schema
  createGameDocument(team1Name, team2Name, team1Score, team2Score, gameState, round, location, gameDate, gameIdentifier) {
    const baseDoc = {
      gameIdentifier,
      LastUpdated: admin.firestore.FieldValue.serverTimestamp() // Match basketball
    };

    if (this.sport === 'basketball') {
      // Keep existing basketball structure (no changes)
      return {
        ...baseDoc,
        Team1Name: team1Name,
        Team2Name: team2Name,
        ScoreTeam1: team1Score,
        ScoreTeam2: team2Score,
        GameState: gameState,
        Round: round,
        DatePlayed: admin.firestore.Timestamp.fromDate(gameDate),
        Location: location
      };
    } else {
      // FIXED: Baseball now uses SAME field names as basketball
      return {
        ...baseDoc,
        Team1Name: team1Name,        // ✅ Now matches basketball
        Team2Name: team2Name,        // ✅ Now matches basketball
        ScoreTeam1: team1Score,      // ✅ Now matches basketball
        ScoreTeam2: team2Score,      // ✅ Now matches basketball
        GameState: gameState,        // ✅ Now matches basketball
        Round: round,                // ✅ Now matches basketball
        DatePlayed: admin.firestore.Timestamp.fromDate(gameDate), // ✅ Now matches basketball
        Location: location,          // ✅ Now matches basketball
        // Baseball-specific fields (optional additions)
        sport: 'baseball',
        inning: 0,
        isElimination: false
      };
    }
  }

  // FIXED: Also update team schema to match
  createTeamDocument(teamName, gameData) {
    if (this.sport === 'basketball') {
      // Keep existing basketball structure
      return {
        TeamName: teamName,
        CoachName: '',
        Conference: '',
        Wins: 0,
        Losses: 0,
        Seed: null,
        LastUpdated: admin.firestore.FieldValue.serverTimestamp()
      };
    } else {
      // FIXED: Baseball teams now use SAME field names as basketball
      return {
        TeamName: teamName,          // ✅ Now matches basketball (was: name)
        CoachName: '',               // ✅ Now matches basketball (was: coachName)
        Conference: '',              // ✅ Now matches basketball (was: conference)
        Wins: 0,                     // ✅ Now matches basketball (was: wins)
        Losses: 0,                   // ✅ Now matches basketball (was: losses)
        Seed: null,                  // ✅ Now matches basketball (was: seed)
        LastUpdated: admin.firestore.FieldValue.serverTimestamp(), // ✅ Now matches basketball
        // Baseball-specific fields (optional additions)
        sport: 'baseball',
        region: ''
      };
    }
  }

  // FIXED: Update team query to use consistent field name
  async ensureTeamsExist(team1Name, team2Name, gameData) {
    try {
      for (const teamName of [team1Name, team2Name]) {
        const teamQuery = await db.collection(this.collections.teams)
          .where('TeamName', '==', teamName)  // ✅ Now same for both sports
          .limit(1)
          .get();

        if (teamQuery.empty) {
          const teamDoc = this.createTeamDocument(teamName, gameData);
          await db.collection(this.collections.teams).add(teamDoc);
          console.log(`  👥 Created team: ${teamName}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error ensuring teams exist:`, error.message);
    }
  }

  // FIXED: Now works for both sports since they use same field names
  getExistingScores(gameDoc) {
    return [gameDoc.ScoreTeam1 || 0, gameDoc.ScoreTeam2 || 0];
  }

  // FIXED: Now works for both sports since they use same field names
  getLastUpdated(gameDoc) {
    return gameDoc.LastUpdated?.toDate();
  }

  // FIXED: Updated to use consistent field names
  async getOptimalInterval() {
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      // Check for live games - UNIFIED: Always use GameState
      const liveGamesQuery = await db.collection(this.collections.games)
        .where('GameState', '==', 'in-progress')
        .limit(1)
        .get();

      if (!liveGamesQuery.empty) {
        console.log(`🔴 Live ${this.sport} games detected - high frequency mode`);
        return FETCH_INTERVALS.LIVE_GAMES;
      }

      // Check for upcoming games - UNIFIED: Always use DatePlayed
      const upcomingGamesQuery = await db.collection(this.collections.games)
        .where('DatePlayed', '>', admin.firestore.Timestamp.fromDate(now))
        .where('DatePlayed', '<', admin.firestore.Timestamp.fromDate(oneHourFromNow))
        .limit(1)
        .get();

      if (!upcomingGamesQuery.empty) {
        console.log(`🟡 Upcoming ${this.sport} games - medium frequency mode`);
        return FETCH_INTERVALS.UPCOMING_GAMES;
      }

      // Check if in tournament season
      if (this.isInTournamentSeason()) {
        console.log(`🟢 ${this.sport} tournament season - normal frequency mode`);
        return FETCH_INTERVALS.TOURNAMENT_ACTIVE;
      }

      console.log(`⚪ ${this.sport} off-season - low frequency mode`);
      return FETCH_INTERVALS.OFF_SEASON;

    } catch (error) {
      console.error("Error determining fetch interval:", error);
      return FETCH_INTERVALS.TOURNAMENT_ACTIVE; // Default
    }
  }

  // Check if currently in tournament season
  isInTournamentSeason() {
    const now = new Date();
    const month = now.getMonth(); // 0-based

    if (this.sport === 'basketball') {
      // March Madness: March (2) and early April (3)
      return month === 2 || month === 3;
    } else {
      // College World Series: May (4) and June (5)
      return month === 4 || month === 5;
    }
  }

  // Schedule next fetch
  async scheduleNext() {
    try {
      if (this.currentTimer) {
        clearTimeout(this.currentTimer);
      }

      const intervalMs = await this.getOptimalInterval();
      const nextFetchTime = new Date(Date.now() + intervalMs);

      this.currentTimer = setTimeout(async () => {
        try {
          await this.fetchData();
          await this.scheduleNext(); // Schedule the next one
        } catch (error) {
          console.error(`❌ Error in scheduled fetch:`, error);
          // Retry in 5 minutes on error
          setTimeout(() => this.scheduleNext(), 5 * 60 * 1000);
        }
      }, intervalMs);

      console.log(`⏰ Next fetch scheduled for: ${nextFetchTime.toLocaleTimeString()}`);

    } catch (error) {
      console.error("Error scheduling next fetch:", error);
    }
  }

  // Parse game date from API
  parseGameDate(dateString) {
    try {
      if (!dateString) return new Date();
      
      // Handle MM-DD-YYYY format
      const [month, day, year] = dateString.split('-');
      return new Date(`${year}-${month}-${day}`);
    } catch (error) {
      return new Date();
    }
  }

  // Log fetch results for monitoring
  async logFetchResult(results, duration) {
    try {
      await db.collection('fetchLogs').add({
        sport: this.sport,
        results,
        duration,
        fetchCount: this.fetchCount,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        lastFetchTime: this.lastFetchTime
      });
    } catch (error) {
      console.error("Error logging fetch result:", error);
    }
  }

  // Stop the fetcher
  stop() {
    if (this.currentTimer) {
      clearTimeout(this.currentTimer);
      this.currentTimer = null;
    }
    this.isRunning = false;
    console.log(`⏹️ ${this.sport} fetcher stopped`);
  }

  // Get current status
  getStatus() {
    return {
      sport: this.sport,
      isRunning: this.isRunning,
      fetchCount: this.fetchCount,
      lastFetchTime: this.lastFetchTime,
      collections: this.collections
    };
  }
}

// Handle graceful shutdown
function setupShutdownHandlers(fetcher) {
  const shutdown = () => {
    console.log('\n🛑 Shutting down fetcher...');
    fetcher.stop();
    console.log('✅ Fetcher stopped gracefully');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Main execution
async function main() {
  try {
    console.log("🚀 Starting NCAA Data Fetcher for Database Population");
    console.log("🔧 FIXED: Tournament round filter now includes 'REGIONALS' (plural)");
    console.log("🎯 FIXED: Unified schema - baseball now matches basketball field names");
    console.log("✅ READY: Your UI components will work for both sports without changes");
    console.log("====================================================");
    
    // Create and start fetcher
    const fetcher = new NCAADataFetcher(SPORT);
    
    // Setup shutdown handlers
    setupShutdownHandlers(fetcher);
    
    // Start fetching
    await fetcher.start();
    
    // Display status
    console.log("\n📊 FETCHER STATUS:");
    console.log("==================");
    console.log(`Sport: ${SPORT}`);
    console.log(`API: ${NCAA_API_ENDPOINTS[SPORT]}`);
    console.log(`Collections: ${JSON.stringify(COLLECTIONS[SPORT], null, 2)}`);
    console.log("\n🎯 Your database is now being populated automatically!");
    console.log("💻 You can build your app while data streams in the background");
    console.log("📈 Check Firestore Console to see data appearing");
    console.log("🔄 Fetch frequency automatically adjusts based on game activity");
    console.log("⏭️ Skips placeholder TBA games until real tournament data is available");
    console.log("📅 Only processes games from May 30, 2025 forward");
    console.log("🏆 Correctly captures REGIONALS and other tournament games");
    console.log("🔧 UNIFIED SCHEMA: Baseball uses same field names as basketball");
    console.log("\n⌨️ Press Ctrl+C to stop the fetcher");
    
    // Keep process running
    console.log("\n" + "=".repeat(60));
    console.log("🔄 FETCHER RUNNING - Database population in progress...");
    console.log("🎯 Both sports now use unified schema for easy UI development!");
    console.log("=".repeat(60));

  } catch (error) {
    console.error("❌ Failed to start fetcher:", error);
    process.exit(1);
  }
}

// Export for use as module
module.exports = { NCAADataFetcher };

// Run if called directly
if (require.main === module) {
  main();
}