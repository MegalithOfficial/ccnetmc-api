import types from "../types/types.js";
import striptags from "striptags";
import { RequestManager, Functions } from "../export.js"

export class Towns {
  constructor(provider, options = { debug: false }) {
    this.provider = provider
    this.Functions = new Functions()
    this.RequestManager = new RequestManager()
  }

  /**
   * Get All Towns in server.
   * @returns {object}
   */
  async getTowns({ server = "Nations" } = {}) {
    const mapData = await this.RequestManager.getMapData({ server });
    const ops = await this.provider.player.getOnlinePlayerData({ server });

    if (server.toLocaleLowerCase() === "towny") {
       throw Error("Towny option is not supported for now.")
      /*if (!mapData?.sets || !ops) return;

      const townareas = mapData.sets["towny.markerset"]?.areas ?? [];
      if (!townareas) return;

      let townsArray = [],
        townsArrayNoDuplicates = [],
        townData = mapData.sets["towny.markerset"].areas,
        townAreaNames = Object.keys(townData);

      for (const townAreaName of townAreaNames) {
        let town = townData[townAreaName],
          rawinfo = town.desc.split("<br />");

        let info = rawinfo.map((item) => striptags(item));

        let nation = info[0] || "None";
        let Townname = info[1];
        let population = info[2].slice(" - ")[1];
        let mayor = info[3].slice(" - ")[1]
        let Board = info[5].slice(" - ")[1];
        let Residents = info[6].slice(" - ")[1];
        let Founded = info[7].slice("-")[1];
        console.log(nation, Townname, population, mayor, Board, Residents, Founded);

        let currentTown = {
          nation: nation,
          name: Townname,
          population: population,
          mayor: mayor,
          board: Board,
          residents: Residents,
          founded: Founded,
          onlineResidens: ops.filter((op) => Residents.find((resident) => resident == op.name)),
        }

        townsArray.push(currentTown);

      }

      townsArray.forEach((a) => {
        if (!this[a.name]) {
          let nationResidents = [];

          if (a.capital || a.nation != "No Nation") {
            let nationTowns = townsArray.filter((town) => town.nation === a.nation);
            nationResidents = nationTowns.flatMap((town) => town.residents);
          }

          this[a.name] = {
            name: a.name,
            nation: a.nation,
            residents: a.residents,
            mayor: a.mayor,
            population: a.population,
            board: a.board,
            founded: a.founded,
          };

          townsArrayNoDuplicates.push(this[a.name]);
        } else this[a.name].area += a.area;
      }, Object.create(null));*/

    } else {

      if (!mapData?.sets || !ops) return;

      const townareas = mapData.sets["towny.markerset"]?.areas ?? [];
      if (!townareas) return;

      let townsArray = [],
        townsArrayNoDuplicates = [],
        townData = mapData.sets["towny.markerset"].areas,
        townAreaNames = Object.keys(townData);

      for (const townAreaName of townAreaNames) {
        let town = townData[townAreaName],
          rawinfo = town.desc.split("<br />");

        let info = rawinfo.map((item) => striptags(item));

        let [nationName, vassalInfo, townNameInfo, mayorInfo, , peacefulnessInfo] =
          info;

        let vassal = vassalInfo.includes("Vassal");
        let vassalOf = vassal ? vassalInfo.split(" ")[2] : "none";
        let townName = "";

        nationName = nationName.slice(10).trim();
        let residents =
          info[12].slice(19).trim().split(", ") ||
          info[13].slice(19).trim().split(", ");
        let trusted = info[13].slice(20).trim() || info[14].slice(20).trim();
        let mayor = "";
        let peacefulness = "";
        let bank = 0;
        let upkeep = 0;

        if (info[8].slice(9).trim().includes("$")) bank = info[8].slice(9).trim();
        else if (info[9].slice(9).trim().includes("$"))
          bank = info[9].slice(9).trim();

        if (info[9].slice(11).trim().includes("$"))
          upkeep = info[9].slice(11).trim();
        else if (info[10].slice(11).trim().includes("$"))
          upkeep = info[10].slice(11).trim();

        if (mayorInfo.startsWith("Mayor")) {
          let [, mayorName] = mayorInfo.split(":");
          mayor = mayorName.replace(" ", "");
        } else if (info[4].startsWith("Mayor")) {
          let [, mayorName] = info[4].split(":");
          mayor = mayorName.replace(" ", "");
        }

        if (peacefulnessInfo.startsWith("Peaceful?")) {
          let [, peacefulnessValue] = peacefulnessInfo.split(":");
          peacefulness = peacefulnessValue.trim() === "true";
        } else if (info[6].startsWith("Peaceful?")) {
          let [, peacefulnessValue] = info[6].split(":");
          peacefulness = peacefulnessValue.trim() === "true";
        }

        if (vassalInfo.includes("Vassal"))
          townName = townNameInfo.split(" (")[0].trim();
        else if (!vassalInfo.includes("Vassal") && !vassalInfo.includes("Member"))
          townName = townNameInfo.split(" (")[0].trim();

        let currentTown = {
          isVassal: vassal,
          vassalOf,
          area:
            this.Functions.calcPolygonArea(town.x, town.z, town.x.length) / 16 / 16,
          x: Math.round((Math.max(...town.x) + Math.min(...town.x)) / 2),
          z: Math.round((Math.max(...town.z) + Math.min(...town.z)) / 2),
          name: this.Functions.removeStyleCharacters(townName),
          nation: this.Functions.removeStyleCharacters(nationName),
          mayor,
          residents,
          onlineResidents: ops.filter((op) =>
            residents.find((resident) => resident == op.name)
          ),
          capital: info[0].includes("Capital"),
          bank,
          upkeep,
          peacefulness,
          trusted,
          colourCodes: {
            fill: town.fillcolor,
            outline: town.color,
          },
        };

        townsArray.push(currentTown);
      }
      townsArray.forEach((a) => {
        if (!this[a.name]) {
          let nationResidents = [];

          if (a.capital || a.nation != "No Nation") {
            let nationTowns = townsArray.filter((town) => town.nation === a.nation);
            nationResidents = nationTowns.flatMap((town) => town.residents);
          }

          this[a.name] = {
            isVassal: a.isVassal,
            vassalof: a.vassalOf,
            name: a.name,
            nation: a.nation,
            residents: a.residents,
            area: a.area,
            mayor: a.mayor,
            capital: a.capital,
            x: a.x,
            z: a.z,
            bank: a.bank,
            upkeep: a.upkeep,
            peacefulness: a.peacefulness,
            trusted: a.trusted,
            colourCodes: a.colourCodes,
          };

          townsArrayNoDuplicates.push(this[a.name]);
        } else this[a.name].area += a.area;
      }, Object.create(null));

      return townsArrayNoDuplicates;
    }
  }

  /**
   * Get's speficic Town data in server.
   * @param {String} name
   * @returns {object}
   */
  async getTown(name, { server = "Nations" } = {}) {
    let towns = await this.getTowns({ server });
    return (
      towns.find(
        (town) => town.name.toLowerCase() === name.toLowerCase()
      ) ?? null
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
    const distance = Math.hypot(town.x - nation.capitalX, town.z - nation.capitalZ);
    const differentNation = town.nation !== nation.name;
    const noNation = town.nation === "No Nation";
    return distance <= 3000 && differentNation && (includeBelonging || noNation);
  }

  /**
   * Get's all of inviteable towns.
   * @param {string} name
   * @param {boolean} includeBelonging
   * @returns {object}
   */
  async getInvitableTowns(name, includeBelonging, { server = "Nations" } = {}) {
    let nation = await this.provider.getNation(name, { server });
    if (nation === "That nation does not exist!") return nation;

    let towns = await this.getTowns({ server });
    if (!towns) return;

    return towns.filter((town) => this.invitable(town, nation, includeBelonging));
  }
}
