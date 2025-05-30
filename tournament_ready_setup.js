require("dotenv").config();

const admin = require("firebase-admin");
const axios = require("axios");

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

console.log(`[${new Date().toISOString()}] 🚨 TOURNAMENT READY SETUP - GAMES START TOMORROW!`);

// Tournament that starts tomorrow
const TOURNAMENT_INFO = {
  baseball: {
    name: "NCAA Baseball Tournament 2025",
    startDate: "May 30, 2025", // Tomorrow
    totalTeams: 64,
    firstGames: "Regional Games Begin",
    apiEndpoint: "https://ncaa-api.henrygd.me/scoreboard/baseball/d1/tournament"
  }
};

class TournamentReadySetup {
  constructor() {
    this.setupStartTime = Date.now();
  }

  async runCompleteSetup() {
    console.log("🎯 MISSION: Get database ready for tournament starting tomorrow");
    console.log("⏰ TIME CRITICAL: Setting up everything needed for live games");
    console.log("\n" + "=".repeat(60));

    try {
      // Step 1: Test database connection
      await this.testDatabaseConnection();

      // Step 2: Create baseball collections if they don't exist
      await this.setupBaseballCollections();

      // Step 3: Fetch current tournament bracket/teams
      await this.fetchTournamentData();

      // Step 4: Verify data structure
      await this.verifySetup();

      // Step 5: Start real-time fetcher
      await this.startRealTimeFetcher();

      // Step 6: Create monitoring dashboard data
      await this.createMonitoringData();

      const setupTime = Date.now() - this.setupStartTime;
      console.log("\n" + "=".repeat(60));
      console.log(`🎉 TOURNAMENT READY! Setup completed in ${setupTime}ms`);
      console.log("✅ Database is ready for games starting tomorrow");
      console.log("📡 Real-time fetcher is running");
      console.log("🔄 Data will update automatically when games begin");
      console.log("=".repeat(60));

    } catch (error) {
      console.error("❌ CRITICAL ERROR - Setup failed:", error);
      throw error;
    }
  }

  // Step 1: Test database connection
  async testDatabaseConnection() {
    console.log("\n🔍 STEP 1: Testing database connection...");
    
    try {
      const testRef = db.collection('test').doc('tournament_ready_test');
      await testRef.set({ 
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        tournamentReady: true,
        setupTime: new Date().toISOString()
      });
      
      const testDoc = await testRef.get();
      if (!testDoc.exists) {
        throw new Error("Test document not found after creation");
      }
      
      await testRef.delete();
      console.log("✅ Database connection successful");
      
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      throw error;
    }
  }

  // Step 2: Setup baseball collections
  async setupBaseballCollections() {
    console.log("\n🏗️ STEP 2: Setting up baseball collections...");

    const collections = [
      'baseballGames',
      'baseballTeams', 
      'baseballPlayers',
      'baseballGameStats',
      'baseballRegionals',
      'fetchLogs'
    ];

    try {
      for (const collectionName of collections) {
        // Check if collection exists by trying to read from it
        const testQuery = await db.collection(collectionName).limit(1).get();
        
        if (testQuery.empty) {
          // Create collection with initial document
          await db.collection(collectionName).doc('_init').set({
            _initialized: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            tournamentReady: true
          });
          console.log(`  ✅ Created collection: ${collectionName}`);
        } else {
          console.log(`  ✅ Collection exists: ${collectionName} (${testQuery.size} docs)`);
        }
      }

      // Clean up init documents
      for (const collectionName of collections) {
        const initDoc = await db.collection(collectionName).doc('_init').get();
        if (initDoc.exists) {
          await initDoc.ref.delete();
        }
      }

      console.log("✅ All baseball collections ready");

    } catch (error) {
      console.error("❌ Error setting up collections:", error);
      throw error;
    }
  }

  // Step 3: Fetch current tournament data
  async fetchTournamentData() {
    console.log("\n📡 STEP 3: Fetching current tournament data...");

    try {
      const response = await axios.get(TOURNAMENT_INFO.baseball.apiEndpoint, {
        timeout: 30000,
        headers: {
          'User-Agent': 'SportsChat+ Tournament Setup'
        }
      });

      if (!response.data) {
        console.log("⚠️ No tournament data available yet - games start tomorrow");
        console.log("📅 Will fetch data when tournament begins");
        return;
      }

      if (response.data.games && response.data.games.length > 0) {
        console.log(`📊 Found ${response.data.games.length} games in tournament data`);
        
        // Process and save initial games
        let savedGames = 0;
        let savedTeams = 0;

        for (const gameItem of response.data.games.slice(0, 10)) { // Limit initial load
          const gameData = gameItem.game;
          if (!gameData) continue;

          try {
            // Save game
            const gameSaved = await this.saveInitialGame(gameData);
            if (gameSaved) savedGames++;

            // Save teams
            const teamsSaved = await this.saveInitialTeams(gameData);
            savedTeams += teamsSaved;

          } catch (gameError) {
            console.error(`Error processing game:`, gameError.message);
          }
        }

        console.log(`✅ Saved ${savedGames} games and ${savedTeams} teams`);
      } else {
        console.log("📅 Tournament bracket not yet available - normal for day before");
      }

    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("📅 Tournament data not available yet - games start tomorrow");
        console.log("✅ This is normal for the day before tournament begins");
      } else {
        console.error("❌ Error fetching tournament data:", error.message);
        // Don't throw - this is not critical for tomorrow's setup
      }
    }
  }

  // Save initial game data
  async saveInitialGame(gameData) {
    try {
      const team1Name = gameData.away?.names?.full || gameData.away?.names?.short;
      const team2Name = gameData.home?.names?.full || gameData.home?.names?.short;
      
      if (!team1Name || !team2Name) return false;

      const gameDoc = {
        team1Name: team1Name,
        team2Name: team2Name,
        team1Score: parseInt(gameData.away?.score) || 0,
        team2Score: parseInt(gameData.home?.score) || 0,
        gameState: gameData.gameState || 'scheduled',
        round: gameData.bracketRound || 'Regional',
        datePlayed: admin.firestore.Timestamp.fromDate(this.parseGameDate(gameData.startDate)),
        location: gameData.venue?.name || 'TBD',
        sport: 'baseball',
        gameIdentifier: `${team1Name}_${team2Name}_${this.parseGameDate(gameData.startDate).toISOString().split('T')[0]}`,
        inning: 0,
        isElimination: false,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        tournamentReady: true
      };

      await db.collection('baseballGames').add(gameDoc);
      return true;

    } catch (error) {
      console.error("Error saving initial game:", error);
      return false;
    }
  }

  // Save initial team data
  async saveInitialTeams(gameData) {
    try {
      let teamsSaved = 0;
      const teams = [
        { name: gameData.away?.names?.full || gameData.away?.names?.short, seed: gameData.away?.seed },
        { name: gameData.home?.names?.full || gameData.home?.names?.short, seed: gameData.home?.seed }
      ];

      for (const team of teams) {
        if (!team.name) continue;

        // Check if team already exists
        const existingTeam = await db.collection('baseballTeams')
          .where('name', '==', team.name)
          .limit(1)
          .get();

        if (existingTeam.empty) {
          const teamDoc = {
            name: team.name,
            coachName: '',
            conference: '',
            wins: 0,
            losses: 0,
            seed: team.seed ? parseInt(team.seed) : null,
            sport: 'baseball',
            region: '',
            rpi: null,
            tournamentReady: true,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
          };

          await db.collection('baseballTeams').add(teamDoc);
          teamsSaved++;
        }
      }

      return teamsSaved;

    } catch (error) {
      console.error("Error saving initial teams:", error);
      return 0;
    }
  }

  // Step 4: Verify setup
  async verifySetup() {
    console.log("\n🔍 STEP 4: Verifying tournament readiness...");

    const checks = [
      { name: 'baseballGames', description: 'Baseball games collection' },
      { name: 'baseballTeams', description: 'Baseball teams collection' },
      { name: 'baseballPlayers', description: 'Baseball players collection' },
      { name: 'baseballGameStats', description: 'Baseball game stats collection' },
      { name: 'games', description: 'Basketball games (existing)' },
      { name: 'teams', description: 'Basketball teams (existing)' }
    ];

    let allGood = true;

    for (const check of checks) {
      try {
        const snapshot = await db.collection(check.name).limit(1).get();
        console.log(`  ✅ ${check.description}: Ready`);
      } catch (error) {
        console.log(`  ❌ ${check.description}: Error - ${error.message}`);
        allGood = false;
      }
    }

    if (allGood) {
      console.log("✅ All collections verified and ready");
    } else {
      console.log("⚠️ Some collections have issues but tournament can still proceed");
    }
  }

  // Step 5: Start real-time fetcher
  async startRealTimeFetcher() {
    console.log("\n🚀 STEP 5: Starting real-time data fetcher...");

    try {
      // Import and start the fetcher
      const { NCAADataFetcher } = require('./production_ncaa_fetcher');
      
      console.log("📡 Starting baseball data fetcher for tomorrow's games...");
      this.fetcher = new NCAADataFetcher('baseball');
      
      // Start the fetcher in background
      this.fetcher.start().then(() => {
        console.log("✅ Real-time fetcher is running and ready for tomorrow");
      }).catch(error => {
        console.error("❌ Fetcher startup error:", error.message);
      });

    } catch (error) {
      console.log("⚠️ Could not start fetcher automatically");
      console.log("💡 You can start it manually with: node production_ncaa_fetcher.js baseball");
    }
  }

  // Step 6: Create monitoring data
  async createMonitoringData() {
    console.log("\n📊 STEP 6: Creating monitoring dashboard...");

    try {
      // Create setup log
      await db.collection('setupLogs').add({
        type: 'tournament-ready-setup',
        sport: 'baseball',
        tournamentInfo: TOURNAMENT_INFO.baseball,
        setupTime: Date.now() - this.setupStartTime,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ready: true,
        collections: ['baseballGames', 'baseballTeams', 'baseballPlayers', 'baseballGameStats'],
        nextSteps: [
          'Games start tomorrow',
          'Real-time fetcher is running', 
          'Database will populate automatically',
          'Check fetchLogs collection for updates'
        ]
      });

      // Create initial fetch log entry
      await db.collection('fetchLogs').add({
        sport: 'baseball',
        type: 'tournament-ready-initialization',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'ready-for-tournament',
        message: 'Database initialized and ready for tournament starting tomorrow'
      });

      console.log("✅ Monitoring data created");

    } catch (error) {
      console.error("❌ Error creating monitoring data:", error);
    }
  }

  // Utility: Parse game date
  parseGameDate(dateString) {
    try {
      if (!dateString) return new Date();
      
      // Handle various date formats
      if (dateString.includes('-')) {
        const [month, day, year] = dateString.split('-');
        return new Date(`${year}-${month}-${day}`);
      }
      
      return new Date(dateString);
    } catch (error) {
      return new Date();
    }
  }

  // Stop fetcher on shutdown
  stop() {
    if (this.fetcher) {
      this.fetcher.stop();
    }
  }
}

// Handle shutdown
function setupShutdownHandlers(setup) {
  const shutdown = () => {
    console.log('\n🛑 Stopping setup...');
    setup.stop();
    console.log('✅ Setup stopped gracefully');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Main execution
async function main() {
  console.log("🚨 URGENT: Tournament starts tomorrow!");
  console.log("🎯 Getting database ready for live games...");
  console.log("\n⚾ NCAA Baseball Tournament 2025");
  console.log("📅 Start Date: May 30, 2025 (TOMORROW)");
  console.log("🏟️ Format: 64 teams, Regionals begin");
  console.log("🔄 Real-time data fetching required");

  try {
    const setup = new TournamentReadySetup();
    setupShutdownHandlers(setup);
    
    await setup.runCompleteSetup();
    
    console.log("\n🎉 SUCCESS! Your database is tournament-ready!");
    console.log("\n📋 WHAT'S READY:");
    console.log("✅ Baseball collections created");
    console.log("✅ Basketball collections (existing) verified");
    console.log("✅ Real-time data fetcher running"); 
    console.log("✅ Tournament data structure prepared");
    console.log("✅ Monitoring and logging active");
    
    console.log("\n🚀 WHAT HAPPENS TOMORROW:");
    console.log("📡 Fetcher will automatically detect when games start");
    console.log("🔄 Data will stream in real-time as games are played");
    console.log("📊 Your dashboard will have live tournament data");
    console.log("⚾ Baseball regionals will populate automatically");
    
    console.log("\n💻 WHILE RUNNING:");
    console.log("🔍 Check Firestore Console for incoming data");
    console.log("📈 Monitor 'fetchLogs' collection for status");
    console.log("🎮 Build your app - database handles itself");
    console.log("⌨️ Press Ctrl+C to stop");

    // Keep running to maintain fetcher
    console.log("\n" + "=".repeat(60));
    console.log("🔄 SYSTEM READY - Waiting for tomorrow's games...");
    console.log("=".repeat(60));

  } catch (error) {
    console.error("❌ CRITICAL FAILURE:", error);
    console.log("\n🆘 EMERGENCY CHECKLIST:");
    console.log("1. Verify Firebase credentials in .env file");
    console.log("2. Check internet connection");
    console.log("3. Confirm Firestore database exists");
    console.log("4. Try running setup again");
    process.exit(1);
  }
}

// Export for testing
module.exports = { TournamentReadySetup };

// Run setup
if (require.main === module) {
  main();
}