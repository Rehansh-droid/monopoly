import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PlayIcon, 
  UserMinusIcon, 
  ArrowLeftIcon,
  UsersIcon
} from '@heroicons/react/24/solid';
import { socketService, GameRoom } from '../services/socketService';
import { useToast } from '@/hooks/use-toast';

interface GameLobbyProps {
  onStartGame: () => void;
  onBack: () => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({ onStartGame, onBack }) => {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const currentPlayer = socketService.getCurrentPlayer();

  useEffect(() => {
    console.debug('GameLobby useEffect triggered');
    console.debug('Current player info:', currentPlayer);
    
    // Get debug info
    const debugInfo = socketService.getDebugRoomInfo(currentPlayer.gameId);
    console.debug('Debug room info:', debugInfo);

    // Load initial room state
    const loadRoom = async () => {
      let retries = 0;
      const maxRetries = 5;
      const retryDelay = 500; // 500ms between retries

      while (retries < maxRetries) {
        console.debug(`Attempt ${retries + 1} to load room`);
        const currentRoom = socketService.getCurrentRoom();
        console.debug('Current room:', currentRoom);
        
        if (currentRoom) {
          console.debug('Room loaded successfully');
          setRoom(currentRoom);
          return;
        }
        retries++;
        console.debug(`Room not found, retrying in ${retryDelay}ms`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      console.debug('All retries failed, room not found');
    };

    loadRoom();

    // Listen for room updates
    const unsubscribe = socketService.onMessage((message) => {
      switch (message.type) {
        case 'PLAYER_JOINED':
          setRoom(message.data.room);
          toast({
            title: "Player Joined",
            description: `${message.data.newPlayer.name} joined the game`,
          });
          break;
          
        case 'PLAYER_LEFT':
          setRoom(message.data.room);
          toast({
            title: "Player Left",
            description: "A player left the game",
          });
          break;
          
        case 'GAME_STARTED':
          onStartGame();
          break;
          
        case 'ROOM_UPDATED':
          setRoom(message.data);
          break;
          
        default:
          break;
      }
    });

    return unsubscribe;
  }, [onStartGame, toast]);

  const handleStartGame = () => {
    if (!currentPlayer.isHost || !room) return;
    
    if (room.players.length < 2) {
      toast({
        title: "Need More Players",
        description: "At least 2 players are required to start the game",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const success = socketService.startGame();
    
    if (success) {
      onStartGame();
    } else {
      setIsLoading(false);
      toast({
        title: "Failed to Start",
        description: "Could not start the game. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLeave = () => {
    socketService.leaveGame();
    onBack();
  };

  const getPlayerIcon = (color: string) => {
    const icons: Record<string, string> = {
      red: '🚗',
      blue: '🚢',
      green: '🐕',
      yellow: '👠'
    };
    return icons[color] || '🎮';
  };

  const copyGameId = () => {
    if (room) {
      navigator.clipboard.writeText(room.id);
      toast({
        title: "Copied!",
        description: "Game ID copied to clipboard",
      });
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="game-card p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-4">Game Not Found</h2>
          <Button onClick={onBack} className="premium-button">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <Card className="game-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-5xl mb-4"
            >
              🏠
            </motion.div>
            
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Game Lobby
            </h1>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge variant="secondary" className="text-lg px-4 py-1">
                {room.id}
              </Badge>
              <Button
                onClick={copyGameId}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                📋
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <UsersIcon className="w-4 h-4" />
              <span>{room.players.length}/{room.maxPlayers} Players</span>
            </div>
          </div>

          {/* Players List */}
          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-foreground text-center">Players</h3>
            
            <div className="space-y-3">
              <AnimatePresence>
                {room.players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg border border-border/50"
                  >
                    <div className="h-12 w-12 rounded-full flex items-center justify-center shadow-md border-2 border-white player-token" 
                         style={{ backgroundColor: `hsl(var(--player-${player.color}))` }}>
                      <span className="text-2xl">
                        {getPlayerIcon(player.color)}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {player.name}
                        </span>
                        {player.isHost && (
                          <span className="text-gold-500 text-sm">👑</span>
                        )}
                        {player.id === currentPlayer.playerId && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {player.color} Player
                      </div>
                    </div>
                    
                    {/* Ready indicator */}
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-3 h-3 bg-green-500 rounded-full"
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Empty slots */}
            {Array(room.maxPlayers - room.players.length).fill(0).map((_, index) => (
              <motion.div
                key={`empty-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-4 p-4 bg-muted/10 rounded-lg border border-dashed border-border/30"
              >
                <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center">
                  <span className="text-2xl opacity-50">👤</span>
                </div>
                <div className="flex-1">
                  <div className="text-muted-foreground">
                    Waiting for player...
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {currentPlayer.isHost ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleStartGame}
                  disabled={isLoading || room.players.length < 2}
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
                    <PlayIcon className="w-5 h-5 mr-2" />
                  )}
                  Start Game
                </Button>
              </motion.div>
            ) : (
              <div className="text-center py-4">
                <div className="text-muted-foreground mb-2">
                  Waiting for host to start the game...
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-2xl"
                >
                  ⏳
                </motion.div>
              </div>
            )}

            <Button
              onClick={handleLeave}
              variant="outline"
              className="w-full"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Leave Game
            </Button>
          </div>

          {/* Game Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center text-sm text-muted-foreground space-y-1"
          >
            <p>🎯 Classic Monopoly Rules</p>
            <p>🏠 Buy properties, build houses & hotels</p>
            <p>💰 Collect rent and manage your money</p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default GameLobby;