export declare class RequestManager {
  nationURL: string;
  townyURL: string;
  nationMapURL: string;
  townyMapURL: string;

  constructor(options?: {
    nationURL?: string;
    townyURL?: string;
    nationMapURL?: string;
    townyMapURL?: string;
  });

  getMapData(serverOptions?: { server?: string }): Promise<object>;

  getNationsPlayerData(): Promise<object>;

  getTownyPlayerData(): Promise<object>;
}
