import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI not set');
}

const cached: { conn: mongoose.Mongoose | null } = { conn: null };

export async function connect(): Promise<mongoose.Mongoose> {
  if (cached.conn) return cached.conn;

  const conn = await mongoose.connect(MONGODB_URI!);
  cached.conn = conn;
  return conn;
}
