import { NationMapURL, NationURL, RequestOptions, ServerIp, ServerStatus, PlayerData, MapData, SiegesURL } from '../Interfaces/export';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { FetchError } from './Errors';

export class RequestManager {
  private nationURL: NationURL;
  private nationMapURL: NationMapURL;
  private siegesURL: SiegesURL;
  private serverIp: ServerIp;

  constructor(options?: RequestOptions) {
    this.nationURL = options?.nationURL ?? "https://map.ccnetmc.com/nationsmap/standalone/dynmap_world.json";
    this.nationMapURL = options?.nationMapURL ?? "https://map.ccnetmc.com/nationsmap/tiles/_markers_/marker_world.json";
    this.siegesURL = options?.siegesURL ?? "https://sieges.ccnetmc.com";
    this.serverIp = options?.serverIp ?? "play.ccnetmc.com";
  };

  async getMapData() {
    const data = await fetch<MapData>(this.nationMapURL, {}, FetchResultTypes.JSON).catch(error => { throw new FetchError({ message: "Server Replied with unexpected Error. Error code " + error.code, code: error.code }); });
    return (data ?? null)
  };

  async getNationsPlayerData() {
    const data = await fetch<PlayerData>(this.nationURL, {}, FetchResultTypes.JSON).catch(error => { throw new FetchError({ message: "Server Replied with unexpected Error. Error code " + error.code, code: error.code }); });
    return (data ?? null);
  };

  async getServerInfo() {
    const data = await fetch<ServerStatus>(`https://mcapi.us/server/status?ip=${this.serverIp}`, {}, FetchResultTypes.JSON).catch(error => { throw new FetchError({ message: "Server Replied with unexpected Error. Error code " + error.code, code: error.code }); });
    return (data ?? null)
  };

  async getPlayerHead(name: string) {
    const data = await fetch(`https://map.ccnetmc.com/nationsmap/tiles/faces/32x32/${name}.png`, {}, FetchResultTypes.Buffer).catch(error => { throw new FetchError({ message: "Server Replied with unexpected Error. Error code " + error.code, code: error.code }); });
    return (data ?? null)
  };

  async getSiegeData(path: string) {
    const data = await fetch(`${this.siegesURL}${path ? path : "/"}`, {}, FetchResultTypes.Text).catch(error => { throw new FetchError({ message: "Server Replied with unexpected Error. Error code " + error.code, code: error.code }); });
    return (data ?? null)
  };
};