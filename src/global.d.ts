import { Functions } from "../src/utils/functions.js";

export interface Nation {
  name: string;
  residents: string[];
  towns: string[];
  king: string;
  capitalName: string;
  capitalX: number;
  capitalZ: number;
  area: number;
};

export interface PlayerData {
  name: string;
  town: string;
  nation: string;
  rank: string;
};

export interface ServerData {
  serverOnline: boolean;
  online: number;
  max: number;
};

export interface ServerPlayerCount {
  online: number;
  towny: number;
  nations: number;
  storming: boolean;
  thundering: boolean;
  ccnet: number;
  hub: number;
};

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
};

export interface Town {
  isVassal: boolean;
  vassalOf: string;
  area: number;
  x: number;
  z: number;
  name: string;
  nation: string;
  mayor: string;
  residents: string[];
  onlineResidents: string[];
  capital: boolean;
  bank: string;
  culture: string;
  upkeep: string;
  peacefulness: boolean;
  trusted: string;
  colourCodes: {
    fill: string;
    outline: string;
  };
};

export declare class Nations {
  provider: any;
  Functions: Functions;

  constructor(provider: any, options?: { debug?: boolean });

  getNation(name: string): Promise<Nation | null>;

  getAllNations(): Promise<Nation[]>;

  private joinable(nation: Nation, town: object): object;

  getJoinableNations(): Promise<Nation[]>;
};

export declare class Player {
  provider: any;
  Functions: Functions;

  constructor(provider: any, options?: { debug?: boolean });

  getPlayer(name: string): Promise<PlayerData>;

  getOnlinePlayers(includeResidentInfo?: boolean): Promise<PlayerData[]>;

  getResidents(): Promise<PlayerData[]>;

  getAllPlayers(): Promise<PlayerData[]>;

  getOnlinePlayerData(): Promise<object>;
};

export declare class Server {
  provider: any;
  RequestManager: RequestManager;
  Functions: Functions;

  constructor(provider: any, options?: { debug?: boolean });

  getServerData(): Promise<ServerData>;

  getServerPlayerCount(): Promise<ServerPlayerCount>;

  getPlayerData(): Promise<object>;
};

export declare class Sieges {
  provider: any;
  Functions: Functions;
  RequestManager: RequestManager;

  constructor(provider: any, options?: { debug?: boolean });

  getAllSieges(): Promise<Siege[]>;

  getNavalAllSieges(): Promise<NavalSiege[]>;
};

export declare class Towns {
  provider: any;
  Functions: Functions;
  RequestManager: RequestManager;

  constructor(provider: any, options?: { debug?: boolean });

  getAllTowns(): Promise<Town[]>;

  getTown(name: string): Promise<Town | null>;

  private invitable(
    town: Town,
    nation: Nation,
    includeBelonging: boolean
  ): object;

  getInvitableTowns(
    name: string,
    includeBelonging: boolean
  ): Promise<Town[]>;
};

export declare class RequestManager {
  nationURL: string;
  nationMapURL: string;

  constructor(options?: {
    nationURL?: string;
    nationMapURL?: string;
  });

  getMapData(): Promise<object>;

  getNationsPlayerData(): Promise<object>;

  //getTownyPlayerData(): Promise<object>;
};

export declare class Functions {
  calcPolygonArea(X: number[], Z: number[], numPoints: number): number;

  formatNumber(number: number): string;

  removeDuplicates<T>(array: T[]): T[];

  removeStyleCharacters(string: string): string;

  editPlayerProps(playerObjOrArray?: object | object[]): object | object[];
};

export declare class CustomError extends Error {
  code: string;

  constructor(message: string, code?: string);
};

export declare class InvalidServerType extends CustomError {};

export declare class InvalidPlayer extends CustomError {};

export declare class NoPlayerInput extends CustomError {};

export declare class FetchError extends CustomError {};

export declare class InvalidTypeData extends CustomError {};

export declare class DataNull extends CustomError {};

