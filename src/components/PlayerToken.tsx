import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '../store/gameStore';
import { cn } from '@/lib/utils';

interface PlayerTokenProps {
  color: 'red' | 'blue' | 'green' | 'yellow';
  isCurrent: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  player: Player;
}

const PlayerToken: React.FC<PlayerTokenProps> = ({ 
  player, 
  color, 
  isCurrent, 
  size = 'md', 
  showLabel = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base'
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

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      className="flex flex-col items-center gap-1"
    >
      <motion.div
        className={cn(
          'player-token flex items-center justify-center font-bold shadow-lg border-2 border-white',
          `player-token ${color}`,
          sizeClasses[size],
          isCurrent ? 'ring-2 ring-white' : ''
        )}
        whileHover={{
          boxShadow: `0 0 15px hsl(var(--player-${color}))`,
        }}
        animate={{
          y: [0, -2, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <span className="drop-shadow-sm">
          {getPlayerIcon(color)}
        </span>
      </motion.div>
      
      {showLabel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-foreground font-medium text-center"
        >
          {player.name}
        </motion.div>
      )}
    </motion.div>
  );
};

export default PlayerToken;