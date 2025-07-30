import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import PlayerToken from './PlayerToken';
import DiceRoller from './DiceRoller';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BanknotesIcon, HomeIcon, CogIcon } from '@heroicons/react/24/solid';

const GamePanel: React.FC = () => {
  const { 
    players, 
    currentPlayer, 
    turnActions, 
    endTurn, 
    gamePhase,
    setBoardStyle,
    boardStyle 
  } = useGameStore();

  const currentPlayerData = players[currentPlayer];

  if (gamePhase !== 'playing' || !currentPlayerData) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-80 space-y-4"
    >
      {/* Current Player Panel */}
      <Card className="game-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <PlayerToken player={currentPlayerData} size="lg" />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground">
              {currentPlayerData.name}'s Turn
            </h3>
            <div className="flex items-center gap-2 text-gold-400">
              <BanknotesIcon className="w-4 h-4" />
              <span className="font-semibold">${currentPlayerData.money}</span>
            </div>
          </div>
        </div>

        {/* Properties Count */}
        <div className="flex items-center gap-2 mb-4">
          <HomeIcon className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            {currentPlayerData.properties.length} Properties
          </span>
        </div>

        {/* Dice Roller */}
        <DiceRoller />

        {/* End Turn Button */}
        <Button 
          onClick={endTurn}
          className="premium-button w-full mt-4"
        >
          End Turn
        </Button>
      </Card>

      {/* Turn Actions */}
      {turnActions.length > 0 && (
        <Card className="game-card p-4">
          <h4 className="font-semibold text-foreground mb-3">Turn Actions</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {turnActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-sm text-muted-foreground bg-muted/50 rounded px-2 py-1"
              >
                {action}
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* All Players Panel */}
      <Card className="game-card p-4">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>Players</span>
          <Badge variant="secondary">{players.length}</Badge>
        </h4>
        <div className="space-y-3">
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                index === currentPlayer 
                  ? 'bg-primary/20 ring-1 ring-primary' 
                  : 'bg-muted/30'
              }`}
            >
              <PlayerToken player={player} size="sm" />
              <div className="flex-1">
                <div className="font-medium text-foreground text-sm">
                  {player.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  ${player.money} • {player.properties.length} props
                </div>
              </div>
              {index === currentPlayer && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-primary rounded-full"
                />
              )}
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Board Style Selector */}
      <Card className="game-card p-4">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <CogIcon className="w-4 h-4" />
          Board Style
        </h4>
        <div className="flex gap-2">
          <Button
            variant={boardStyle === 'classic' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBoardStyle('classic')}
            className="flex-1"
          >
            Classic
          </Button>
          <Button
            variant={boardStyle === 'modern' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBoardStyle('modern')}
            className="flex-1"
          >
            Modern
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default GamePanel;