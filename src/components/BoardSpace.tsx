import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Property, useGameStore } from '../store/gameStore';
import { cn } from '@/lib/utils';
import { HomeIcon, BuildingOffice2Icon, BanknotesIcon } from '@heroicons/react/24/solid';

interface BoardSpaceProps {
  property?: Property;
  position: number;
  isCorner: boolean;
  onBuy?: (propertyId: string) => void;
  onMortgage?: (propertyId: string) => void;
  onUnmortgage?: (propertyId: string) => void;
}

const BoardSpace: React.FC<BoardSpaceProps> = ({ 
  property, 
  position, 
  isCorner,
  onBuy,
  onMortgage,
  onUnmortgage 
}) => {
  const { buyProperty, players, currentPlayer } = useGameStore();
  const currentPlayerData = players[currentPlayer];

  // If property is undefined, return a loading state
  if (!property) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "property-space h-full w-full cursor-pointer transition-all duration-300",
          isCorner ? "p-2" : "p-1"
        )}
      >
        <div className="flex-1 flex flex-col items-center justify-center text-center text-xs">
          <div className="animate-pulse h-4 w-20 bg-gray-300 rounded mb-2" />
          {position > 0 && (
            <div className="animate-pulse h-3 w-12 bg-gray-300 rounded" />
          )}
        </div>
      </motion.div>
    );
  }

  // Ensure property has all required fields
  const safeProperty = {
    id: property.id ?? '',
    name: property.name ?? 'Unknown',
    price: property.price ?? 0,
    rent: property.rent ?? 0,
    color: property.color ?? 'special',
    position: property.position ?? 0,
    houses: property.houses ?? 0,
    hotels: property.hotels ?? 0,
    owner: property.owner ?? '',
    mortgaged: property.mortgaged ?? false
  };

  const getPropertyColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      brown: 'bg-amber-800',
      lightblue: 'bg-sky-400',
      pink: 'bg-pink-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-400',
      green: 'bg-green-500',
      darkblue: 'bg-blue-700',
      railroad: 'bg-gray-800',
      utility: 'bg-gray-600',
      special: 'bg-gradient-to-br from-gold-400 to-gold-600'
    };
    return colorMap[color] || 'bg-gray-500';
  };

  const getSpecialSpaceIcon = () => {
    if (!safeProperty.id) return null;

    switch (safeProperty.id) {
      case 'go':
        return <BanknotesIcon className="w-6 h-6 text-gold-500" />;
      case 'jail':
        return <span className="text-2xl">🔒</span>;
      case 'free-parking':
        return <span className="text-2xl">🅿️</span>;
      case 'go-to-jail':
        return <span className="text-2xl">👮</span>;
      default:
        return null;
    }
  };

  const handlePropertyClick = () => {
    if (safeProperty.color !== 'special' && safeProperty.id) {
      if (safeProperty.owner) {
        // Show options for mortgaging/unmortgaging
        const options = [
          { label: 'Mortgage', action: onMortgage },
          { label: 'Unmortgage', action: onUnmortgage }
        ];
        
        const dialog = document.createElement('dialog');
        dialog.innerHTML = `
          <h3 class="font-bold mb-2">${safeProperty.name}</h3>
          <div class="space-y-2">
            ${options.map(option => `
              <button 
                onclick="this.closest('dialog').close('${option.label}')" 
                class="w-full px-4 py-2 rounded bg-primary text-white hover:bg-primary/90"
              >
                ${option.label}
              </button>
            `).join('')}
          </div>
        `;
        document.body.appendChild(dialog);
        dialog.showModal();

        dialog.addEventListener('close', () => {
          const action = dialog.returnValue;
          if (action === 'Mortgage' && onMortgage) {
            onMortgage(safeProperty.id);
          } else if (action === 'Unmortgage' && onUnmortgage) {
            onUnmortgage(safeProperty.id);
          }
          dialog.remove();
        });
      } else if (onBuy) {
        onBuy(safeProperty.id);
      }
    }
  };

  // Add animations for property status changes
  const propertyVariants = {
    owned: {
      scale: 1.05,
      transition: { duration: 0.3 }
    },
    mortgaged: {
      opacity: 0.5,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handlePropertyClick}
      className={cn(
        "property-space h-full w-full cursor-pointer transition-all duration-300",
        isCorner ? "p-2" : "p-1",
        safeProperty.owner ? "ring-2 ring-gold-500" : "",
        safeProperty.mortgaged ? "opacity-50" : ""
      )}
    >
      {/* Property Color Bar */}
      {safeProperty.color !== 'special' && (
        <motion.div 
          className={cn(
            "w-full h-2 rounded-t",
            getPropertyColorClass(safeProperty.color)
          )}
          animate={safeProperty.owner ? "owned" : ""}
          variants={propertyVariants}
        />
      )}
      
      {/* Property Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center text-xs">
        {safeProperty.color === 'special' ? (
          <div className="flex flex-col items-center justify-center h-full">
            {getSpecialSpaceIcon()}
            <span className="font-semibold text-gold-500 mt-1">
              {safeProperty.name?.split(' ')[0] ?? 'Special'}
            </span>
          </div>
        ) : (
          <>
            <div className="font-semibold text-foreground leading-tight mb-1">
              {safeProperty.name?.length > 12 
                ? safeProperty.name?.substring(0, 12) + '...' 
                : safeProperty.name
              }
            </div>
            
            {safeProperty.price > 0 && (
              <div className="text-gold-400 font-bold">
                ${safeProperty.price}
              </div>
            )}
            
            {(safeProperty.houses > 0 || safeProperty.hotels > 0) && (
              <div className="flex gap-1 mt-1">
                {Array(safeProperty.houses).fill(0).map((_, i) => (
                  <HomeIcon key={i} className="w-2 h-2 text-game-property-house" />
                ))}
                {Array(safeProperty.hotels).fill(0).map((_, i) => (
                  <BuildingOffice2Icon key={i} className="w-3 h-3 text-game-property-hotel" />
                ))}
              </div>
            )}
            
            {safeProperty.owner && (
              <motion.div 
                className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-primary shadow-sm"
                animate={"owned"}
                variants={propertyVariants}
              />
            )}
            
            {safeProperty.mortgaged && (
              <motion.div 
                className="absolute top-0 left-0 w-full h-full bg-red-500/20 flex items-center justify-center"
                animate={"mortgaged"}
                variants={propertyVariants}
              >
                <span className="text-red-500 font-bold text-xs">M</span>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default BoardSpace;