import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameLobbyComponent from '../components/GameLobby';

const GameLobby = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate(`/game/${gameId}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <GameLobbyComponent 
      onStartGame={handleStartGame}
      onBack={handleBack}
    />
  );
};

export default GameLobby;