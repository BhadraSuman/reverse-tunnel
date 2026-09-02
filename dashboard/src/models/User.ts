import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema(
  {
    githubId: { type: String, unique: true, required: true, index: true },
    email: { type: String, default: '' },
    name: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    apiKeyHash: { type: String, select: false },
    apiKeyPrefix: { type: String, default: '' },
    maxTunnels: { type: Number, default: 3 },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.apiKeyHash
        return ret
      },
    },
  }
)

export default mongoose.models.User || mongoose.model('User', userSchema)
