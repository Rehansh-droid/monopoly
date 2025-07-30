import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import GameRoom from './models/GameRoom.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB with better timeout configuration
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // 5 second timeout
  socketTimeoutMS: 45000, // 45 second socket timeout
  connectTimeoutMS: 5000, // 5 second connection timeout
  maxPoolSize: 10, // Maximum number of connections
  wtimeoutMS: 5000, // 5 second write timeout
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.error('Retrying connection in 5 seconds...');
    setTimeout(() => {
      mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 5000,
        maxPoolSize: 10,
        wtimeoutMS: 5000,
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }, 5000);
  });

// Express server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080", // Update with your frontend URL
    methods: ["GET", "POST"]
  }
});

// Socket.IO connections
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('create-game', async (hostName) => {
    try {
      const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const playerId = Math.random().toString(36).substring(2, 8);

      const newRoom = new GameRoom({
        id: gameId,
        players: [{
          id: playerId,
          name: hostName,
          color: 'red',
          isHost: true
        }]
      });

      await newRoom.save();
      socket.join(gameId);

      io.to(gameId).emit('game-created', {
        gameId,
        playerId,
        room: newRoom
      });
    } catch (error) {
      console.error('Error creating game:', error);
      socket.emit('error', 'Failed to create game');
    }
  });

  socket.on('join-game', async (data) => {
    try {
      const { gameId, playerName } = data;
      const room = await GameRoom.findOne({ id: gameId });

      if (!room) {
        throw new Error('Game not found');
      }

      if (room.players.length >= room.maxPlayers) {
        throw new Error('Game is full');
      }

      if (room.isStarted) {
        throw new Error('Game already started');
      }

      const colors = ['red', 'blue', 'green', 'yellow'];
      const usedColors = room.players.map(p => p.color);
      const availableColor = colors.find(c => !usedColors.includes(c)) || 'blue';

      const playerId = Math.random().toString(36).substring(2, 8);
      room.players.push({
        id: playerId,
        name: playerName,
        color: availableColor,
        isHost: false
      });

      await room.save();
      socket.join(gameId);

      io.to(gameId).emit('player-joined', {
        room,
        newPlayer: {
          id: playerId,
          name: playerName,
          color: availableColor,
          isHost: false
        }
      });
    } catch (error) {
      console.error('Error joining game:', error);
      socket.emit('error', error.message);
    }
  });

  socket.on('start-game', async (gameId) => {
    try {
      const room = await GameRoom.findOne({ id: gameId });
      if (!room) {
        throw new Error('Game not found');
      }

      room.isStarted = true;
      await room.save();

      io.to(gameId).emit('game-started', room);
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('error', error.message);
    }
  });

  socket.on('buy-property', async (data) => {
    try {
      const { gameId, propertyId, playerId } = data;
      const room = await GameRoom.findOne({ id: gameId });

      if (!room) throw new Error('Game not found');

      // Find the property and player
      const property = room.properties.find(p => p.id === propertyId);
      const player = room.players.find(p => p.id === playerId);

      if (!property || !player) throw new Error('Invalid property or player');
      if (property.owner) throw new Error('Property already owned');
      if (player.money < property.price) throw new Error('Not enough money');

      // Update property ownership and player money
      property.owner = playerId;
      player.money -= property.price;
      player.properties.push(propertyId);

      await room.save();
      io.to(gameId).emit('property-updated', {
        property,
        player,
        action: 'bought'
      });
    } catch (error) {
      console.error('Error buying property:', error);
      socket.emit('error', error.message);
    }
  });

  socket.on('mortgage-property', async (data) => {
    try {
      const { gameId, propertyId, playerId } = data;
      const room = await GameRoom.findOne({ id: gameId });

      if (!room) throw new Error('Game not found');

      const property = room.properties.find(p => p.id === propertyId);
      const player = room.players.find(p => p.id === playerId);

      if (!property || !player) throw new Error('Invalid property or player');
      if (property.owner !== playerId) throw new Error('Not your property');
      if (property.mortgaged) throw new Error('Property already mortgaged');

      // Mortgage property
      property.mortgaged = true;
      player.money += Math.floor(property.price * 0.5); // 50% of property price

      await room.save();
      io.to(gameId).emit('property-updated', {
        property,
        player,
        action: 'mortgaged'
      });
    } catch (error) {
      console.error('Error mortgaging property:', error);
      socket.emit('error', error.message);
    }
  });

  socket.on('unmortgage-property', async (data) => {
    try {
      const { gameId, propertyId, playerId } = data;
      const room = await GameRoom.findOne({ id: gameId });

      if (!room) throw new Error('Game not found');

      const property = room.properties.find(p => p.id === propertyId);
      const player = room.players.find(p => p.id === playerId);

      if (!property || !player) throw new Error('Invalid property or player');
      if (property.owner !== playerId) throw new Error('Not your property');
      if (!property.mortgaged) throw new Error('Property not mortgaged');
      if (player.money < Math.floor(property.price * 0.55)) throw new Error('Not enough money');

      // Unmortgage property
      property.mortgaged = false;
      player.money -= Math.floor(property.price * 0.55); // 55% of property price

      await room.save();
      io.to(gameId).emit('property-updated', {
        property,
        player,
        action: 'unmortgaged'
      });
    } catch (error) {
      console.error('Error unmortgaging property:', error);
      socket.emit('error', error.message);
    }
  });

  socket.on('end-turn', async (data) => {
    try {
      const { gameId, playerId } = data;
      const room = await GameRoom.findOne({ id: gameId });

      if (!room) throw new Error('Game not found');

      const currentPlayerIndex = room.players.findIndex(p => p.id === playerId);
      if (currentPlayerIndex === -1) throw new Error('Player not found');

      // Move to next player
      room.currentPlayer = (currentPlayerIndex + 1) % room.players.length;
      await room.save();

      io.to(gameId).emit('turn-updated', {
        currentPlayer: room.currentPlayer,
        players: room.players
      });
    } catch (error) {
      console.error('Error ending turn:', error);
      socket.emit('error', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
