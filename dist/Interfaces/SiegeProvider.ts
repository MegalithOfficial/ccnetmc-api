export interface Siege {
  attacker: string;
  defender: string;
  town: string;
  points: {
    attacker: number;
    defender: number;
  };
  timeLeft: string;
  location: {
    x: number;
    y: number;
    z: number;
  };
} 