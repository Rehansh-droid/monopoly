import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DiceRoller: React.FC = () => {
  const { dice, isRolling, rollDice } = useGameStore();

  const getDiceDots = (value: number) => {
    const dots = Array(value).fill(0);
    return dots.map((_, i) => (
      <div 
        key={i} 
        className="w-1.5 h-1.5 bg-gray-800 rounded-full"
      />
    ));
  };

  const getDiceLayout = (value: number) => {
    const layouts: Record<number, string> = {
      1: 'grid-cols-1 place-items-center',
      2: 'grid-cols-2 gap-2',
      3: 'grid-cols-2 gap-1',
      4: 'grid-cols-2 gap-1',
      5: 'grid-cols-3 gap-1',
      6: 'grid-cols-2 gap-1'
    };
    return layouts[value] || 'grid-cols-1 place-items-center';
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Dice Display */}
      <div className="flex gap-3">
        {dice.map((value, index) => (
          <motion.div
            key={index}
            className={cn(
              "dice relative",
              isRolling && "rolling"
            )}
            animate={isRolling ? {
              rotate: [0, 90, 180, 270, 360],
              scale: [1, 1.1, 1.2, 1.1, 1]
            } : {}}
            transition={{
              duration: 0.6,
              ease: "easeInOut"
            }}
          >
            <div className={cn(
              "grid h-full w-full p-2",
              getDiceLayout(value)
            )}>
              {getDiceDots(value)}
            </div>
            
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 dice rounded-lg opacity-0"
              animate={isRolling ? {
                opacity: [0, 0.5, 0],
                boxShadow: [
                  '0 0 0 rgba(255, 255, 255, 0)',
                  '0 0 20px rgba(255, 255, 255, 0.5)',
                  '0 0 0 rgba(255, 255, 255, 0)'
                ]
              } : {}}
              transition={{ duration: 0.6 }}
            />
          </motion.div>
        ))}
      </div>

      {/* Dice Total */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-2xl font-bold text-gold-400"
      >
        Total: {dice[0] + dice[1]}
      </motion.div>

      {/* Roll Button */}
      <Button
        onClick={rollDice}
        disabled={isRolling}
        className={cn(
          "gold-button min-w-24",
          isRolling && "animate-pulse"
        )}
      >
        {isRolling ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
          >
            🎲
          </motion.div>
        ) : (
          'Roll Dice'
        )}
      </Button>

      {/* Double Roll Indicator */}
      {dice[0] === dice[1] && !isRolling && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-gold-400 font-semibold bg-gold-400/20 px-3 py-1 rounded-full"
        >
          🎉 Doubles! 🎉
        </motion.div>
      )}
    </div>
  );
};

export default DiceRoller;