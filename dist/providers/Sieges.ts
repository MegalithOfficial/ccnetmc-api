import { NavalSiege, ProviderOptions, RawSiegeData, Siege, RawNavalSiegeData, SiegeRegion } from "../Interfaces/export";
import { RequestManager as Request } from "../utils/RequestManager";
import { Utils } from "../utils/Utils";
import { CCnet } from "../main";
import striptags from "striptags";

export class Sieges {
  private utils = Utils;
  private provider: CCnet;
  private RequestManager: Request;
  private siegesCache: Map<string, { data: Siege[], timestamp: number }> = new Map();
  private siegeRegionsCache: Map<string, { data: SiegeRegion[], timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds cache

  constructor(options: ProviderOptions) {
    this.provider = options.provider;
    this.RequestManager = new Request()
  };

  private getCachedSieges(): Siege[] | null {
    const cached = this.siegesCache.get('sieges');
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedSieges(sieges: Siege[]): void {
    this.siegesCache.set('sieges', {
      data: sieges,
      timestamp: Date.now()
    });
  }

  private setCachedRegions(regions: SiegeRegion[]): void {
    this.siegeRegionsCache.set('siegeRegions', {
      data: regions,
      timestamp: Date.now()
    });
  }

  private getCachedRegions(): SiegeRegion[] | null {
    const cached = this.siegeRegionsCache.get('siegeRegions');
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  public async getAllSieges(): Promise<Siege[]> {
    const cached = this.getCachedSieges();
    if (cached) return cached;

    const data = await this.RequestManager.getMapData();
    if (!data?.sets['siegewar.markerset']?.markers) return [];

    const siegeData = data.sets['siegewar.markerset'].markers as RawSiegeData;
    const sieges: Siege[] = [];

    for (const siegeId in siegeData) {
      const siege = siegeData[siegeId];
      const desc = striptags(siege.desc).split('\n');

      // Parse siege title for attacker/defender
      const [, sides] = desc[0].split('Siege: ');
      const [attacker, defender] = sides.split(' vs ');

      const siegeInfo = desc.reduce((info: any, line) => {
        if (line.startsWith('Town: ')) info.town = line.split('Town: ')[1];
        if (line.startsWith('Battle Points: ')) {
          const [att, def] = line.split('Battle Points: ')[1].split(' / ');
          info.attackerPoints = parseInt(att);
          info.defenderPoints = parseInt(def);
        }
        if (line.startsWith('Time Left: ')) info.timeLeft = line.split('Time Left: ')[1];
        return info;
      }, {});

      sieges.push({
        attacker,
        defender,
        town: siegeInfo.town,
        points: {
          attacker: siegeInfo.attackerPoints || 0,
          defender: siegeInfo.defenderPoints || 0
        },
        timeLeft: siegeInfo.timeLeft,
        location: {
          x: siege.x,
          y: siege.y,
          z: siege.z
        }
      });
    }

    this.setCachedSieges(sieges);
    return sieges;
  };

  public async getAllSiegeRegions(): Promise<SiegeRegion[]> {
    const cached = this.getCachedRegions();
    if (cached) return cached;

    const mapData = await this.RequestManager.getMapData();
    if (!mapData?.sets['nationswarfare.markerset']?.areas) return [];

    const regions: SiegeRegion[] = [];
    const areasData = mapData.sets['nationswarfare.markerset'].areas;

    const regionNames = [
      'Mediterranean', 'Sahara', 'Scandinavia', 'South Atlantic',
      'North Atlantic', 'Pacific', 'Indian Ocean', 'America'
    ];

    for (const regionId in areasData) {
      const region = areasData[regionId];

      const desc = striptags(region.desc).split('\n').map(line => line.trim()).filter(Boolean);

      const controlledBy = desc[0].split('Controlled by ')[1]
        .replace(/(Mediterranean|Sahara|Scandinavia|South Atlantic|North Atlantic|Pacific|Indian Ocean|America)/g, '')
        .trim();
      const name = regionNames.find(name => desc[1].includes(name)) || region.label;

      const info = desc.reduce((acc: any, line) => {
        if (!line.includes('•')) return acc;

        const sections = line.split('•').map(s => s.trim()).filter(Boolean);

        for (const section of sections) {
          if (section.startsWith('Time Windows:')) {
            acc.timeWindows = section.split('Time Windows:')[1]
              .split('-')
              .map(t => t.trim())
              .filter(Boolean)
              .reduce((result: string[], item, index, arr) =>
                index % 2 === 0 ? [...result, `${item} - ${arr[index + 1]}`] : result
                , []);
            continue;
          }

          const [key, value] = section.split('-').map(s => s.trim());

          const handlers: Record<string, (v: string) => any> = {
            'Type': (v: string) => v || null,
            'Theaters': (v: string) => v ? v.split(',').map(t => t.trim()) : null,
            'Preparation Duration': (v: string) => v || null,
            'Capture Duration': (v: string) => v || null,
            'Daily Payout': (v: string) => v ? v.replace(/[^0-9]/g, '') : null,
            'Daily Item Payout': (v: string) => v ? v.split(',').map(item => item.trim()) : null
          };

          if (key in handlers) {
            acc[key.toLowerCase().replace(/ /g, '')] = handlers[key](value);
          }
        }

        return acc;
      }, {
        type: null,
        theaters: null,
      });

      regions.push({
        id: regionId,
        name: name,
        controlledBy: controlledBy,
        theaters: info.theaters,
        corners: {
          topLeft: { x: region.x[0], z: region.z[0] },
          topRight: { x: region.x[1], z: region.z[1] },
          bottomRight: { x: region.x[2], z: region.z[2] },
          bottomLeft: { x: region.x[3], z: region.z[3] }
        },
        ...info
      });
    }

    this.setCachedRegions(regions);
    return regions;
  }
};