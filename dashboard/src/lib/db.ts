import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null }
}

global._mongoose = global._mongoose || { conn: null, promise: null }

export async function connectDB() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined')
  if (global._mongoose.conn) return global._mongoose.conn
  if (!global._mongoose.promise) {
    global._mongoose.promise = mongoose.connect(MONGODB_URI).then((m) => m.connection)
  }
  global._mongoose.conn = await global._mongoose.promise
  return global._mongoose.conn
}
