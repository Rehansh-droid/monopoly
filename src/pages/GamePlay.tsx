import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { socketService } from '../services/socketService';
import GameBoard from '../components/GameBoard';
import GamePanel from '../components/GamePanel';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

const GamePlay: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { properties, players, currentPlayer, rollDice, movePlayer, initializeGame } = useGameStore();
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initializeGame = async () => {
      try {
        if (!gameId) return;
        
        setIsLoading(true);
        
        // Initialize mock game for now (replace with real socket data later)
        const mockPlayers = ['Player 1', 'Player 2', 'Player 3'];
        useGameStore.getState().initializeGame(mockPlayers);
        
        setCurrentRoom({ id: gameId, players: mockPlayers });
        setIsLoading(false);
        
        // Listen for property updates
        socketService.onEvent('property-updated', (data) => {
          const { property, player, action } = data;
          
          // Show notification
          toast({
            title: 'Success',
            description: `${player.name} ${action} ${property.name}`,
            variant: 'default'
          });
        });

        // Listen for turn updates
        socketService.onEvent('turn-updated', (data) => {
          const { currentPlayer: newCurrentPlayer, players: updatedPlayers } = data;
          
          // Show notification
          toast({
            title: 'Turn Change',
            description: `${updatedPlayers[newCurrentPlayer].name}'s turn`,
            variant: 'default'
          });
        });
      } catch (error) {
        console.error('Error initializing game:', error);
        toast({
          title: 'Error',
          description: 'Failed to load game',
          variant: 'destructive'
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    initializeGame();

    return () => {
      socketService.offEvent('property-updated');
      socketService.offEvent('turn-updated');
    };
  }, [gameId, navigate, toast]);

  const handleBuyProperty = async (propertyId: string) => {
    try {
      await socketService.emitEvent('buy-property', { propertyId });
      toast({
        title: 'Success',
        description: 'Property purchased!',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to buy property',
        variant: 'destructive'
      });
    }
  };

  const handleMortgageProperty = async (propertyId: string) => {
    try {
      await socketService.emitEvent('mortgage-property', { propertyId });
      toast({
        title: 'Success',
        description: 'Property mortgaged!',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mortgage property',
        variant: 'destructive'
      });
    }
  };

  const handleUnmortgageProperty = async (propertyId: string) => {
    try {
      await socketService.emitEvent('unmortgage-property', { propertyId });
      toast({
        title: 'Success',
        description: 'Property unmortgaged!',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unmortgage property',
        variant: 'destructive'
      });
    }
  };

  const handleEndTurn = async () => {
    try {
      await socketService.emitEvent('end-turn', { gameId });
      toast({
        title: 'Turn Ended',
        description: 'Turn ended',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to end turn',
        variant: 'destructive'
      });
    }
  };

  const handleLeaveGame = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading game...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleLeaveGame}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Leave Game
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Monopoly Elite</h1>
                <p className="text-sm text-muted-foreground">Game ID: {gameId}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {players[currentPlayer]?.name}'s Turn
              </p>
              <p className="text-xs text-muted-foreground">
                {players.length} Players
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
          {/* Game Board - Left Side */}
          <div className="lg:col-span-3 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-4xl"
            >
              <GameBoard />
            </motion.div>
          </div>

          {/* Game Panel - Right Side */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="h-full"
            >
              <GamePanel />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePlay;