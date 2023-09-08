import { Nation, ProviderOptions } from "../Interfaces/export";
import { InvalidTypeData } from "../utils/Errors";
import { Utils } from "../utils/Utils";
import { CCnet } from "../main";

export class Nations { 
  private utils = Utils;
  private provider: CCnet;

  constructor(options: ProviderOptions) {
    this.provider = options.provider;
  };

  public async getNation(name: string): Promise<Nation | null> {

    if(typeof name !== 'string') throw new InvalidTypeData({ message: "Name must be a string.", code: 404 });
    if(name.length === 0) throw new InvalidTypeData({ message: "Name cannot be empty.", code: 204 });

    let nations = await this.getAllNations();
    
    return (
      nations.find(
        (nation) => nation.name.toLocaleLowerCase() == name.toLocaleLowerCase()
      ) ?? null
    );
  };

  public async getAllNations(): Promise<Nation[]> {
    const remove = this.utils.removeDuplicates;
    const towns = await this.provider.towns.getAllTowns();
    if (!towns) return [];
  
    const nationsMap: Record<string, Nation> = {};
  
    towns.forEach((town) => {
      if (town.nation !== "No Nation") {
        if (!nationsMap[town.nation]) {
          nationsMap[town.nation] = {
            name: town.nation,
            residents: town.residents,
            towns: [],
            king: "Unavailable",
            capitalName: "Unavailable",
            capitalX: 0,
            capitalZ: 0,
            area: 0,
          };
        };
  
        const currentNation = nationsMap[town.nation];
        currentNation.residents = remove(
          currentNation.residents.concat(town.residents)
        );
        currentNation.area += town.area;
  
        if (currentNation.name === town.nation) {
          currentNation.towns.push(town.name);
        };
  
        if (town.capital) {
          currentNation.capitalX = town.x;
          currentNation.capitalZ = town.z;
          currentNation.capitalName = town.name;
          currentNation.king = town.mayor;
        };
      };
    });
  
    const nationsArray: Nation[] = Object.values(nationsMap);
    return nationsArray;
  };

};