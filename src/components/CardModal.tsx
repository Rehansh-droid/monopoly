import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const CardModal: React.FC = () => {
  const { currentCard, setCurrentCard, players, currentPlayer } = useGameStore();
  
  if (!currentCard) return null;

  const handleClose = () => setCurrentCard(null);

  const getCardStyle = () => {
    return currentCard.type === 'chance' 
      ? 'bg-gradient-to-br from-orange-500 to-red-600'
      : 'bg-gradient-to-br from-blue-500 to-purple-600';
  };

  const getCardIcon = () => {
    return currentCard.type === 'chance' ? '🎯' : '🏘️';
  };

  return (
    <Dialog open={!!currentCard} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm p-0 border-0 bg-transparent">
        <motion.div
          initial={{ scale: 0, rotateY: 180 }}
          animate={{ scale: 1, rotateY: 0 }}
          exit={{ scale: 0, rotateY: 180 }}
          transition={{ duration: 0.6, ease: "backOut" }}
          className={`${getCardStyle()} rounded-xl p-6 text-white shadow-2xl`}
        >
          {/* Card Header */}
          <div className="text-center mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl mb-2"
            >
              {getCardIcon()}
            </motion.div>
            <Badge 
              variant="secondary" 
              className="bg-white/20 text-white border-white/30"
            >
              {currentCard.type.charAt(0).toUpperCase() + currentCard.type.slice(1)}
            </Badge>
          </div>

          {/* Card Content */}
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold">
              {currentCard.title}
            </h3>
            <p className="text-white/90 leading-relaxed">
              {currentCard.description}
            </p>
            
            {currentCard.value && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-2xl font-bold text-yellow-300"
              >
                {currentCard.value > 0 ? '+' : ''}${Math.abs(currentCard.value)}
              </motion.div>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-6">
            <Button 
              onClick={handleClose}
              className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
              variant="outline"
            >
              Continue
            </Button>
          </div>

          {/* Card Decorations */}
          <div className="absolute top-2 left-2 w-3 h-3 bg-white/30 rounded-full" />
          <div className="absolute top-2 right-2 w-3 h-3 bg-white/30 rounded-full" />
          <div className="absolute bottom-2 left-2 w-3 h-3 bg-white/30 rounded-full" />
          <div className="absolute bottom-2 right-2 w-3 h-3 bg-white/30 rounded-full" />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default CardModal;