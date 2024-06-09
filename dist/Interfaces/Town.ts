export interface Town {
  isVassal: boolean;
  vassalOf: string | null;
  isOccupied: boolean;
  occupiedBy: string | null;
  area: number;
  x: number;
  z: number;
  name: string;
  nation: string | null;
  mayor: string;
  residents: string[];
  onlineResidents: string[];
  resources: string[];
  capital: boolean;
  bank: number | string;
  board: string;
  culture: string;
  upkeep: number | string;
  peacefulness: boolean;
  trusted: string[];
  colourCodes: {
    fill: string;
    outline: string;
  };
};

export interface RawTownData {
  fillcolor: string;
  ytop: number;
  color: string;
  markup: boolean;
  x: number[];
  weight: number;
  z: number[];
  ybottom: number;
  label: string;
  opacity: number;
  fillopacity: number;
  desc: string;
};

export interface ResidentData {
  name: string;
  town: string;
  nation: string;
  rank: string;
};