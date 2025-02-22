import { NationMapURL, NationURL, RequestOptions, ServerIp, ServerStatus, PlayerData, MapData, SiegesURL } from '../Interfaces/export';
import { fetch, FetchResultTypes, RequestOptions as SapphireRequestOptions } from '@sapphire/fetch';
import { FetchError } from './Errors';

export class RequestManager {
  private nationURL: NationURL;
  private nationMapURL: NationMapURL;
  private siegesURL: SiegesURL;
  private serverIp: ServerIp;
  private cache: Map<string, { data: any, timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds cache

  constructor(options?: RequestOptions) {
    this.nationURL = options?.nationURL ?? "https://map.ccnetmc.com/nationsmap/standalone/dynmap_world.json";
    this.nationMapURL = options?.nationMapURL ?? "https://map.ccnetmc.com/nationsmap/tiles/_markers_/marker_world.json";
    this.siegesURL = options?.siegesURL ?? "https://sieges.ccnetmc.com";
    this.serverIp = options?.serverIp ?? "play.ccnetmc.com";
  }

  private async fetchWithCache<T>(url: string, options: SapphireRequestOptions = {}): Promise<T> {
    const cacheKey = url;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }

    try {
      const data = await fetch<T>(url, options, FetchResultTypes.JSON);
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error: any) {
      throw new FetchError({ 
        message: `Server Replied with unexpected Error. Error code ${error.code}`, 
        code: error.code 
      });
    }
  }

  async getMapData(): Promise<MapData | null> {
    return this.fetchWithCache<MapData>(this.nationMapURL);
  }

  async getNationsPlayerData(): Promise<PlayerData | null> {
    return this.fetchWithCache<PlayerData>(this.nationURL);
  }

  async getServerInfo(): Promise<ServerStatus | null> {
    return this.fetchWithCache<ServerStatus>(`https://mcapi.us/server/status?ip=${this.serverIp}`);
  }

  async getPlayerHead(name: string): Promise<Buffer | null> {
    try {
      return await fetch(
        `https://map.ccnetmc.com/nationsmap/tiles/faces/32x32/${name}.png`,
        {},
        FetchResultTypes.Buffer
      );
    } catch (error: any) {
      throw new FetchError({ 
        message: `Server Replied with unexpected Error. Error code ${error.code}`, 
        code: error.code 
      });
    }
  }

  async getSiegeData(path: string): Promise<string | null> {
    try {
      return await fetch(
        `${this.siegesURL}${path || "/"}`,
        {},
        FetchResultTypes.Text
      );
    } catch (error: any) {
      throw new FetchError({ 
        message: `Server Replied with unexpected Error. Error code ${error.code}`, 
        code: error.code 
      });
    }
  }
}