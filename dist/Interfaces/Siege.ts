export interface Siege {
  name: string;
  town: string;
  type: string;
  points: string;
  time: string;
  warchest: string;
  x: number;
  y: number;
  z: number;
};

export interface NavalSiege {
  name: string;
  controller: string;
  type: string;
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