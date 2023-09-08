import { NationMapURL, NationURL, RequestOptions, ServerIp, ServerStatus, PlayerData, MapData } from '../Interfaces/export';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { FetchError } from './Errors';

export class RequestManager {
  private nationURL: NationURL;
  private nationMapURL: NationMapURL;
  private serverIp: ServerIp;

  constructor(options?: RequestOptions) {
    this.nationURL = options?.nationURL ?? "https://map.ccnetmc.com/nationsmap/standalone/dynmap_world.json";
    this.nationMapURL = options?.nationMapURL ?? "https://map.ccnetmc.com/nationsmap/tiles/_markers_/marker_world.json";
    this.serverIp = options?.serverIp ?? "play.ccnetmc.com";
  };

  async getMapData() {
    const data = await fetch<MapData>(this.nationMapURL, {}, FetchResultTypes.JSON).catch(error => { throw new FetchError({ message: "Server Replied with unexpected Error. Error code " + error.code, code: error.code }); });
    return (data ?? null)
  }

  async getNationsPlayerData() {
    const data = await fetch<PlayerData>(this.nationURL, {}, FetchResultTypes.JSON).catch(error => { throw new FetchError({ message: "Server Replied with unexpected Error. Error code " + error.code, code: error.code }); });
    return (data ?? null);
  }

  async getServerInfo() {
    const data = await fetch<ServerStatus>(`https://mcapi.us/server/status?ip=${this.serverIp}`, {}, FetchResultTypes.JSON).catch(error => { throw new FetchError({ message: "Server Replied with unexpected Error. Error code " + error.code, code: error.code }); });
    return (data ?? null)
  }
}