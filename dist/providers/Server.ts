import { RequestManager as Request } from "../utils/RequestManager";
import { ProviderOptions } from "../Interfaces/export";

export class Server { 
  private RequestManager: Request;

  constructor(options: ProviderOptions) {
    this.RequestManager = new Request();
  };

  public async getServerData() {
    return await this.RequestManager.getServerInfo();
  };

  public async getPlayerData() {
    return await this.RequestManager.getNationsPlayerData();
  };
};