export interface PlayerData {
  currentcount: number;
  hasStorm: boolean;
  players: Player[];
};

export interface RawPlayer {
  world: string;
  armor: number;
  name: string;
  x: number;
  y: number;
  health: number;
  z: number;
  sort: number;
  type: string;
  account: string;
};

export interface Player {
  account: string;
  name: string;
  world: string;
  isUnderground: boolean;
  nickname: string;
};