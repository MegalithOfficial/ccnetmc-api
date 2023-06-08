import { RequestManager, Functions } from "../export.js";
import { Nation } from "./Nations.d.ts"

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
  upkeep: string;
  peacefulness: boolean;
  trusted: string;
  colourCodes: {
    fill: string;
    outline: string;
  };
}

export declare class Towns {
  provider: any;
  Functions: Functions;
  RequestManager: RequestManager;

  constructor(provider: any, options?: { debug?: boolean });

  getAllTowns(options?: { server?: string }): Promise<Town[]>;

  getTown(name: string, options?: { server?: string }): Promise<Town | null>;

  private invitable(
    town: Town,
    nation: Nation,
    includeBelonging: boolean
  ): object;

  getInvitableTowns(
    name: string,
    includeBelonging: boolean,
    options?: { server?: string }
  ): Promise<Town[]>;
}
