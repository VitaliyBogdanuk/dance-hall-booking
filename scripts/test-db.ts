// Test script to verify .env loading and database connection
// Usage: npm run test-db (add to package.json) or: npx tsx scripts/test-db.ts

// Load environment variables FIRST
const { config } = require("dotenv");
const { resolve } = require("path");
const { existsSync } = require("fs");

const envLocalPath = resolve(process.cwd(), ".env.local");
const envPath = resolve(process.cwd(), ".env");

console.log("🔍 Checking environment variables...\n");

if (existsSync(envLocalPath)) {
  config({ path: envLocalPath });
  console.log("✅ Loaded .env.local");
} else if (existsSync(envPath)) {
  config({ path: envPath });
  console.log("✅ Loaded .env");
} else {
  console.error("❌ No .env.local or .env file found!");
  process.exit(1);
}

// Check required variables
const requiredVars = ["MONGODB_URL", "NEXTAUTH_SECRET"];
const optionalVars = ["MONGODB_DBNAME", "NEXTAUTH_URL", "NODE_ENV", "CRON_SECRET"];

console.log("\n📋 Environment Variables:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

let hasErrors = false;

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive values
    const displayValue = varName === "MONGODB_URL" 
      ? value.replace(/\/\/[^:]+:[^@]+@/, "//***:***@") // Mask credentials
      : varName === "NEXTAUTH_SECRET"
      ? `${value.substring(0, 8)}...` // Show first 8 chars
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    hasErrors = true;
  }
});

optionalVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(`ℹ️  ${varName}: ${value}`);
  } else {
    console.log(`⚪ ${varName}: not set (optional)`);
  }
});

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

if (hasErrors) {
  console.error("❌ Missing required environment variables!");
  console.error("   Please check your .env or .env.local file\n");
  process.exit(1);
}

// Test database connection
async function testConnection() {
  try {
    console.log("🔌 Testing database connection...\n");
    
    const mongoose = (await import("mongoose")).default;
    const MONGODB_URL = process.env.MONGODB_URL!;
    const MONGODB_DBNAME = process.env.MONGODB_DBNAME;

    const connectionOptions: any = {};
    if (MONGODB_DBNAME) {
      connectionOptions.dbName = MONGODB_DBNAME;
      console.log(`📦 Using database: ${MONGODB_DBNAME}`);
    }

    console.log("⏳ Connecting to MongoDB...");
    const startTime = Date.now();
    
    await mongoose.connect(MONGODB_URL, connectionOptions);
    
    const connectionTime = Date.now() - startTime;
    console.log(`✅ Connected successfully! (${connectionTime}ms)`);

    // Get connection info
    const db = mongoose.connection.db;
    if (db) {
      const dbName = db.databaseName;
      const adminDb = db.admin();
      const serverStatus = await adminDb.serverStatus();
      
      console.log(`\n📊 Database Info:`);
      console.log(`   Name: ${dbName}`);
      console.log(`   Host: ${mongoose.connection.host}`);
      console.log(`   Port: ${mongoose.connection.port}`);
      console.log(`   Version: ${serverStatus.version}`);
      
      // List collections
      const collections = await db.listCollections().toArray();
      console.log(`\n📚 Collections (${collections.length}):`);
      if (collections.length > 0) {
        collections.forEach((col) => {
          console.log(`   - ${col.name}`);
        });
      } else {
        console.log("   (no collections yet - run 'npm run seed' to create data)");
      }
    }

    // Test a simple query
    console.log("\n🧪 Testing query...");
    const { UserModel } = await import("../src/server/db/models/user.model");
    const userCount = await UserModel.countDocuments();
    console.log(`✅ Query successful! Found ${userCount} user(s) in database.`);

    await mongoose.disconnect();
    console.log("\n✅ Database connection test completed successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Database connection failed!");
    console.error("Error:", error instanceof Error ? error.message : error);
    console.error("\n💡 Troubleshooting:");
    console.error("   1. Check MONGODB_URL is correct");
    console.error("   2. Verify MongoDB Atlas network access (whitelist IP)");
    console.error("   3. Check database user credentials");
    console.error("   4. Ensure MongoDB cluster is running\n");
    process.exit(1);
  }
}

testConnection();
