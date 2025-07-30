import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { HomeIcon, BuildingOffice2Icon, BanknotesIcon } from '@heroicons/react/24/solid';

const PropertyModal: React.FC = () => {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const { 
    properties, 
    players, 
    currentPlayer,
    buyProperty,
    sellProperty,
    buildHouse,
    buildHotel,
    mortgageProperty,
    unmortgageProperty
  } = useGameStore();

  const property = selectedProperty ? properties.find(p => p.id === selectedProperty) : null;
  const currentPlayerData = players[currentPlayer];
  const isOwner = property?.owner === currentPlayerData?.id;
  const canBuy = property && !property.owner && currentPlayerData?.money >= property.price;

  React.useEffect(() => {
    const handlePropertyClick = (event: CustomEvent) => {
      setSelectedProperty(event.detail.propertyId);
    };

    window.addEventListener('propertyClick', handlePropertyClick as EventListener);
    return () => window.removeEventListener('propertyClick', handlePropertyClick as EventListener);
  }, []);

  const handleClose = () => setSelectedProperty(null);

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

  if (!property || property.color === 'special') return null;

  return (
    <Dialog open={!!selectedProperty} onOpenChange={handleClose}>
      <DialogContent className="game-card max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded ${getPropertyColorClass(property.color)}`} />
            {property.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Info */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-semibold text-gold-400">${property.price}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Rent:</span>
              <span className="font-semibold">${property.rent}</span>
            </div>
            
            {property.owner && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Owner:</span>
                <Badge variant="secondary">
                  {players.find(p => p.id === property.owner)?.name}
                </Badge>
              </div>
            )}
          </div>

          {/* Development Info */}
          {isOwner && property.color !== 'railroad' && property.color !== 'utility' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">Houses:</span>
                <div className="flex gap-1">
                  {Array(4).fill(0).map((_, i) => (
                    <HomeIcon 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < property.houses ? 'text-game-property-house' : 'text-muted-foreground/30'
                      }`} 
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">Hotels:</span>
                <BuildingOffice2Icon 
                  className={`w-5 h-5 ${
                    property.hotels > 0 ? 'text-game-property-hotel' : 'text-muted-foreground/30'
                  }`} 
                />
              </div>
            </div>
          )}

          {/* Status */}
          {property.mortgaged && (
            <Badge variant="destructive" className="w-full justify-center">
              Mortgaged
            </Badge>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {canBuy && (
              <Button 
                onClick={() => buyProperty(property.id)}
                className="gold-button w-full"
              >
                <BanknotesIcon className="w-4 h-4 mr-2" />
                Buy for ${property.price}
              </Button>
            )}

            {isOwner && (
              <div className="space-y-2">
                {property.color !== 'railroad' && property.color !== 'utility' && (
                  <>
                    {property.houses < 4 && property.hotels === 0 && (
                      <Button 
                        onClick={() => buildHouse(property.id)}
                        disabled={currentPlayerData?.money < 50}
                        className="premium-button w-full"
                        size="sm"
                      >
                        <HomeIcon className="w-4 h-4 mr-2" />
                        Build House ($50)
                      </Button>
                    )}
                    
                    {property.houses === 4 && property.hotels === 0 && (
                      <Button 
                        onClick={() => buildHotel(property.id)}
                        disabled={currentPlayerData?.money < 100}
                        className="premium-button w-full"
                        size="sm"
                      >
                        <BuildingOffice2Icon className="w-4 h-4 mr-2" />
                        Build Hotel ($100)
                      </Button>
                    )}
                  </>
                )}

                <div className="flex gap-2">
                  {!property.mortgaged ? (
                    <Button 
                      onClick={() => mortgageProperty(property.id)}
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      Mortgage (${Math.floor(property.price / 2)})
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => unmortgageProperty(property.id)}
                      disabled={currentPlayerData?.money < Math.floor(property.price * 0.55)}
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      Unmortgage (${Math.floor(property.price * 0.55)})
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => sellProperty(property.id)}
                    variant="destructive"
                    className="flex-1"
                    size="sm"
                  >
                    Sell (${Math.floor(property.price * 0.9)})
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyModal;