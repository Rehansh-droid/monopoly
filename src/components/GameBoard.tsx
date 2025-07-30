import React from 'react';
import { motion } from 'framer-motion';
import BoardSpace from './BoardSpace';
import PlayerToken from './PlayerToken';
import { useGameStore } from '../store/gameStore';
import { cn } from '@/lib/utils';

const GameBoard: React.FC = () => {
  const { properties, players, boardStyle, currentPlayer } = useGameStore();

  // Create board layout - dynamic based on screen size
  const createBoardLayout = (size: number) => {
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

  // Get board size based on screen width
  const getBoardSize = () => {
    const width = window.innerWidth;
    if (width >= 1280) return 11; // Large screens
    if (width >= 768) return 9; // Medium screens
    return 7; // Small screens
  };

  const boardSize = getBoardSize();
  const boardLayout = createBoardLayout(boardSize);

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
    <div className="relative w-full h-full">
      {/* Board Background */}
      <motion.div 
        className={cn(
          "absolute inset-0 rounded-lg border-4",
          boardVariants[boardStyle],
          "bg-cover bg-center"
        )}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Grid Lines */}
        <div className="absolute inset-0 grid gap-0" style={{
          gridTemplateRows: `repeat(${boardSize}, 1fr)`,
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`
        }}>
          {boardLayout.map((row, rowIndex) => row.map((cell, colIndex) => (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              className="border-b border-r border-gold-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (rowIndex + colIndex) * 0.02 }}
            />
          )))}
        </div>

        {/* Board Spaces */}
        <div className="absolute inset-0 grid gap-0" style={{
          gridTemplateRows: `repeat(${boardSize}, 1fr)`,
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`
        }}>
          {boardLayout.map((row, rowIndex) => row.map((cell, colIndex) => (
            <BoardSpace
              key={`${rowIndex}-${colIndex}`}
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
          )))}
        </div>

        {/* Player Tokens */}
        {boardLayout.map((row, rowIndex) => row.map((cell, colIndex) => (
          <div
            key={`tokens-${rowIndex}-${colIndex}`}
            className="absolute inset-0 grid gap-0"
            style={{
              gridTemplateRows: `repeat(${boardSize}, 1fr)`,
              gridTemplateColumns: `repeat(${boardSize}, 1fr)`
            }}
          >
            <div className="flex items-center justify-center">
              <div className="flex flex-col gap-1">
                {getPlayersAtPosition(cell).map(player => (
                  <PlayerToken
                    key={player.id}
                    color={player.color}
                    isCurrent={player.id === players[currentPlayer].id}
                    player={player}
                  />
                ))}
              </div>
            </div>
          </div>
        )))}
      </motion.div>

      {/* Responsive Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-full bg-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          Roll Dice
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-full bg-secondary text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          End Turn
        </motion.button>
      </div>
    </div>
  );
};

export default GameBoard;