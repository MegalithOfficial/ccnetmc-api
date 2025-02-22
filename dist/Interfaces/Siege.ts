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

export interface NavalSiege {
  controlledBy: string;
  location: string;
  type: string;
  theaters: string;
  preparationDuration: string;
  captureDuration: string;
  timeWindows: string[];
  dailyPayout: string;
  dailyItemPayout?: string[];
};

export interface RawSiegeData {
  [siegeAreaName: string]: {
    markup: boolean;
    x: number;
    y: number;
    z: number;
    icon: string;
    label: string;
    desc: string;
  };
};

export interface RawNavalSiegeData {
  [navalSiegeAreaName: string]: {
    desc: string;
    x: number;
    y: number;
    z: number;
  };
}

export interface SiegeRegion {
  id: string;
  name: string;
  controlledBy: string;
  type: string;
  theaters?: string[];
  preparationDuration: string;
  captureDuration: string;
  timeWindows: string[];
  dailyPayout: string;
  dailyItemPayout?: string[];
  corners: {
    topLeft: { x: number, z: number };
    topRight: { x: number, z: number };
    bottomRight: { x: number, z: number };
    bottomLeft: { x: number, z: number };
  };
}