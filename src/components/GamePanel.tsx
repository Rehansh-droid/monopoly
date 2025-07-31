import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import PlayerToken from './PlayerToken';
import DiceRoller from './DiceRoller';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BanknotesIcon, HomeIcon, CogIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/solid';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

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
  
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{id: string, player: string, message: string, timestamp: Date}>>([]);

  const currentPlayerData = players[currentPlayer];
  
  const handleSendMessage = () => {
    if (!chatMessage.trim() || !currentPlayerData) return;
    
    const newMessage = {
      id: Date.now().toString(),
      player: currentPlayerData.name,
      message: chatMessage.trim(),
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, newMessage]);
    setChatMessage('');
  };

  if (gamePhase !== 'playing' || !currentPlayerData) {
    return null;
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Current Player Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="game-card p-4">
          <div className="flex items-center gap-3 mb-4">
            <PlayerToken player={currentPlayerData} size="lg" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground">
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
      </motion.div>

      {/* All Players Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1"
      >
        <Card className="game-card p-4 h-full flex flex-col">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <span>Players</span>
            <Badge variant="secondary">{players.length}</Badge>
          </h4>
          <ScrollArea className="flex-1">
            <div className="space-y-3">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
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
          </ScrollArea>
        </Card>
      </motion.div>

      {/* Chat Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1"
      >
        <Card className="game-card p-4 h-full flex flex-col">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <ChatBubbleLeftIcon className="w-4 h-4" />
            Chat
          </h4>
          
          <ScrollArea className="flex-1 mb-4">
            <div className="space-y-2">
              {chatHistory.map((msg) => (
                <div key={msg.id} className="text-sm">
                  <span className="font-medium text-primary">{msg.player}:</span>
                  <span className="ml-2 text-foreground">{msg.message}</span>
                </div>
              ))}
              {chatHistory.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No messages yet. Start chatting!
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex gap-2">
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="sm">
              Send
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Turn Actions & History */}
      {turnActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="game-card p-4">
            <h4 className="font-semibold text-foreground mb-3">Recent Actions</h4>
            <ScrollArea className="max-h-32">
              <div className="space-y-2">
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
            </ScrollArea>
          </Card>
        </motion.div>
      )}

      {/* Board Style Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
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
    </div>
  );
};

export default GamePanel;