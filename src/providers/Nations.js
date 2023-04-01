import { Functions } from "../export.js"

export class Nations {
  constructor(provider, options = { debug: false }) {
   this.provider = provider
   this.Functions = new Functions(options)
  }

  /**
   * Get's speficic Nation data in server.
   * @param {string} name
   * @returns {object}
   */
  async getNation(name, options = { server: "Nations" }) {
    let nations = await this.getAllNations({ server: options.server });
    
    return (
      nations.find(
        (nation) => nation.name.toLocaleLowerCase() == name.toLocaleLowerCase()
      ) ?? null
    );
  }

  /**
   * Get's all of Nations in server.
   * @returns {Array}
   */
  async getAllNations(options = { server: "Nations" }) {
    const remove = this.Functions.removeDuplicates
    let towns = await this.provider.towns.getAllTowns({ server: options.server });
    if (!towns) return;

    let nationsArray = [];

    towns.forEach(function (town) {
      if (town.nation != "No Nation") {
        if (!this[town.nation]) {
          this[town.nation] = {
            name: town.nation,
            residents: town.residents,
            towns: [],
            king: "Unavailable",
            capitalName: "Unavailable",
            capitalX: 0,
            capitalZ: 0,
            area: 0,
          };

          nationsArray.push(this[town.nation]);
        }

        this[town.nation].residents = remove(
          this[town.nation].residents.concat(town.residents)
        );
        this[town.nation].area += town.area;

        if (this[town.nation].name == town.nation)
          this[town.nation].towns.push(town.name);

        if (town.capital) {
          this[town.nation].capitalX = town.x;
          this[town.nation].capitalZ = town.z;
          this[town.nation].capitalName = town.name;
          this[town.nation].king = town.mayor;
        }
      }
    }, Object.create(null));

    return nationsArray;
  }

  /**
   * Gets all Joinable Nations
   * @private
   * @param {Object} nation
   * @param {Object} town
   * @returns {Object}
   */
  joinable(nation, town) {
    return (
      Math.hypot(nation.capitalX - town.x, nation.capitalZ - town.z) <= 3000 &&
      town.nation == "No Nation"
    );
  }

  /**
   * Gets all Joinable Nations.
   * @param {string} name
   * @returns {object}
   */
  async getJoinableNations(options = { server: "Nations" }) {
    let town = await this.provider.towns.getTown(townName, { server: options.server });
    if (town == "That town does not exist!") return town;

    let nations = await this.getAllNations({ server: options.server });
    if (!nations) return;

    return nations.filter((n) => this.joinable(n, town));
  }

 
}
