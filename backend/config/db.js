import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Atlas free-tier clusters cold-start; first connection sometimes fails with
// a SRV-resolution error or a transient timeout. Previously db.js called
// `process.exit(1)` on the first failure, which crashed the Render dyno
// before it could ever serve traffic. Retry with exponential backoff so a
// brief Atlas hiccup doesn't take the API down.
const MAX_ATTEMPTS = 5;

const connectDB = async () => {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        // Fail fast inside each attempt so the backoff loop can take over
        // instead of hanging on a dead DNS resolution for 30s.
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      const isLast = attempt === MAX_ATTEMPTS;
      const waitMs = Math.min(30_000, 1000 * Math.pow(2, attempt - 1)); // 1s, 2s, 4s, 8s, 16s
      console.error(
        `❌ MongoDB connection attempt ${attempt}/${MAX_ATTEMPTS} failed: ${error.message}` +
          (isLast ? '' : ` — retrying in ${waitMs}ms`),
      );
      if (isLast) process.exit(1);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
};

export default connectDB;
