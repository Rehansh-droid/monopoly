import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LinkIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { socketService } from '../services/socketService';
import { useToast } from '@/hooks/use-toast';

const JoinGame = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!gameId) {
      navigate('/');
      return;
    }
  }, [gameId, navigate]);

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to join the game",
        variant: "destructive"
      });
      return;
    }

    if (!gameId) {
      toast({
        title: "Invalid Game ID",
        description: "Game ID is missing",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await socketService.joinGame(gameId.toUpperCase(), playerName.trim());
      navigate(`/lobby/${gameId.toUpperCase()}`);
      toast({
        title: "Joined Game!",
        description: `Successfully joined game ${gameId.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        title: "Join Failed",
        description: error.message || "Failed to join game. The game might be full or already started.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute top-20 left-20 w-32 h-32 bg-primary rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute bottom-20 right-20 w-40 h-40 bg-secondary rounded-full blur-xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="game-card p-8">
          {/* Header */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.3 }}
            className="text-center mb-8"
          >
            <div className="text-6xl mb-4 animate-float">🎮</div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Join Game
            </h1>
            <p className="text-muted-foreground mb-4">
              You're about to join an exciting Monopoly game!
            </p>
            <Badge variant="secondary" className="text-lg px-4 py-1">
              Game ID: {gameId}
            </Badge>
          </motion.div>

          {/* Join Form */}
          <div className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="playerName" className="text-foreground font-semibold">
                Your Name
              </Label>
              <Input
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your player name"
                className="text-center font-medium"
                maxLength={20}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
                autoFocus
              />
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleJoinGame}
                disabled={isLoading || !playerName.trim()}
                className="gold-button w-full text-lg py-6"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 mr-2"
                  >
                    ⚡
                  </motion.div>
                ) : (
                  <LinkIcon className="w-5 h-5 mr-2" />
                )}
                {isLoading ? 'Joining...' : 'Join Game'}
              </Button>
            </motion.div>

            <Button
              onClick={handleBack}
              variant="outline"
              className="w-full"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          {/* Game Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center text-sm text-muted-foreground space-y-2"
          >
            <p>🎯 Real-time multiplayer Monopoly</p>
            <p>🏠 Buy properties, build houses & hotels</p>
            <p>💰 Trade with other players</p>
            <p>🏆 Last player standing wins!</p>
          </motion.div>
        </Card>

        {/* Floating Elements */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-16 -right-8 text-4xl opacity-30"
        >
          🎲
        </motion.div>
        
        <motion.div
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -8, 0]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute -bottom-12 -left-8 text-3xl opacity-30"
        >
          💰
        </motion.div>
      </motion.div>
    </div>
  );
};

export default JoinGame;