import { InvalidServerType, InvalidPlayer, NoPlayerInput, FetchError } from "./Error.js";
import { RequestManager } from "./RequestManager.js";
import { Functions } from "./functions.js"
import striptags from "striptags"

export class CCnet {

  constructor() {
    this.RequestManager = new RequestManager();
    this.Functions = new Functions();
  };

  /**
   * Get's Player data.
   * @returns {object}
   */
  async getPlayerData(options = { server: "Nations" }) {

    if (options.server.toLowerCase() === "nations") return await this.RequestManager.getNationsPlayerData();
    else if (options.server.toLowerCase() === "towny") return await this.RequestManager.getTownyPlayerData();
    else throw new InvalidServerType("Invalid server type. Please choose either 'Nations' or 'Towny'.");
  };

  /**
   * Get's Online Player data.
   * @returns {object}
   */
  async getOnlinePlayerData(options = { server: "Nations" }) {

    const data = await this.getPlayerData({ server: options.server });
    return (this.Functions.editPlayerProps(data.players) ?? null);
  };

  /**
   * Get All Towns in server.
   * @returns {object}
   */
  async getTowns(options = { server: "Nations" }) {

    const mapData = await this.RequestManager.getMapData({ server: options.server });
    const ops = await this.getOnlinePlayerData({ server: options.server });

    if (!mapData || !ops) return;
    if (!mapData.sets["towny.markerset"]) return;

    let townsArray = [],
      townsArrayNoDuplicates = [],
      townData = mapData.sets["towny.markerset"].areas,
      townAreaNames = Object.keys(townData);

    for (let i = 0; i < townAreaNames.length; i++) {
      let town = townData[townAreaNames[i]],
        rawinfo = town.desc.split("<br />");

      let info = [];

      rawinfo.forEach(x => { info.push(striptags(x)) });

      let townName = info[1].split(" (")[0].trim();

      let nationName = info[0].slice(10).trim();
      let residents = info[12].slice(19).trim().split(", ");
      let trusted = info[13].slice(20).trim();

      let currentTown = {
        area: this.Functions.calcPolygonArea(town.x, town.z, town.x.length) / 16 / 16,
        x: Math.round((Math.max(...town.x) + Math.min(...town.x)) / 2),
        z: Math.round((Math.max(...town.z) + Math.min(...town.z)) / 2),
        name: this.Functions.removeStyleCharacters(townName),
        nation: this.Functions.removeStyleCharacters(nationName),
        mayor: info[3].slice(9).replace(" ", ""),
        residents: residents,
        onlineResidents: ops.filter(op => residents.find(resident => resident == op.name)),
        capital: info[0].includes("Capital"),
        bank: info[8].slice(9).trim(),
        upkeep: info[9].slice(11).trim(),
        peacefulness: info[5].slice(12).trim() == "true" ? true : false,
        trusted: trusted,
        colourCodes: {
          fill: town.fillcolor,
          outline: town.color
        }
      };
      townsArray.push(currentTown);
    };

    townsArray.forEach(function (a) {
      if (!this[a.name]) {
        let nationResidents = [];

        if (a.capital || a.nation != "No Nation") {
          for (let i = 0; i < townsArray.length; i++) {
            var currentNation = townsArray[i].nation;
            let residents = townsArray[i].residents;

            if (currentNation == a.nation) {
              for (let i = 0; i < residents.length; i++) {
                let currentResident = residents[i];

                nationResidents.push(currentResident);
              };
            };
          };
        };

        this[a.name] = {
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
          colourCodes: a.colourCodes
        };

        townsArrayNoDuplicates.push(this[a.name]);
      } else this[a.name].area += a.area;
    }, Object.create(null));

    return townsArrayNoDuplicates;
  };

  /**
   * Get's speficic Town data in server.
   * @param {String} name 
   * @returns {object}
   */
  async getTown(name, options = { server: "Nations" }) {

    let towns = await this.getTowns({ server: options.server });
    return (towns.find(town => town.name.toLowerCase() == name.toLowerCase()) ?? null);
  };

  /**
   * Get's All sieges in Nations server.
   * @returns {object}
   */
  async getSieges() {

    let mapData = await this.RequestManager.getMapData({ server: "Nations" });

    var siegesArray = [],
      siegesArrayNoDuplicates = [],
      siegeData = mapData.sets["siegewar.markerset"].markers,
      siegeAreaNames = Object.keys(siegeData);

    for (let i = 0; i < siegeAreaNames.length; i++) {
      let siege = siegeData[siegeAreaNames[i]],
        rawinfo = siege.desc.split("<br />");

      var info = [];

      rawinfo.forEach(x => { info.push(striptags(x)) });

      var siegeName = info[0].slice(7).split(`Town: `)[0];
      var besiegedTown = info[0].split(`Town: `)[1];
      var siegeType = info[1].slice(6);
      var siegeBal = info[2].slice(15);
      var timeLeft = info[3].slice(11);
      var warChest = info[4].slice(11);

      let currentSiege = {
        name: this.Functions.removeStyleCharacters(siegeName),
        town: this.Functions.removeStyleCharacters(besiegedTown),
        type: siegeType,
        points: siegeBal,
        time: timeLeft,
        warchest: warChest
      };

      siegesArray.push(currentSiege);

    };

    siegesArray.forEach(function (a) {
      this[a.name] = {
        name: a.name,
        town: a.town,
        type: a.type,
        points: a.points,
        time: a.time,
        warchest: a.warchest
      };

      siegesArrayNoDuplicates.push(this[a.name])
    },
      Object.create(null));

    return siegesArrayNoDuplicates;
  };

  /**
   * Get's All Naval sieges in Nations server.
   */
  async getNavalSieges() {

    let mapData = await this.RequestManager.getMapData({ server: "Nations" });

    var navalSiegesArray = [],
      navalSiegesArrayNoDuplicates = [],
      navalSiegesData = mapData.sets["worldguard.markerset"].areas,
      navalSiegesAreaNames = Object.keys(navalSiegesData);

    for (let i = 0; i < navalSiegesAreaNames.length; i++) {
      let navalSiege = navalSiegesData[navalSiegesAreaNames[i]],
        rawinfo = navalSiege.desc.split("<br />");

      var info = [];

      rawinfo.forEach(x => { info.push(striptags(x)) });

      var navalSiegeName = info[1];
      var navalSiegeController = info[3].split(" - ")[1].replace("*", "");

      let currentNavalSiege = {
        name: navalSiegeName,
        controller: navalSiegeController
      };

      navalSiegesArray.push(currentNavalSiege);

    };

    navalSiegesArray.forEach(function (a) {
      this[a.name] = {
        name: a.name,
        controller: a.controller
      };

      navalSiegesArrayNoDuplicates.push(this[a.name])
    },
      Object.create(null));

    return navalSiegesArrayNoDuplicates;

  };

  /**
   * Get's speficic Nation data in server.
   * @param {string} name 
   * @returns {object}
   */
  async getNation(name, options = { server: "Nations" }) {

    let nations = await this.getNations({ server: options.server });
    return (nations.find(nation => nation.name.toLowerCase() == name.toLowerCase()) ?? null);
  };

  /**
   * Get's all of Nations in server.
   * @returns {Array}
   */
  async getNations(options = { server: "Nations" }) {

    let removeDuplicates = this.Functions.removeDuplicates;
    let towns = await this.getTowns({ server: options.server });
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
            area: 0
          };

          nationsArray.push(this[town.nation]);
        };

        this[town.nation].residents = removeDuplicates(this[town.nation].residents.concat(town.residents));
        this[town.nation].area += town.area;

        if (this[town.nation].name == town.nation) this[town.nation].towns.push(town.name);

        if (town.capital) {
          this[town.nation].capitalX = town.x;
          this[town.nation].capitalZ = town.z;
          this[town.nation].capitalName = town.name;
          this[town.nation].king = town.mayor;
        };
      };
    },
      Object.create(null));

    return nationsArray;
  };

  /**
   * Get's player data.
   * @param {string} name 
   * @returns {object}
   */
  async getPlayer(name, options = { server: "Nations" }) {

    if (!name) throw new NoPlayerInput("No Player name provided.");
    else if (typeof name !== "string") throw InvalidPlayer("Player name must be a string.");

    const ops = await this.getOnlinePlayers(true, { server: options.server });
    if (!ops) throw new FetchError("Failed to fetch data.");

    let foundPlayer = ops.find(op => op.name.toLowerCase() == name.toLowerCase());
    if (!foundPlayer) throw InvalidPlayer("Player doesnt Exist or offline.");

    return (foundPlayer ?? null);
  };

  /**
   * Get's all of Online players
   * @param {Boolean} includeResidentInfo 
   * @returns {object}
   */
  async getOnlinePlayers(includeResidentInfo = true, options = { server: "Nations" }) {

    var onlinePlayers = await this.getOnlinePlayerData({ server: options.server });
    if (!includeResidentInfo) return onlinePlayers;

    let residents = await this.getResidents({ server: options.server });
    if (!residents) return;

    let merged = [];

    for (let i = 0; i < onlinePlayers.length; i++) {
      merged.push({
        ...onlinePlayers[i],
        ...(residents.find((itmInner) => itmInner.name === onlinePlayers[i].name))
      });
    };

    return merged;
  };

  /**
   * Get all of Towns Residents.
   * @returns 
   */
  async getResidents(options = { server: "Nations" }) {
    let towns = await this.getTowns({ server: options.server });
    if (!towns) return;

    let residentsArray = [];

    if (!towns) return;

    for (let i = 0; i < towns.length; i++) {
      var currentTown = towns[i],
        rank;

      for (let i = 0; i < currentTown.residents.length; i++) {
        var currentResident = currentTown.residents[i];

        if (currentTown.capital && currentTown.mayor == currentResident) rank = "Nation Leader";
        else if (currentTown.mayor == currentResident) rank = "Mayor";
        else rank = "Resident";

        let resident = {
          name: currentResident,
          town: currentTown.name,
          nation: currentTown.nation,
          rank: rank
        };

        residentsArray.push(resident);
      };
    };
    return residentsArray;
  };

  /**
   * Get's all of players.
   * @returns {object}
   */
  async getAllPlayers(options = { server: "Nations" }) {

    var onlinePlayers = await this.getOnlinePlayerData({ server: options.server }),
      residents = await this.getResidents({ server: options.server });

    if (!onlinePlayers || !residents) return;

    let merged = [];

    for (let i = 0; i < residents.length; i++) {
      merged.push
        ({
          ...residents[i],
          ...(onlinePlayers.find((itmInner) => itmInner.name === residents[i].name))
        });
    };

    return merged;
  };

  /**
   * Get's player.
   * @param {String} name 
   * @returns {object}
   */
  async getPlayer(name, options = { server: "Nations" }) {
    var allPlayers = await this.getAllPlayers({ server: options.server });
    return (allPlayers.find(p => p.name.toLowerCase() == name.toLowerCase()) ?? null);
  };

  /**
   * Process's all of towns.
   * @private
   * @param {object} town 
   * @param {boolean} includeBelonging
   * @param {object} nation 
   * @returns {object}
   */
  invitable(town, nation, includeBelonging) {
    if (includeBelonging) return Math.hypot(town.x - nation.capitalX, town.z - nation.capitalZ) <= 3000 && town.nation != nationName
    else return Math.hypot(town.x - nation.capitalX, town.z - nation.capitalZ) <= 3000 && town.nation != nationName && town.nation == "No Nation"
  };

  /**
   * Get's all of inviteable towns.
   * @param {string} name 
   * @param {boolean} includeBelonging 
   * @returns {object}
   */
  async getInvitableTowns(name, includeBelonging, options = { server: "Nations" }) {

    let nation = await this.getNation(name, { server: options.server });
    if (nation == "That nation does not exist!") return nation;

    let towns = await this.getTowns({ server: options.server });
    if (!towns) return;

    return (towns.filter(town => this.invitable(town, nation, includeBelonging)) ?? null);
  };

  /**
   * Gets all Joinable Nations
   * @private
   * @param {Object} nation 
   * @param {Object} town 
   * @returns {Object}
   */
  joinable(nation, town) {
    return Math.hypot(nation.capitalX - town.x, nation.capitalZ - town.z) <= 3000 && town.nation == "No Nation";
  };

  /**
   * Gets all Joinable Nations.
   * @param {string} name 
   * @returns {object}
   */
  async getJoinableNations(name, options = { server: "Nations" }) {
    let town = await this.getTown(townName, { server: options.server });
    if (town == "That town does not exist!") return town;

    let nations = await this.getNations({ server: options.server });
    if (!nations) return;

    return nations.filter(n => this.joinable(n, town));
  };


  /**
   * get All nearby players in a radius.
   * @param {number} xInput 
   * @param {number} zInput 
   * @param {number} xRadius 
   * @param {number} zRadius 
   * @returns {Array}
   */
  async getNearbyPlayers(xInput, zInput, xRadius, zRadius, options = { server: "Nations" }) {
    let allPlayers = await this.getAllPlayers({ server: options.server });

    return allPlayers.filter(p => {
      if (p.x != 0 && p.z != 0) {
        return (p.x <= (xInput + xRadius) && p.x >= (xInput - xRadius)) &&
          (p.z <= (zInput + zRadius) && p.z >= (zInput - zRadius))
      }
    })
  }

  /**
   * get All nearby Towns in a radius.
   * @param {number} xInput 
   * @param {number} zInput 
   * @param {number} xRadius 
   * @param {number} zRadius 
   * @returns {Array}
   */
  async getNearbyTowns(xInput, zInput, xRadius, zRadius, options = { server: "Nations" }) {
    let towns = await this.getTowns({ server: options.server });
    if (!towns) return

    return towns.filter(t => {
      return (t.x <= (xInput + xRadius) && t.x >= (xInput - xRadius)) &&
        (t.z <= (zInput + zRadius) && t.z >= (zInput - zRadius))
    })
  }

  /**
 * get All nearby Nations in a radius.
 * @param {number} xInput 
 * @param {number} zInput 
 * @param {number} xRadius 
 * @param {number} zRadius 
 * @returns {Array}
 */
  async getNearbyNations(xInput, zInput, xRadius, zRadius, options = { server: "Nations" }) {
    let nations = await this.getNations({ server: options.server });
    if (!nations) return

    return nations.filter(n => {
      return (n.capitalX <= (xInput + xRadius) && n.capitalX >= (xInput - xRadius)) &&
        (n.capitalZ <= (zInput + zRadius) && n.capitalZ >= (zInput - zRadius))
    })
  }

};