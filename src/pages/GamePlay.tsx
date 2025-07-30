import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { socketService } from '../services/socketService';
import GameBoard from '../components/GameBoard';
import { useToast } from '@/hooks/use-toast';
import { Property } from '../store/gameStore';

interface GamePlayProps {
  onBuy: (propertyId: string) => Promise<void>;
  onMortgage: (propertyId: string) => Promise<void>;
  onUnmortgage: (propertyId: string) => Promise<void>;
}

const GamePlay: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { properties, players, currentPlayer, rollDice, movePlayer } = useGameStore();
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeGame = async () => {
      try {
        if (!gameId) return;
        
        // Get room state from backend
        const room = await socketService.getRoomById(gameId);
        setCurrentRoom(room);
        
        // Listen for property updates
        socketService.onEvent('property-updated', (data) => {
          const { property, player, action } = data;
          
          // Update property in store
          const updatedProperties = properties.map(p => 
            p.id === property.id ? { ...p, ...property } : p
          );
          
          // Update player in store
          const updatedPlayers = players.map(p => 
            p.id === player.id ? { ...p, ...player } : p
          );
          
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
          
          // Update current player in store
          const updatedPlayersList = players.map(p => 
            p.id === updatedPlayers[newCurrentPlayer].id ? 
              { ...p, ...updatedPlayers[newCurrentPlayer] } : 
              p
          );
          
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
        navigate('/lobby');
      }
    };

    initializeGame();

    return () => {
      socketService.offEvent('property-updated');
      socketService.offEvent('turn-updated');
    };
  }, [gameId, navigate]);

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

  if (!currentRoom) {
    return (
      <div className="flex items-center justify-center h-screen">
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
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-hidden">
        <GameBoard />
      </div>
      <div className="p-4 bg-background/80 backdrop-blur-sm">
        <div className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => rollDice()}
            className="px-4 py-2 rounded-full bg-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Roll Dice
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEndTurn}
            className="px-4 py-2 rounded-full bg-secondary text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            End Turn
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default GamePlay;