/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  PlusIcon, 
  LinkIcon, 
  UserGroupIcon, 
  PlayIcon,
  ShareIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/solid';
import { socketService } from '../services/socketService';
import { useToast } from '@/hooks/use-toast';

interface LandingPageProps {
  onNavigateToLobby: (gameId: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLobby }) => {
  const [gameId, setGameId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to create a game",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const newGameId = await socketService.createGame(playerName.trim());
      if (newGameId) {
        onNavigateToLobby(newGameId);
        toast({
          title: "Game Created!",
          description: `Game ID: ${newGameId}. Share this with friends!`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create game. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to join a game",
        variant: "destructive"
      });
      return;
    }

    if (!gameId.trim()) {
      toast({
        title: "Game ID Required",
        description: "Please enter a valid game ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await socketService.joinGame(gameId.trim().toUpperCase(), playerName.trim());
      onNavigateToLobby(gameId.trim().toUpperCase());
      toast({
        title: "Joined Game!",
        description: `Successfully joined game ${gameId.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        title: "Join Failed",
        description: error.message || "Failed to join game. Please check the game ID.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowJoinForm = () => {
    setShowJoinForm(true);
    setGameId('');
  };

  const handleBackToMain = () => {
    setShowJoinForm(false);
    setGameId('');
  };
  const copyGameId = () => {
    navigator.clipboard.writeText(gameId);
    toast({
      title: "Copied!",
      description: "Game ID copied to clipboard",
    });
  };

  const shareGameLink = () => {
    const url = `${window.location.origin}?gameId=${gameId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "Share this link with friends to join your game",
    });
  };

  // Check for game ID in URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlGameId = params.get('gameId');
    if (urlGameId) {
      setGameId(urlGameId);
      setShowJoinForm(true);
    }
  }, []);

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
            <div className="text-6xl mb-4 animate-float">🏠</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Monopoly Elite
            </h1>
            <p className="text-muted-foreground">
              Premium multiplayer board game experience
            </p>
            <Badge variant="secondary" className="mt-2">
              Real-time Multiplayer
            </Badge>
          </motion.div>

          {!showJoinForm ? (
            /* Create Game Form */
            <div className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="hostName" className="text-foreground font-semibold">
                  Your Name (Host)
                </Label>
                <Input
                  id="hostName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name as game host"
                  className="text-center font-medium"
                  maxLength={20}
                />
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleCreateGame}
                  disabled={isLoading || !playerName.trim()}
                  className="gold-button w-full text-lg py-6"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create New Game
                </Button>
              </motion.div>

              <div className="flex items-center gap-2">
                <hr className="flex-1 border-border" />
                <span className="text-muted-foreground text-sm">OR</span>
                <hr className="flex-1 border-border" />
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleShowJoinForm}
                  variant="outline"
                  className="w-full text-lg py-6"
                >
                  <LinkIcon className="w-5 h-5 mr-2" />
                  Join Existing Game
                </Button>
              </motion.div>
            </div>
          ) : (
            /* Join Game Form */
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
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="gameId" className="text-foreground font-semibold">
                  Game ID
                </Label>
                <Input
                  id="gameId"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit game ID"
                  className="text-center font-mono text-lg tracking-wider"
                  maxLength={6}
                />
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleJoinGame}
                  disabled={isLoading || !playerName.trim() || !gameId.trim()}
                  className="premium-button w-full text-lg py-6"
                >
                  <LinkIcon className="w-5 h-5 mr-2" />
                  Join Game
                </Button>
              </motion.div>

              <Button
                onClick={handleBackToMain}
                variant="ghost"
                className="w-full"
              >
                ← Back to Main Menu
              </Button>
            </div>
          )}

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-center text-sm text-muted-foreground space-y-2"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1">
                <UserGroupIcon className="w-4 h-4" />
                <span>2-4 Players</span>
              </div>
              <div className="flex items-center gap-1">
                <PlayIcon className="w-4 h-4" />
                <span>Real-time</span>
              </div>
            </div>
            <p>🎯 Classic Monopoly with modern multiplayer features</p>
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

export default LandingPage;