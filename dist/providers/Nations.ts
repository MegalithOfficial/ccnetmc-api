import { Nation, ProviderOptions } from "../Interfaces/export";
import { InvalidTypeData } from "../utils/Errors";
import { Utils } from "../utils/Utils";
import { CCnet } from "../main";

export class Nations {
  private utils = Utils;
  private provider: CCnet;
  private nationsCache: Map<string, { data: Nation[], timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000;

  constructor(options: ProviderOptions) {
    this.provider = options.provider;
  }

  private getCachedNations(): Nation[] | null {
    const cached = this.nationsCache.get('nations');
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedNations(nations: Nation[]): void {
    this.nationsCache.set('nations', {
      data: nations,
      timestamp: Date.now()
    });
  }

  public async getNation(name: string): Promise<Nation | null> {
    if (typeof name !== 'string') {
      throw new InvalidTypeData({ message: "Name must be a string.", code: 404 });
    }
    if (name.length === 0) {
      throw new InvalidTypeData({ message: "Name cannot be empty.", code: 204 });
    }

    const nameLower = name.toLowerCase();
    const nations = await this.getAllNations();
    
    return nations.find(nation => 
      nation?.name?.toLowerCase() === nameLower
    ) ?? null;
  }

  public async getAllNations(): Promise<Nation[]> {
    const cached = this.getCachedNations();
    if (cached) return cached;

    const towns = await this.provider.towns.getAllTowns();
    if (!towns?.length) return [];

    const nationsMap = new Map<string, Nation>();

    const CHUNK_SIZE = 100;
    for (let i = 0; i < towns.length; i += CHUNK_SIZE) {
      const chunk = towns.slice(i, i + CHUNK_SIZE);
      
      for (const town of chunk) {
        if (town.nation === "No Nation") continue;

        let nation = nationsMap.get(town.nation);
        if (!nation) {
          nation = {
            name: town.nation,
            residents: [],
            towns: [],
            king: "Unavailable",
            capitalName: "Unavailable",
            capitalX: 0,
            capitalZ: 0,
            area: 0
          };
          nationsMap.set(town.nation, nation);
        }

        // Update nation data
        nation.residents = this.utils.removeDuplicates([
          ...nation.residents,
          ...town.residents
        ]);
        nation.area += town.area;
        nation.towns.push(town.name);

        if (town.capital) {
          nation.capitalX = town.x;
          nation.capitalZ = town.z;
          nation.capitalName = town.name;
          nation.king = town.mayor;
        }
      }
    }

    const nations = Array.from(nationsMap.values());
    this.setCachedNations(nations);
    return nations;
  }
}