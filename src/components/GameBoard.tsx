import React from 'react';
import { motion } from 'framer-motion';
import BoardSpace from './BoardSpace';
import PlayerToken from './PlayerToken';
import { useGameStore } from '../store/gameStore';
import { cn } from '@/lib/utils';

const GameBoard: React.FC = () => {
  const { properties, players, boardStyle, currentPlayer } = useGameStore();

  // Create standard Monopoly board layout (11x11)
  const createBoardLayout = () => {
    const size = 11;
    const layout = Array(size).fill(null).map(() => Array(size).fill(null));
    
    // Bottom row (positions 0-10)
    for (let i = 0; i <= size - 1; i++) {
      layout[size - 1][size - 1 - i] = i;
    }
    
    // Left column (positions 11-19)
    for (let i = 1; i <= size - 2; i++) {
      layout[size - 1 - i][0] = size - 1 + i;
    }
    
    // Top row (positions 20-30)
    for (let i = 0; i <= size - 1; i++) {
      layout[0][i] = 2 * (size - 1) + i;
    }
    
    // Right column (positions 31-39)
    for (let i = 1; i <= size - 2; i++) {
      layout[i][size - 1] = 3 * (size - 1) + i;
    }
    
    return layout;
  };

  const boardLayout = createBoardLayout();
  const boardSize = 11;

  const getBoardSpaceProperty = (position: number) => {
    return properties.find(p => p.position === position);
  };

  const getPlayersAtPosition = (position: number) => {
    return players.filter(p => p.position === position);
  };

  const boardVariants = {
    classic: "bg-gradient-to-br from-emerald-900 to-emerald-800 border-gold-500",
    modern: "bg-gradient-to-br from-gray-900 to-gray-800 border-emerald-500"
  };

  return (
    <div className="relative w-full h-full max-w-4xl mx-auto">
      {/* Board Background */}
      <motion.div 
        className={cn(
          "relative w-full aspect-square rounded-lg border-4 shadow-2xl",
          boardVariants[boardStyle],
          "bg-cover bg-center"
        )}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Grid Lines */}
        <div className="absolute inset-0 grid gap-px" style={{
          gridTemplateRows: `repeat(${boardSize}, 1fr)`,
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`
        }}>
          {boardLayout.map((row, rowIndex) => row.map((cell, colIndex) => (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              className="border border-gold-500/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (rowIndex + colIndex) * 0.02 }}
            />
          )))}
        </div>

        {/* Board Spaces */}
        <div className="absolute inset-0 grid gap-px p-1" style={{
          gridTemplateRows: `repeat(${boardSize}, 1fr)`,
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`
        }}>
          {boardLayout.map((row, rowIndex) => row.map((cell, colIndex) => (
            <div key={`${rowIndex}-${colIndex}`} className="relative">
              <BoardSpace
                property={getBoardSpaceProperty(cell)}
                position={cell}
                isCorner={(rowIndex === 0 || rowIndex === boardSize - 1) && (colIndex === 0 || colIndex === boardSize - 1)}
                onBuy={(propertyId) => {
                  // Handle buy property
                }}
                onMortgage={(propertyId) => {
                  // Handle mortgage property
                }}
                onUnmortgage={(propertyId) => {
                  // Handle unmortgage property
                }}
              />
              
              {/* Player Tokens */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex flex-wrap gap-0.5 max-w-full">
                  {getPlayersAtPosition(cell).map((player, index) => (
                    <PlayerToken
                      key={player.id}
                      color={player.color}
                      isCurrent={player.id === players[currentPlayer]?.id}
                      player={player}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            </div>
          )))}
        </div>

        {/* Center Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-center"
          >
            <div className="text-6xl mb-2">🏠</div>
            <h2 className="text-2xl font-bold text-gold-400">MONOPOLY</h2>
            <p className="text-sm text-gold-300">ELITE</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default GameBoard;