import { ProviderOptions, Town, RawTownData, Nation } from "../Interfaces/export";
import { RequestManager as Request } from "../utils/RequestManager";
import { DataNull, InvalidTypeData } from "../utils/Errors";
import { Utils } from "../utils/Utils";
import { CCnet } from "../main";
import striptags from "striptags";

export class Towns {
  private utils = Utils;
  private provider: CCnet;
  private RequestManager: Request;
  private townsCache: Map<string, { data: Town[], timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds cache

  constructor(options: ProviderOptions) {
    this.provider = options.provider;
    this.RequestManager = new Request();
  }

  private getCachedTowns(): Town[] | null {
    const cached = this.townsCache.get('towns');
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedTowns(towns: Town[]): void {
    this.townsCache.set('towns', {
      data: towns,
      timestamp: Date.now()
    });
  }

  private processTownData(rawTown: any, ops: any): Town {
    const rawInfo: string[] = rawTown.desc.split("<br />");
    const info = rawInfo.map((x: string) => striptags(x));
    const extractedData = Utils.extractTownData(info, ops);

    // Calculate coordinates and area
    const xCoords = rawTown.x;
    const zCoords = rawTown.z;
    
    extractedData.x = Math.round((Math.max(...xCoords) + Math.min(...xCoords)) / 2);
    extractedData.z = Math.round((Math.max(...zCoords) + Math.min(...zCoords)) / 2);
    extractedData.area = this.utils.calcPolygonArea(xCoords, zCoords, xCoords.length) / 256; // 16 * 16 = 256

    return extractedData;
  }

  public async getAllTowns(): Promise<Town[]> {
    // Check cache first
    const cached = this.getCachedTowns();
    if (cached) return cached;

    // Fetch required data
    const [mapData, ops] = await Promise.all([
      this.RequestManager.getMapData(),
      this.provider.player.getOnlinePlayerData()
    ]);

    if (!mapData?.sets?.["towny.markerset"]?.areas) {
      throw new DataNull({ message: "Town data is unavailable", code: 404 });
    }

    const townData = mapData.sets["towny.markerset"].areas;

    // Process towns in chunks to avoid blocking
    const CHUNK_SIZE = 50;
    const towns: Town[] = [];
    const townEntries = Object.entries(townData);

    for (let i = 0; i < townEntries.length; i += CHUNK_SIZE) {
      const chunk = townEntries.slice(i, i + CHUNK_SIZE);
      const processedTowns = chunk.map(([_, town]) => this.processTownData(town, ops));
      towns.push(...processedTowns);
    }

    // Remove duplicates and cache
    const uniqueTowns = this.utils.removeDuplicates(towns);
    this.setCachedTowns(uniqueTowns);
    return uniqueTowns;
  }

  public async getTown(name: string): Promise<Town | null> {
    if (typeof name !== 'string') {
      throw new InvalidTypeData({ message: "Name must be a string.", code: 404 });
    }
    if (name.length === 0) {
      throw new InvalidTypeData({ message: "Name cannot be empty.", code: 204 });
    }

    const nameLower = name.toLowerCase();
    const towns = await this.getAllTowns();
    return towns?.find(town => town.name.toLowerCase() === nameLower) ?? null;
  }

  public async getInvitableTowns(nationName: string, includeBelonging: boolean): Promise<Town[] | null> {
    if (typeof nationName !== 'string') {
      throw new InvalidTypeData({ message: "Name must be a string.", code: 404 });
    }
    if (nationName.length === 0) {
      throw new InvalidTypeData({ message: "Name cannot be empty.", code: 204 });
    }
    if (typeof includeBelonging !== 'boolean') {
      throw new InvalidTypeData({ message: "includeBelonging must be a boolean.", code: 404 });
    }

    const nation = await this.provider.nations.getNation(nationName);
    if (!nation) {
      throw new DataNull({ message: `Nation ${nationName} does not exist!`, code: 404 });
    }

    const towns = await this.getAllTowns();
    if (!towns?.length) return null;

    return towns.filter(town => this.invitable(town, nation, includeBelonging));
  }

  private invitable(town: Town, nation: Nation, includeBelonging: boolean): boolean {
    const distance = Math.hypot(town.x - nation.capitalX, town.z - nation.capitalZ);
    const differentNation = town.nation !== nation.name;
    const noNation = town.nation === "No Nation";
    
    return distance <= 3000 && differentNation && (includeBelonging || noNation);
  }
}