// Load environment variables FIRST using require (runs before imports)
const { config } = require("dotenv");
const { resolve } = require("path");
const { existsSync } = require("fs");

// Try .env.local first (Next.js convention), then .env
const envLocalPath = resolve(process.cwd(), ".env.local");
const envPath = resolve(process.cwd(), ".env");

// Load .env.local if it exists, otherwise load .env
if (existsSync(envLocalPath)) {
  config({ path: envLocalPath });
  console.log("📄 Loaded .env.local");
} else if (existsSync(envPath)) {
  config({ path: envPath });
  console.log("📄 Loaded .env");
} else {
  console.warn("⚠️  No .env.local or .env file found. Make sure environment variables are set.");
}

// Verify MONGODB_URL is loaded
if (!process.env.MONGODB_URL) {
  console.error("❌ MONGODB_URL is not set in .env file");
  console.error("   Please check your .env or .env.local file");
  process.exit(1);
}

// Use dynamic imports to ensure env is loaded first
async function seed() {
  try {
    // Dynamic imports after env is loaded
    const { connectOnce } = await import("../src/server/db/mongoose");
    const { UserModel } = await import("../src/server/db/models/user.model");
    const { TrainerProfileModel } = await import("../src/server/db/models/trainerProfile.model");
    const { ChildModel } = await import("../src/server/db/models/child.model");
    const { HallModel } = await import("../src/server/db/models/hall.model");
    const { ClassSessionModel } = await import("../src/server/db/models/classSession.model");
    const bcrypt = (await import("bcryptjs")).default;

    console.log("🌱 Starting seed...");
    await connectOnce();

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("🧹 Clearing existing data...");
    await UserModel.deleteMany({});
    await TrainerProfileModel.deleteMany({});
    await ChildModel.deleteMany({});
    await HallModel.deleteMany({});
    await ClassSessionModel.deleteMany({});

    // Create Admin
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await UserModel.create({
      email: "admin@dancestudio.com",
      passwordHash: adminPassword,
      name: "Admin User",
      role: "ADMIN",
    });
    console.log("✅ Created admin:", admin.email);

    // Create Trainer
    const trainerPassword = await bcrypt.hash("trainer123", 10);
    const trainer = await UserModel.create({
      email: "trainer@dancestudio.com",
      passwordHash: trainerPassword,
      name: "Jane Trainer",
      role: "TRAINER",
    });
    console.log("✅ Created trainer:", trainer.email);

    const trainerProfile = await TrainerProfileModel.create({
      userId: trainer._id,
      bio: "Experienced dance instructor with 10+ years of teaching",
      specialties: "Ballet, Contemporary, Jazz",
      isActive: true,
    });
    console.log("✅ Created trainer profile");

    // Create Parent
    const parentPassword = await bcrypt.hash("parent123", 10);
    const parent = await UserModel.create({
      email: "parent@dancestudio.com",
      passwordHash: parentPassword,
      name: "John Parent",
      role: "PARENT",
      phone: "+1234567890",
    });
    console.log("✅ Created parent:", parent.email);

    const child = await ChildModel.create({
      parentId: parent._id,
      name: "Emma Parent",
      birthDate: new Date("2015-05-15"),
      notes: "Loves ballet",
    });
    console.log("✅ Created child:", child.name);

    // Create Hall
    const hall = await HallModel.create({
      name: "Main Studio",
      isActive: true,
    });
    console.log("✅ Created hall:", hall.name);

    // Create Class Sessions - today and tomorrow for easy testing
    const today = new Date();
    today.setHours(18, 0, 0, 0); // 6 PM today
    
    const todayEnd = new Date(today);
    todayEnd.setHours(19, 0, 0, 0); // 7 PM today

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0); // 6 PM tomorrow
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(19, 0, 0, 0); // 7 PM tomorrow

    // Class for today
    const classToday = await ClassSessionModel.create({
      trainerId: trainerProfile._id,
      hallId: hall._id,
      startAt: today,
      endAt: todayEnd,
      capacity: 20,
      takenSeats: 0,
      status: "SCHEDULED",
      price: 25,
    });
    console.log("✅ Created class session for today at", today.toLocaleString());

    // Class for tomorrow
    const classTomorrow = await ClassSessionModel.create({
      trainerId: trainerProfile._id,
      hallId: hall._id,
      startAt: tomorrow,
      endAt: tomorrowEnd,
      capacity: 15,
      takenSeats: 0,
      status: "SCHEDULED",
      price: 25,
    });
    console.log("✅ Created class session for tomorrow at", tomorrow.toLocaleString());

    console.log("\n🎉 Seed completed successfully!");
    console.log("\n📋 Login credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:");
    console.log("  Email: admin@dancestudio.com");
    console.log("  Password: admin123");
    console.log("\nTrainer:");
    console.log("  Email: trainer@dancestudio.com");
    console.log("  Password: trainer123");
    console.log("\nParent:");
    console.log("  Email: parent@dancestudio.com");
    console.log("  Password: parent123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
