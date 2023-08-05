import striptags from "striptags";
import { RequestManager, Functions } from "../export.js";

export class Towns {
  constructor(provider, options = { debug: false }) {
    this.provider = provider;
    this.Functions = new Functions();
    this.RequestManager = new RequestManager();
  }

  /**
   * Get All Towns in server.
   * @returns {object}
   */
  async getAllTowns() {
    const mapData = await this.RequestManager.getMapData();
    const ops = await this.provider.player.getOnlinePlayerData();
    if (!mapData || !ops || !mapData.sets["towny.markerset"]) return;
  
    const townData = mapData.sets["towny.markerset"].areas;
    const townsArray = Object.values(townData).map((town) => {
      const rawinfo = town.desc.split("<br />");
      const info = rawinfo.map(striptags);

      const vassal = info[1].includes("Vassal") || false;
      const vassalOf = vassal && info[1].split(" ")[2] || "none";
      let townName = "";
      let Occupiedby = "";
      let IsOccupied = "";

      const nationName = info[0].slice(10).trim();
      Occupiedby = info[2].split(" ")[1] || "none";
      IsOccupied = Occupiedby ? true : Occupiedby === "none" ? false : true;

      const residents =
        info[12].slice(19).trim().split(", ") ||
        info[13].slice(19).trim().split(", ");
      const trusted = info[13].slice(20).trim() || info[14].slice(20).trim();
      const culture = info[7].split('-')[1].trim();
      const mayor = (info[3].includes("Mayor") && info[3].split("Mayor")[1].trim().replace(" ", "")) ||
        (info[4].includes("Mayor") && info[4].split("Mayor")[1].trim().replace(" ", "")) || "";
      const peacefulness = (info[5].includes("Peaceful?") && info[5].split("Peaceful?")[1].trim() === "true") ||
        (info[6].includes("Peaceful?") && info[6].split("Peaceful?")[1].trim() === "true");
      const bank = (info[8].slice(9).trim().includes("$") && info[8].slice(9).trim()) ||
        (info[9].slice(9).trim().includes("$") && info[9].slice(9).trim()) || 0;
      const upkeep = (info[9].slice(11).trim().includes("$") && info[9].slice(11).trim()) ||
        (info[10].slice(11).trim().includes("$") && info[10].slice(11).trim()) || 0;

      townName = (info[1].includes("Vassal") && info[2].split(" (")[0].trim()) ||
        (!info[1].includes("Vassal") && !info[1].includes("Member") && info[1].split(" (")[0].trim()) || "";

      const currentTown = {
        isVassal: vassal,
        vassalOf: vassalOf,
        area: this.Functions.calcPolygonArea(town.x, town.z, town.x.length) / 16 / 16,
        x: Math.round((Math.max(...town.x) + Math.min(...town.x)) / 2),
        z: Math.round((Math.max(...town.z) + Math.min(...town.z)) / 2),
        name: this.Functions.removeStyleCharacters(townName),
        nation: this.Functions.removeStyleCharacters(nationName),
        mayor: mayor,
        residents: residents,
        onlineResidents: ops.filter((op) => residents.includes(op.name)),
        capital: info[0].includes("Capital"),
        bank: bank,
        upkeep: upkeep,
        peacefulness: peacefulness,
        trusted: trusted,
        colourCodes: {
          fill: town.fillcolor,
          outline: town.color,
        },
      };
      return currentTown;
    });
    
    const townsArrayNoDuplicates = this.Functions.removeDuplicates(townsArray);
  
    return townsArrayNoDuplicates;
  }
  /**
   * Get's speficic Town data in server.
   * @param {String} name
   * @returns {object}
   */
  async getTown(name) {
    let towns = await this.getAllTowns();
    return (
      towns.find((town) => town.name.toLowerCase() === name.toLowerCase()) ??
      null
    );
  }

  /**
   * Process's all of towns.
   * @private
   * @param {object} town
   * @param {boolean} includeBelonging
   * @param {object} nation
   * @returns {object}
   */
  invitable(town, nation, includeBelonging) {
    const distance = Math.hypot(
      town.x - nation.capitalX,
      town.z - nation.capitalZ
    );
    const differentNation = town.nation !== nation.name;
    const noNation = town.nation === "No Nation";
    return (
      distance <= 3000 && differentNation && (includeBelonging || noNation)
    );
  }

  /**
   * Get's all of inviteable towns.
   * @param {string} name
   * @param {boolean} includeBelonging
   * @returns {object}
   */
  async getInvitableTowns(name, includeBelonging) {
    let nation = await this.provider.nations.getNation(name);
    if (nation === "That nation does not exist!") return nation;

    let towns = await this.getAllTowns();
    if (!towns) return;

    return towns.filter((town) =>
      this.invitable(town, nation, includeBelonging)
    );
  }
}
