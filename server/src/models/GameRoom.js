import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  id: String,
  name: String,
  color: String,
  isHost: Boolean
});

const gameRoomSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  players: [playerSchema],
  isStarted: {
    type: Boolean,
    default: false
  },
  maxPlayers: {
    type: Number,
    default: 4
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('GameRoom', gameRoomSchema);
