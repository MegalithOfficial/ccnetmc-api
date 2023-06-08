import { Functions } from "../export.js";

export interface Nation {
  name: string;
  residents: string[];
  towns: string[];
  king: string;
  capitalName: string;
  capitalX: number;
  capitalZ: number;
  area: number;
}

export declare class Nations {
  provider: any;
  Functions: Functions;

  constructor(provider: any, options?: { debug?: boolean });

  getNation(
    name: string,
    options?: { server?: string }
  ): Promise<Nation | null>

  getAllNations(options?: { server?: string }): Promise<Nation[]>;

  private joinable(nation: Nation, town: object): object;

  getJoinableNations(options?: { server?: string }): Promise<Nation[]>;

}

