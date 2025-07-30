import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserPlusIcon, PlayIcon, TrashIcon } from '@heroicons/react/24/solid';

const GameSetup: React.FC = () => {
  const { initializeGame } = useGameStore();
  const [playerNames, setPlayerNames] = useState<string[]>(['']);
  const [newPlayerName, setNewPlayerName] = useState('');

  const addPlayer = () => {
    if (newPlayerName.trim() && playerNames.length < 4) {
      setPlayerNames([...playerNames.filter(name => name.trim()), newPlayerName.trim()]);
      setNewPlayerName('');
    }
  };

  const removePlayer = (index: number) => {
    setPlayerNames(playerNames.filter((_, i) => i !== index));
  };

  const startGame = () => {
    const validNames = playerNames.filter(name => name.trim());
    if (validNames.length >= 2) {
      initializeGame(validNames);
    }
  };

  const playerColors = ['red', 'blue', 'green', 'yellow'];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="game-card p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-gold-400 bg-clip-text text-transparent mb-2">
              Monopoly Elite
            </h1>
            <p className="text-muted-foreground">
              Premium board game experience
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* Add Player Section */}
            <div className="space-y-3">
              <Label htmlFor="playerName" className="text-foreground font-semibold">
                Add Players (2-4 players)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="playerName"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Enter player name"
                  onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                  className="flex-1"
                  disabled={playerNames.length >= 4}
                />
                <Button
                  onClick={addPlayer}
                  disabled={!newPlayerName.trim() || playerNames.length >= 4}
                  size="icon"
                  className="premium-button"
                >
                  <UserPlusIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Players List */}
            <div className="space-y-2">
              {playerNames.filter(name => name.trim()).map((name, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <div 
                    className={`w-6 h-6 rounded-full border-2 border-white shadow-md player-token ${playerColors[index]}`}
                  />
                  <span className="flex-1 font-medium text-foreground">
                    {name}
                  </span>
                  <Badge variant="secondary">
                    Player {index + 1}
                  </Badge>
                  <Button
                    onClick={() => removePlayer(index)}
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 text-destructive hover:bg-destructive/20"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Start Game Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={startGame}
                disabled={playerNames.filter(name => name.trim()).length < 2}
                className="gold-button w-full text-lg py-6"
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                Start Game
              </Button>
            </motion.div>

            {/* Game Rules Preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-sm text-muted-foreground space-y-1"
            >
              <p>🎯 Buy properties and collect rent</p>
              <p>🏠 Build houses and hotels</p>
              <p>💰 Manage your money wisely</p>
              <p>🏆 Last player standing wins!</p>
            </motion.div>
          </div>
        </Card>

        {/* Floating Decorations */}
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-20 -right-10 text-6xl opacity-20"
        >
          🏠
        </motion.div>
        
        <motion.div
          animate={{ 
            y: [0, 10, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute -bottom-20 -left-10 text-4xl opacity-20"
        >
          💰
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GameSetup;