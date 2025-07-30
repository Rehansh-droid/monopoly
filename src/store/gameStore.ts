import { create } from 'zustand';

export interface Property {
  id: string;
  name: string;
  price: number;
  rent: number;
  color: string;
  position: number;
  houses: number;
  hotels: number;
  owner?: string;
  mortgaged: boolean;
}

export interface Player {
  id: string;
  name: string;
  color: 'red' | 'blue' | 'green' | 'yellow';
  position: number;
  money: number;
  properties: string[];
  inJail: boolean;
  jailTurns: number;
}

export interface GameCard {
  id: string;
  type: 'chance' | 'community';
  title: string;
  description: string;
  action: string;
  value?: number;
}

export interface GameState {
  players: Player[];
  currentPlayer: number;
  gamePhase: 'setup' | 'playing' | 'ended';
  dice: [number, number];
  isRolling: boolean;
  properties: Property[];
  chanceCards: GameCard[];
  communityCards: GameCard[];
  currentCard: GameCard | null;
  turnActions: string[];
  winner: string | null;
  boardStyle: 'classic' | 'modern';
}

export interface GameActions {
  initializeGame: (playerNames: string[]) => void;
  rollDice: () => void;
  movePlayer: (playerId: string, steps: number) => void;
  buyProperty: (propertyId: string) => void;
  sellProperty: (propertyId: string) => void;
  buildHouse: (propertyId: string) => void;
  buildHotel: (propertyId: string) => void;
  mortgageProperty: (propertyId: string) => void;
  unmortgageProperty: (propertyId: string) => void;
  payRent: (fromPlayerId: string, toPlayerId: string, amount: number) => void;
  drawCard: (type: 'chance' | 'community') => void;
  endTurn: () => void;
  setCurrentCard: (card: GameCard | null) => void;
  addTurnAction: (action: string) => void;
  clearTurnActions: () => void;
  setBoardStyle: (style: 'classic' | 'modern') => void;
}

const initialProperties: Property[] = [
  // Corner spaces
  { id: 'go', name: 'GO', price: 0, rent: 0, color: 'special', position: 0, houses: 0, hotels: 0, mortgaged: false },
  { id: 'jail', name: 'JAIL', price: 0, rent: 0, color: 'special', position: 10, houses: 0, hotels: 0, mortgaged: false },
  { id: 'free-parking', name: 'FREE PARKING', price: 0, rent: 0, color: 'special', position: 20, houses: 0, hotels: 0, mortgaged: false },
  { id: 'go-to-jail', name: 'GO TO JAIL', price: 0, rent: 0, color: 'special', position: 30, houses: 0, hotels: 0, mortgaged: false },
  
  // Brown properties
  { id: 'mediterranean', name: 'Mediterranean Ave', price: 60, rent: 2, color: 'brown', position: 1, houses: 0, hotels: 0, mortgaged: false },
  { id: 'baltic', name: 'Baltic Ave', price: 60, rent: 4, color: 'brown', position: 3, houses: 0, hotels: 0, mortgaged: false },
  
  // Light Blue properties
  { id: 'oriental', name: 'Oriental Ave', price: 100, rent: 6, color: 'lightblue', position: 6, houses: 0, hotels: 0, mortgaged: false },
  { id: 'vermont', name: 'Vermont Ave', price: 100, rent: 6, color: 'lightblue', position: 8, houses: 0, hotels: 0, mortgaged: false },
  { id: 'connecticut', name: 'Connecticut Ave', price: 120, rent: 8, color: 'lightblue', position: 9, houses: 0, hotels: 0, mortgaged: false },
  
  // Pink properties
  { id: 'st-charles', name: 'St. Charles Place', price: 140, rent: 10, color: 'pink', position: 11, houses: 0, hotels: 0, mortgaged: false },
  { id: 'states', name: 'States Ave', price: 140, rent: 10, color: 'pink', position: 13, houses: 0, hotels: 0, mortgaged: false },
  { id: 'virginia', name: 'Virginia Ave', price: 160, rent: 12, color: 'pink', position: 14, houses: 0, hotels: 0, mortgaged: false },
  
  // Orange properties
  { id: 'st-james', name: 'St. James Place', price: 180, rent: 14, color: 'orange', position: 16, houses: 0, hotels: 0, mortgaged: false },
  { id: 'tennessee', name: 'Tennessee Ave', price: 180, rent: 14, color: 'orange', position: 18, houses: 0, hotels: 0, mortgaged: false },
  { id: 'new-york', name: 'New York Ave', price: 200, rent: 16, color: 'orange', position: 19, houses: 0, hotels: 0, mortgaged: false },
  
  // Red properties
  { id: 'kentucky', name: 'Kentucky Ave', price: 220, rent: 18, color: 'red', position: 21, houses: 0, hotels: 0, mortgaged: false },
  { id: 'indiana', name: 'Indiana Ave', price: 220, rent: 18, color: 'red', position: 23, houses: 0, hotels: 0, mortgaged: false },
  { id: 'illinois', name: 'Illinois Ave', price: 240, rent: 20, color: 'red', position: 24, houses: 0, hotels: 0, mortgaged: false },
  
  // Yellow properties
  { id: 'atlantic', name: 'Atlantic Ave', price: 260, rent: 22, color: 'yellow', position: 26, houses: 0, hotels: 0, mortgaged: false },
  { id: 'ventnor', name: 'Ventnor Ave', price: 260, rent: 22, color: 'yellow', position: 27, houses: 0, hotels: 0, mortgaged: false },
  { id: 'marvin', name: 'Marvin Gardens', price: 280, rent: 24, color: 'yellow', position: 29, houses: 0, hotels: 0, mortgaged: false },
  
  // Green properties
  { id: 'pacific', name: 'Pacific Ave', price: 300, rent: 26, color: 'green', position: 31, houses: 0, hotels: 0, mortgaged: false },
  { id: 'north-carolina', name: 'North Carolina Ave', price: 300, rent: 26, color: 'green', position: 32, houses: 0, hotels: 0, mortgaged: false },
  { id: 'pennsylvania', name: 'Pennsylvania Ave', price: 320, rent: 28, color: 'green', position: 34, houses: 0, hotels: 0, mortgaged: false },
  
  // Dark Blue properties
  { id: 'park-place', name: 'Park Place', price: 350, rent: 35, color: 'darkblue', position: 37, houses: 0, hotels: 0, mortgaged: false },
  { id: 'boardwalk', name: 'Boardwalk', price: 400, rent: 50, color: 'darkblue', position: 39, houses: 0, hotels: 0, mortgaged: false },
  
  // Railroads
  { id: 'reading-railroad', name: 'Reading Railroad', price: 200, rent: 25, color: 'railroad', position: 5, houses: 0, hotels: 0, mortgaged: false },
  { id: 'pennsylvania-railroad', name: 'Pennsylvania Railroad', price: 200, rent: 25, color: 'railroad', position: 15, houses: 0, hotels: 0, mortgaged: false },
  { id: 'bo-railroad', name: 'B&O Railroad', price: 200, rent: 25, color: 'railroad', position: 25, houses: 0, hotels: 0, mortgaged: false },
  { id: 'short-line', name: 'Short Line', price: 200, rent: 25, color: 'railroad', position: 35, houses: 0, hotels: 0, mortgaged: false },
  
  // Utilities
  { id: 'electric-company', name: 'Electric Company', price: 150, rent: 0, color: 'utility', position: 12, houses: 0, hotels: 0, mortgaged: false },
  { id: 'water-works', name: 'Water Works', price: 150, rent: 0, color: 'utility', position: 28, houses: 0, hotels: 0, mortgaged: false },
];

const chanceCards: GameCard[] = [
  { id: 'c1', type: 'chance', title: 'Advance to GO', description: 'Advance to GO (Collect $200)', action: 'move', value: 0 },
  { id: 'c2', type: 'chance', title: 'Bank Dividend', description: 'Bank pays you dividend of $50', action: 'money', value: 50 },
  { id: 'c3', type: 'chance', title: 'Go Back 3', description: 'Go back 3 spaces', action: 'move', value: -3 },
  { id: 'c4', type: 'chance', title: 'Go to Jail', description: 'Go directly to Jail', action: 'jail' },
  { id: 'c5', type: 'chance', title: 'Property Repairs', description: 'Make repairs: $25 per house, $100 per hotel', action: 'repair' },
];

const communityCards: GameCard[] = [
  { id: 'cc1', type: 'community', title: 'Bank Error', description: 'Bank error in your favor - Collect $200', action: 'money', value: 200 },
  { id: 'cc2', type: 'community', title: 'Doctor Fee', description: 'Doctor\'s fee - Pay $50', action: 'money', value: -50 },
  { id: 'cc3', type: 'community', title: 'Sale of Stock', description: 'From sale of stock you get $50', action: 'money', value: 50 },
  { id: 'cc4', type: 'community', title: 'Get Out of Jail', description: 'Get out of jail free', action: 'jail-free' },
  { id: 'cc5', type: 'community', title: 'Holiday Fund', description: 'Holiday fund matures - Receive $100', action: 'money', value: 100 },
];

export const useGameStore = create<GameState & GameActions>()((set, get) => ({
  // Initial state
  players: [],
  currentPlayer: 0,
  gamePhase: 'setup',
  dice: [1, 1],
  isRolling: false,
  properties: initialProperties,
  chanceCards,
  communityCards,
  currentCard: null,
  turnActions: [],
  winner: null,
  boardStyle: 'classic',

  // Actions
  initializeGame: (playerNames: string[]) => {
    const colors: Array<'red' | 'blue' | 'green' | 'yellow'> = ['red', 'blue', 'green', 'yellow'];
    const players: Player[] = playerNames.map((name, index) => ({
      id: `player-${index}`,
      name,
      color: colors[index],
      position: 0,
      money: 1500,
      properties: [],
      inJail: false,
      jailTurns: 0,
    }));

    set({
      players,
      currentPlayer: 0,
      gamePhase: 'playing',
      properties: initialProperties,
      turnActions: [],
      winner: null,
    });
  },

  rollDice: () => {
    set({ isRolling: true });
    
    setTimeout(() => {
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const state = get();
      
      set({ 
        dice: [dice1, dice2], 
        isRolling: false 
      });
      
      // Move player
      const currentPlayerId = state.players[state.currentPlayer].id;
      get().movePlayer(currentPlayerId, dice1 + dice2);
      get().addTurnAction(`Rolled ${dice1 + dice2}`);
    }, 600);
  },

  movePlayer: (playerId: string, steps: number) => {
    set((state) => ({
      players: state.players.map((player) =>
        player.id === playerId
          ? {
              ...player,
              position: (player.position + steps) % 40,
            }
          : player
      ),
    }));
  },

  buyProperty: (propertyId: string) => {
    const state = get();
    const currentPlayer = state.players[state.currentPlayer];
    const property = state.properties.find(p => p.id === propertyId);
    
    if (!property || property.owner || currentPlayer.money < property.price) return;

    set((state) => ({
      players: state.players.map((player) =>
        player.id === currentPlayer.id
          ? {
              ...player,
              money: player.money - property.price,
              properties: [...player.properties, propertyId],
            }
          : player
      ),
      properties: state.properties.map((prop) =>
        prop.id === propertyId
          ? { ...prop, owner: currentPlayer.id }
          : prop
      ),
    }));
    
    get().addTurnAction(`Bought ${property.name} for $${property.price}`);
  },

  sellProperty: (propertyId: string) => {
    const state = get();
    const currentPlayer = state.players[state.currentPlayer];
    const property = state.properties.find(p => p.id === propertyId);
    
    if (!property || property.owner !== currentPlayer.id) return;

    const sellPrice = Math.floor(property.price * 0.9);

    set((state) => ({
      players: state.players.map((player) =>
        player.id === currentPlayer.id
          ? {
              ...player,
              money: player.money + sellPrice,
              properties: player.properties.filter(id => id !== propertyId),
            }
          : player
      ),
      properties: state.properties.map((prop) =>
        prop.id === propertyId
          ? { ...prop, owner: undefined, houses: 0, hotels: 0, mortgaged: false }
          : prop
      ),
    }));
    
    get().addTurnAction(`Sold ${property.name} for $${sellPrice}`);
  },

  buildHouse: (propertyId: string) => {
    const state = get();
    const property = state.properties.find(p => p.id === propertyId);
    
    if (!property || property.houses >= 4 || property.hotels > 0) return;

    const houseCost = 50;
    const currentPlayer = state.players[state.currentPlayer];
    
    if (currentPlayer.money < houseCost) return;

    set((state) => ({
      players: state.players.map((player) =>
        player.id === currentPlayer.id
          ? { ...player, money: player.money - houseCost }
          : player
      ),
      properties: state.properties.map((prop) =>
        prop.id === propertyId
          ? { ...prop, houses: prop.houses + 1 }
          : prop
      ),
    }));
    
    get().addTurnAction(`Built house on ${property.name}`);
  },

  buildHotel: (propertyId: string) => {
    const state = get();
    const property = state.properties.find(p => p.id === propertyId);
    
    if (!property || property.houses !== 4 || property.hotels > 0) return;

    const hotelCost = 100;
    const currentPlayer = state.players[state.currentPlayer];
    
    if (currentPlayer.money < hotelCost) return;

    set((state) => ({
      players: state.players.map((player) =>
        player.id === currentPlayer.id
          ? { ...player, money: player.money - hotelCost }
          : player
      ),
      properties: state.properties.map((prop) =>
        prop.id === propertyId
          ? { ...prop, houses: 0, hotels: 1 }
          : prop
      ),
    }));
    
    get().addTurnAction(`Built hotel on ${property.name}`);
  },

  mortgageProperty: (propertyId: string) => {
    const state = get();
    const property = state.properties.find(p => p.id === propertyId);
    
    if (!property || property.mortgaged) return;

    const mortgageValue = Math.floor(property.price / 2);
    const currentPlayer = state.players[state.currentPlayer];

    set((state) => ({
      players: state.players.map((player) =>
        player.id === currentPlayer.id
          ? { ...player, money: player.money + mortgageValue }
          : player
      ),
      properties: state.properties.map((prop) =>
        prop.id === propertyId
          ? { ...prop, mortgaged: true }
          : prop
      ),
    }));
    
    get().addTurnAction(`Mortgaged ${property.name} for $${mortgageValue}`);
  },

  unmortgageProperty: (propertyId: string) => {
    const state = get();
    const property = state.properties.find(p => p.id === propertyId);
    
    if (!property || !property.mortgaged) return;

    const unmortgageCost = Math.floor(property.price * 0.55);
    const currentPlayer = state.players[state.currentPlayer];
    
    if (currentPlayer.money < unmortgageCost) return;

    set((state) => ({
      players: state.players.map((player) =>
        player.id === currentPlayer.id
          ? { ...player, money: player.money - unmortgageCost }
          : player
      ),
      properties: state.properties.map((prop) =>
        prop.id === propertyId
          ? { ...prop, mortgaged: false }
          : prop
      ),
    }));
    
    get().addTurnAction(`Unmortgaged ${property.name} for $${unmortgageCost}`);
  },

  payRent: (fromPlayerId: string, toPlayerId: string, amount: number) => {
    set((state) => ({
      players: state.players.map((player) => {
        if (player.id === fromPlayerId) {
          return { ...player, money: player.money - amount };
        }
        if (player.id === toPlayerId) {
          return { ...player, money: player.money + amount };
        }
        return player;
      }),
    }));
    
    get().addTurnAction(`Paid $${amount} rent`);
  },

  drawCard: (type: 'chance' | 'community') => {
    const state = get();
    const cards = type === 'chance' ? state.chanceCards : state.communityCards;
    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    
    set({ currentCard: randomCard });
    get().addTurnAction(`Drew ${type} card: ${randomCard.title}`);
  },

  endTurn: () => {
    const state = get();
    const nextPlayer = (state.currentPlayer + 1) % state.players.length;
    
    set({
      currentPlayer: nextPlayer,
      turnActions: [],
      currentCard: null,
    });
  },

  setCurrentCard: (card: GameCard | null) => {
    set({ currentCard: card });
  },

  addTurnAction: (action: string) => {
    set((state) => ({
      turnActions: [...state.turnActions, action],
    }));
  },

  clearTurnActions: () => {
    set({ turnActions: [] });
  },

  setBoardStyle: (style: 'classic' | 'modern') => {
    set({ boardStyle: style });
  },
}));