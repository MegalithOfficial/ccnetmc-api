import { RequestManager, Functions } from "../export.js";

interface Siege {
  name: string;
  town: string;
  type: string;
  points: string;
  time: string;
  warchest: string;
  x: number;
  y: number;
  z: number;
}

interface NavalSiege {
  name: string;
  controller: string;
}

export declare class Sieges {
  provider: any;
  Functions: Functions;
  RequestManager: RequestManager;

  constructor(provider: any, options?: { debug?: boolean });

  getAllSieges(): Promise<Siege[]>;

  getNavalAllSieges(): Promise<NavalSiege[]>;
}
