// Direct Azure SQL Server to Firestore Migration
// ==============================================

const admin = require("firebase-admin");
const sql = require('mssql');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ===========================================
// 1. AZURE SQL SERVER CONNECTION CONFIG
// ===========================================

const azureConfig = {
  user: process.env.DB_USER || 'admin123',
  password: process.env.DB_PASSWORD || 'pass123#1482',
  server: process.env.DB_SERVER || 'sportschatserver.database.windows.net',
  database: process.env.DB_NAME || 'sportschatdb',
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true, // Required for Azure
    trustServerCertificate: false,
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// ===========================================
// 2. DIRECT MIGRATION CLASS
// ===========================================

class AzureToFirestoreMigration {
  constructor() {
    this.sqlPool = null;
    this.migrationStats = {
      users: 0,
      teams: 0,
      games: 0,
      chatRooms: 0,
      chatMessages: 0,
      gameStats: 0,
      players: 0,
      roles: 0,
      bets: 0,
      payments: 0,
      brackets: 0,
      errors: []
    };
  }

  // Connect to Azure SQL Server
  async connectToAzure() {
    try {
      console.log("🔗 Connecting to Azure SQL Server...");
      console.log(`Server: ${azureConfig.server}`);
      console.log(`Database: ${azureConfig.database}`);
      
      this.sqlPool = await sql.connect(azureConfig);
      console.log("✅ Connected to Azure SQL Server successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to connect to Azure SQL Server:", error.message);
      
      // Provide helpful error messages
      if (error.message.includes('Login failed')) {
        console.error("🔐 Check your username/password in .env file");
      } else if (error.message.includes('server was not found')) {
        console.error("🌐 Check your server name and network connection");
      } else if (error.message.includes('firewall')) {
        console.error("🔥 Add your IP address to Azure SQL Server firewall rules");
      }
      
      return false;
    }
  }

  // Close SQL connection
  async closeConnection() {
    if (this.sqlPool) {
      await this.sqlPool.close();
      console.log("🔌 Closed Azure SQL connection");
    }
  }

  // ===========================================
  // 3. MIGRATION FUNCTIONS FOR EACH TABLE
  // ===========================================

  // Migrate Users from Azure to Firestore
  async migrateUsers() {
    try {
      console.log("👥 Migrating Users...");
      
      const query = `
        SELECT 
          u.UserID,
          u.Username,
          u.Email,
          u.FavoriteTeamID,
          u.CreatedAt,
          u.LastLogin,
          COALESCE(up.RoleID, 1) as RoleID
        FROM dbo.Users u
        LEFT JOIN dbo.UserPermissions up ON u.UserID = up.UserID
      `;
      
      const result = await this.sqlPool.request().query(query);
      const users = result.recordset;
      
      console.log(`Found ${users.length} users to migrate`);
      
      // Batch write to Firestore
      const batch = db.batch();
      
      users.forEach(user => {
        const userRef = db.collection('users').doc(user.UserID.toString());
        batch.set(userRef, {
          username: user.Username,
          email: user.Email,
          favoriteTeamId: user.FavoriteTeamID,
          createdAt: user.CreatedAt,
          lastLogin: user.LastLogin,
          role: user.RoleID === 1 ? 'user' : 'admin',
          migratedAt: new Date()
        });
      });
      
      await batch.commit();
      this.migrationStats.users = users.length;
      console.log(`✅ Migrated ${users.length} users`);
      
    } catch (error) {
      console.error("❌ User migration failed:", error);
      this.migrationStats.errors.push(`Users: ${error.message}`);
    }
  }

  // Migrate Teams
  async migrateTeams() {
    try {
      console.log("🏀 Migrating Teams...");
      
      const query = `
        SELECT 
          TeamID,
          TeamName,
          CoachName,
          Conference,
          Wins,
          Losses,
          Seed,
          LastUpdated
        FROM dbo.Teams
      `;
      
      const result = await this.sqlPool.request().query(query);
      const teams = result.recordset;
      
      console.log(`Found ${teams.length} teams to migrate`);
      
      const batch = db.batch();
      
      teams.forEach(team => {
        const teamRef = db.collection('teams').doc(team.TeamID.toString());
        batch.set(teamRef, {
          teamName: team.TeamName,
          coachName: team.CoachName,
          conference: team.Conference,
          wins: team.Wins,
          losses: team.Losses,
          seed: team.Seed,
          lastUpdated: team.LastUpdated,
          migratedAt: new Date()
        });
      });
      
      await batch.commit();
      this.migrationStats.teams = teams.length;
      console.log(`✅ Migrated ${teams.length} teams`);
      
    } catch (error) {
      console.error("❌ Team migration failed:", error);
      this.migrationStats.errors.push(`Teams: ${error.message}`);
    }
  }

  // Migrate Games
  async migrateGames() {
    try {
      console.log("🎯 Migrating Games...");
      
      const query = `
        SELECT 
          GameID,
          Round,
          DatePlayed,
          Location,
          Team1ID,
          Team2ID,
          WinnerID,
          ScoreTeam1,
          ScoreTeam2,
          LastUpdated
        FROM dbo.Games
      `;
      
      const result = await this.sqlPool.request().query(query);
      const games = result.recordset;
      
      console.log(`Found ${games.length} games to migrate`);
      
      const batch = db.batch();
      
      games.forEach(game => {
        const gameRef = db.collection('games').doc(game.GameID.toString());
        batch.set(gameRef, {
          round: game.Round,
          datePlayed: game.DatePlayed,
          location: game.Location,
          team1Id: game.Team1ID,
          team2Id: game.Team2ID,
          winnerId: game.WinnerID,
          scoreTeam1: game.ScoreTeam1,
          scoreTeam2: game.ScoreTeam2,
          lastUpdated: game.LastUpdated,
          migratedAt: new Date()
        });
      });
      
      await batch.commit();
      this.migrationStats.games = games.length;
      console.log(`✅ Migrated ${games.length} games`);
      
    } catch (error) {
      console.error("❌ Game migration failed:", error);
      this.migrationStats.errors.push(`Games: ${error.message}`);
    }
  }

  // Migrate Chat Rooms
  async migrateChatRooms() {
    try {
      console.log("💬 Migrating Chat Rooms...");
      
      const query = `
        SELECT 
          RoomID,
          RoomName,
          RoomType,
          TeamID,
          GameID,
          CreatedAt
        FROM dbo.ChatRooms
      `;
      
      const result = await this.sqlPool.request().query(query);
      const rooms = result.recordset;
      
      console.log(`Found ${rooms.length} chat rooms to migrate`);
      
      const batch = db.batch();
      
      rooms.forEach(room => {
        const roomRef = db.collection('chatrooms').doc(room.RoomID.toString());
        batch.set(roomRef, {
          roomName: room.RoomName,
          roomType: room.RoomType,
          teamId: room.TeamID,
          gameId: room.GameID,
          createdAt: room.CreatedAt,
          migratedAt: new Date()
        });
      });
      
      await batch.commit();
      this.migrationStats.chatRooms = rooms.length;
      console.log(`✅ Migrated ${rooms.length} chat rooms`);
      
    } catch (error) {
      console.error("❌ Chat room migration failed:", error);
      this.migrationStats.errors.push(`ChatRooms: ${error.message}`);
    }
  }

  // Migrate Chat Messages (as subcollections)
  async migrateChatMessages() {
    try {
      console.log("💭 Migrating Chat Messages...");
      
      const query = `
        SELECT 
          cm.MessageID,
          cm.RoomID,
          cm.UserID,
          cm.Message,
          cm.Timestamp,
          u.Username
        FROM dbo.ChatMessages cm
        JOIN dbo.Users u ON cm.UserID = u.UserID
        ORDER BY cm.RoomID, cm.Timestamp
      `;
      
      const result = await this.sqlPool.request().query(query);
      const messages = result.recordset;
      
      console.log(`Found ${messages.length} chat messages to migrate`);
      
      // Group messages by room for efficient batch writing
      const messagesByRoom = {};
      messages.forEach(msg => {
        if (!messagesByRoom[msg.RoomID]) {
          messagesByRoom[msg.RoomID] = [];
        }
        messagesByRoom[msg.RoomID].push(msg);
      });
      
      // Migrate messages for each room
      for (const [roomId, roomMessages] of Object.entries(messagesByRoom)) {
        const batch = db.batch();
        
        roomMessages.forEach(message => {
          const messageRef = db.collection('chatrooms')
            .doc(roomId.toString())
            .collection('messages')
            .doc(message.MessageID.toString());
            
          batch.set(messageRef, {
            userId: message.UserID,
            username: message.Username,
            message: message.Message,
            timestamp: message.Timestamp,
            migratedAt: new Date()
          });
        });
        
        await batch.commit();
        console.log(`✅ Migrated ${roomMessages.length} messages for room ${roomId}`);
      }
      
      this.migrationStats.chatMessages = messages.length;
      console.log(`✅ Total migrated: ${messages.length} chat messages`);
      
    } catch (error) {
      console.error("❌ Chat message migration failed:", error);
      this.migrationStats.errors.push(`ChatMessages: ${error.message}`);
    }
  }

  // Migrate Game Stats
  async migrateGameStats() {
    try {
      console.log("📊 Migrating Game Statistics...");
      
      const query = `
        SELECT 
          StatID,
          GameID,
          PlayerID,
          Points,
          Rebounds,
          Assists,
          Steals,
          Blocks,
          MinutesPlayed
        FROM dbo.GameStats
      `;
      
      const result = await this.sqlPool.request().query(query);
      const stats = result.recordset;
      
      console.log(`Found ${stats.length} game statistics to migrate`);
      
      const batch = db.batch();
      
      stats.forEach(stat => {
        const statRef = db.collection('gameStats').doc(stat.StatID.toString());
        batch.set(statRef, {
          gameId: stat.GameID,
          playerId: stat.PlayerID,
          points: stat.Points,
          rebounds: stat.Rebounds,
          assists: stat.Assists,
          steals: stat.Steals,
          blocks: stat.Blocks,
          minutesPlayed: stat.MinutesPlayed,
          migratedAt: new Date()
        });
      });
      
      await batch.commit();
      this.migrationStats.gameStats = stats.length;
      console.log(`✅ Migrated ${stats.length} game statistics`);
      
    } catch (error) {
      console.error("❌ Game stats migration failed:", error);
      this.migrationStats.errors.push(`GameStats: ${error.message}`);
    }
  }

  // Migrate Players
  async migratePlayers() {
    try {
      console.log("🏀 Migrating Players...");
      
      const query = `
        SELECT 
          PlayerID,
          TeamID,
          PlayerName,
          Position
        FROM dbo.Players
      `;
      
      const result = await this.sqlPool.request().query(query);
      const players = result.recordset;
      
      console.log(`Found ${players.length} players to migrate`);
      
      const batch = db.batch();
      
      players.forEach(player => {
        const playerRef = db.collection('players').doc(player.PlayerID.toString());
        batch.set(playerRef, {
          teamId: player.TeamID,
          playerName: player.PlayerName,
          position: player.Position,
          migratedAt: new Date()
        });
      });
      
      await batch.commit();
      this.migrationStats.players = players.length;
      console.log(`✅ Migrated ${players.length} players`);
      
    } catch (error) {
      console.error("❌ Player migration failed:", error);
      this.migrationStats.errors.push(`Players: ${error.message}`);
    }
  }

  // Migrate Role Lookup
  async migrateRoles() {
    try {
      console.log("👥 Migrating Role Definitions...");
      
      const query = `
        SELECT 
          RoleID,
          RoleName
        FROM dbo.RoleLookup
      `;
      
      const result = await this.sqlPool.request().query(query);
      const roles = result.recordset;
      
      console.log(`Found ${roles.length} roles to migrate`);
      
      const batch = db.batch();
      
      roles.forEach(role => {
        const roleRef = db.collection('roles').doc(role.RoleID.toString());
        batch.set(roleRef, {
          roleName: role.RoleName,
          migratedAt: new Date()
        });
      });
      
      await batch.commit();
      this.migrationStats.roles = roles.length;
      console.log(`✅ Migrated ${roles.length} roles`);
      
    } catch (error) {
      console.error("❌ Role migration failed:", error);
      this.migrationStats.errors.push(`Roles: ${error.message}`);
    }
  }

  // Migrate Bets (even if empty, creates the structure)
  async migrateBets() {
    try {
      console.log("💰 Migrating Bets...");
      
      const query = `
        SELECT 
          BetID,
          GameID,
          User1ID,
          User2ID,
          WagerAmount,
          BetStatus,
          WinnerID,
          CreatedAt,
          CompletedAt
        FROM dbo.Bets
      `;
      
      const result = await this.sqlPool.request().query(query);
      const bets = result.recordset;
      
      console.log(`Found ${bets.length} bets to migrate`);
      
      if (bets.length > 0) {
        const batch = db.batch();
        
        bets.forEach(bet => {
          const betRef = db.collection('bets').doc(bet.BetID.toString());
          batch.set(betRef, {
            gameId: bet.GameID,
            user1Id: bet.User1ID,
            user2Id: bet.User2ID,
            wagerAmount: bet.WagerAmount,
            betStatus: bet.BetStatus,
            winnerId: bet.WinnerID,
            createdAt: bet.CreatedAt,
            completedAt: bet.CompletedAt,
            migratedAt: new Date()
          });
        });
        
        await batch.commit();
      }
      
      this.migrationStats.bets = bets.length;
      console.log(`✅ Migrated ${bets.length} bets`);
      
    } catch (error) {
      console.error("❌ Bet migration failed:", error);
      this.migrationStats.errors.push(`Bets: ${error.message}`);
    }
  }

  // Migrate Payments (even if empty)
  async migratePayments() {
    try {
      console.log("💳 Migrating Payments...");
      
      const query = `
        SELECT 
          PaymentID,
          UserID,
          Amount,
          PaymentMethod,
          Status,
          TransactionDate
        FROM dbo.Payments
      `;
      
      const result = await this.sqlPool.request().query(query);
      const payments = result.recordset;
      
      console.log(`Found ${payments.length} payments to migrate`);
      
      if (payments.length > 0) {
        const batch = db.batch();
        
        payments.forEach(payment => {
          const paymentRef = db.collection('payments').doc(payment.PaymentID.toString());
          batch.set(paymentRef, {
            userId: payment.UserID,
            amount: payment.Amount,
            paymentMethod: payment.PaymentMethod,
            status: payment.Status,
            transactionDate: payment.TransactionDate,
            migratedAt: new Date()
          });
        });
        
        await batch.commit();
      }
      
      this.migrationStats.payments = payments.length;
      console.log(`✅ Migrated ${payments.length} payments`);
      
    } catch (error) {
      console.error("❌ Payment migration failed:", error);
      this.migrationStats.errors.push(`Payments: ${error.message}`);
    }
  }

  // Migrate Bracket Seeding (even if empty)
  async migrateBrackets() {
    try {
      console.log("🏆 Migrating Bracket Seeding...");
      
      const query = `
        SELECT 
          SeedingID,
          TeamID,
          BracketPosition,
          Region
        FROM dbo.Bracket_Seeding
      `;
      
      const result = await this.sqlPool.request().query(query);
      const brackets = result.recordset;
      
      console.log(`Found ${brackets.length} bracket entries to migrate`);
      
      if (brackets.length > 0) {
        const batch = db.batch();
        
        brackets.forEach(bracket => {
          const bracketRef = db.collection('brackets').doc(bracket.SeedingID.toString());
          batch.set(bracketRef, {
            teamId: bracket.TeamID,
            bracketPosition: bracket.BracketPosition,
            region: bracket.Region,
            migratedAt: new Date()
          });
        });
        
        await batch.commit();
      }
      
      this.migrationStats.brackets = brackets.length;
      console.log(`✅ Migrated ${brackets.length} bracket entries`);
      
    } catch (error) {
      console.error("❌ Bracket migration failed:", error);
      this.migrationStats.errors.push(`Brackets: ${error.message}`);
    }
  }

  // ===========================================
  // 4. MAIN MIGRATION RUNNER
  // ===========================================

  async runFullMigration() {
    console.log("🚀 Starting Full Azure to Firestore Migration");
    console.log("=============================================");
    
    const startTime = Date.now();
    
    try {
      // Connect to Azure
      const connected = await this.connectToAzure();
      if (!connected) {
        throw new Error("Could not connect to Azure SQL Server");
      }
      
      // Run all migrations
      await this.migrateUsers();
      await this.migrateTeams();
      await this.migrateGames();
      await this.migrateChatRooms();
      await this.migrateChatMessages();
      await this.migrateGameStats();
      await this.migratePlayers();
      await this.migrateRoles();
      await this.migrateBets();
      await this.migratePayments();
      await this.migrateBrackets();
      
      const duration = (Date.now() - startTime) / 1000;
      
      console.log("=============================================");
      console.log("🎉 Migration Complete!");
      console.log(`⏱️  Duration: ${duration} seconds`);
      console.log("📊 Migration Summary:");
      console.log(`   Users: ${this.migrationStats.users}`);
      console.log(`   Teams: ${this.migrationStats.teams}`);
      console.log(`   Games: ${this.migrationStats.games}`);
      console.log(`   Chat Rooms: ${this.migrationStats.chatRooms}`);
      console.log(`   Chat Messages: ${this.migrationStats.chatMessages}`);
      console.log(`   Game Stats: ${this.migrationStats.gameStats}`);
      console.log(`   Players: ${this.migrationStats.players}`);
      console.log(`   Roles: ${this.migrationStats.roles}`);
      console.log(`   Bets: ${this.migrationStats.bets}`);
      console.log(`   Payments: ${this.migrationStats.payments}`);
      console.log(`   Brackets: ${this.migrationStats.brackets}`);
      
      if (this.migrationStats.errors.length > 0) {
        console.log("⚠️  Errors encountered:");
        this.migrationStats.errors.forEach(error => console.log(`   - ${error}`));
      }
      
    } catch (error) {
      console.error("❌ Migration failed:", error);
    } finally {
      await this.closeConnection();
    }
  }
}

// ===========================================
// 5. ENVIRONMENT CONFIGURATION
// ===========================================

// Create a .env file with your Azure credentials:
const envTemplate = `
# Azure SQL Server Configuration
DB_USER=admin123
DB_PASSWORD=pass123#1482
DB_SERVER=sportschatserver.database.windows.net
DB_NAME=sportschatdb
DB_PORT=1433
DB_ENCRYPT=true

# Firebase Configuration (for service account path)
FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json
`;

// ===========================================
// 6. RUN THE MIGRATION
// ===========================================

const migration = new AzureToFirestoreMigration();

// Run the migration
migration.runFullMigration().catch(console.error);

// Export for testing
module.exports = { AzureToFirestoreMigration };

/*
===========================================
SETUP INSTRUCTIONS:
===========================================

1. Install dependencies:
   npm install firebase-admin mssql dotenv

2. Create .env file with your Azure credentials:
   DB_USER=admin123
   DB_PASSWORD=pass123#1482
   DB_SERVER=sportschatserver.database.windows.net
   DB_NAME=sportschatdb
   DB_PORT=1433

3. Download Firebase service account key:
   - Firebase Console > Project Settings > Service Accounts
   - Generate new private key
   - Save as serviceAccountKey.json

4. Add your IP to Azure SQL Server firewall:
   - Azure Portal > SQL Server > Networking
   - Add your current IP address

5. Run the migration:
   node direct-migration.js

===========================================
WHAT THIS DOES:
===========================================

✅ Connects directly to your Azure SQL Server
✅ Reads all your table data automatically
✅ Converts SQL data to Firestore format
✅ Handles relationships (chat messages as subcollections)
✅ Provides detailed progress and error reporting
✅ Uses efficient batch operations
✅ Handles Azure connection requirements (encryption, etc.)
*/