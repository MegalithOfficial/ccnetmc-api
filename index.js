var fetch = require("node-fetch"),
    striptags = require("striptags"),
    fn = require("./functions"),
    Minecraft = require("minecraft-lib")

// Get information for player count on the entire server, and the max amount of players.
async function getServerData()
{
    let serverData = await Minecraft.servers.get("play.ccnetmc.com").catch(err => { return err }),
        ccnetData = {}

    if (!serverData || !serverData.players)
    {
        ccnetData["serverOnline"] = false
        ccnetData["online"] = 0
        ccnetData["max"] = 0

        return ccnetData
    }

        ccnetData["serverOnline"] = true
        ccnetData["online"] = serverData.players.online
        ccnetData["max"] = serverData.players.max

    return ccnetData
}
// Get information of player count and weather status for Towny and Nations.
async function getServerInfo()
{
    let serverData = await getServerData(),
        playerData = await getPlayerData(),
        townyPlayerData = await getTownyPlayerData(),
        info = serverData

    if (playerData != null)
    {
        info["towny"] = townyPlayerData.currentcount
        info["nations"] = playerData.currentcount
        info["storming"] = playerData.hasStorm
        info["thundering"] = playerData.isThundering
        info["ccnet"] = info["towny"] + info["nations"]
    }
        
    if (info["online"] == 0 || !info["online"]) info["hub"] = 0
    else info["hub"] = info["online"] - info["ccnet"]

    return info
}
// Fetch the player data for Nations from Dynmap and keep as JSON.
async function getPlayerData()
{
    let playerData = await fetch("https://map.ccnetmc.com/nationsmap/standalone/dynmap_world.json").then(response => response.json()).catch(err => {})
    if (!playerData || !playerData.players) return

    return playerData
}
// Fetch the player data for Towny from Dynmap and keep as JSON.
async function getTownyPlayerData()
{
    let townyPlayerData = await fetch("https://map.ccnetmc.com/townymap/standalone/dynmap_world.json").then(response => response.json()).catch(err => {})
    if (!townyPlayerData || !townyPlayerData.players) return

    return townyPlayerData
}
// Get a list of online players, by fetching the Nations player data from Dynmap.
async function getOnlinePlayerData()
{
    let playerData = await getPlayerData() 
    if (!playerData || !playerData.players) return

    return fn.editPlayerProps(playerData.players)
}
// Get a list of online players, by fetching the Towny player data from Dynmap.
async function getOnlineTownyPlayerData()
{
    let townyPlayerData = await getTownyPlayerData() 
    if (!townyPlayerData || !townyPlayerData.players) return

    return fn.editPlayerProps(townyPlayerData.players)
}
// Get the map data for Nations - this includes sieges, naval siege regions, towns and nations.
async function getMapData()
{
    let mapData = await fetch("https://map.ccnetmc.com/nationsmap/tiles/_markers_/marker_world.json").then(response => response.json()).catch(err => {})

    if (!mapData) return

    return mapData
}

// Get information for a specific town with input.
async function getTown(townNameInput)
{
    let towns = await getTowns()
        foundTown = towns.find(town => town.name.toLowerCase() == townNameInput.toLowerCase())

    if (!foundTown) return "That town does not exist!"
    else return foundTown
}
// Get all the towns on Nations, and the information about them.
async function getTowns()
{
    let mapData = await getMapData(),
        ops = await getOnlinePlayerData()

    if (!mapData || !ops) return
    if (!mapData.sets["towny.markerset"]) return

    let townsArray = [],
        townsArrayNoDuplicates = [],
        townData = mapData.sets["towny.markerset"].areas,
        townAreaNames = Object.keys(townData)

    for (let i = 0; i < townAreaNames.length; i++)
    {      
        let town = townData[townAreaNames[i]],
            rawinfo = town.desc.split("<br />")

        let info = []

        rawinfo.forEach(x => { info.push(striptags(x)) })

        let townName = info[1].split(" (")[0].trim()
        
        let nationName = info[0].slice(10).trim()
        let residents = info[12].slice(19).trim().split(", ")
        let trusted = info[13].slice(20).trim()

        let currentTown = 
        {
            area: fn.calcPolygonArea(town.x, town.z, town.x.length) / 16 / 16,
            x: Math.round((Math.max(...town.x) + Math.min(...town.x)) / 2),
            z: Math.round((Math.max(...town.z) + Math.min(...town.z)) / 2),
            name: fn.removeStyleCharacters(townName),
            nation: fn.removeStyleCharacters(nationName),
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
        } 
        townsArray.push(currentTown)
    }
    
    // TOWN LOGIC \\  
    townsArray.forEach(function (a) 
    {                   
          // If town doesnt exist, add it.
          if (!this[a.name]) 
          {      
              let nationResidents = []
            
              if (a.capital || a.nation != "No Nation")
              {
                  for (let i = 0; i < townsArray.length; i++)
                  {
                      var currentNation = townsArray[i].nation
                      let residents = townsArray[i].residents
                      
                      if (currentNation == a.nation)
                      {
                          for (let i = 0; i < residents.length; i++)
                          {
                              let currentResident = residents[i]
                              
                              nationResidents.push(currentResident)
                          }
                      }
                  }
              }
            
              this[a.name] = 
              { 
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
              }    

              townsArrayNoDuplicates.push(this[a.name])
          }
          else this[a.name].area += a.area
    }, Object.create(null))

    return townsArrayNoDuplicates
}
// Using siege markers, get all the sieges on Nations, and the information about them.
async function getSieges()
{
    let mapData = await getMapData()

    var siegesArray = [],
    siegesArrayNoDuplicates = [],
    siegeData = mapData.sets["siegewar.markerset"].markers,
    siegeAreaNames = Object.keys(siegeData)

    for (let i = 0; i < siegeAreaNames.length; i++)
    {      
        let siege = siegeData[siegeAreaNames[i]],
            rawinfo = siege.desc.split("<br />")

        var info = []

        rawinfo.forEach(x => { info.push(striptags(x)) })

        var siegeName = info[0].slice(7).split(`Town: `)[0]
        var besiegedTown = info[0].split(`Town: `)[1]
        var siegeType = info[1].slice(6)
        var siegeBal = info[2].slice(15)
        var timeLeft = info[3].slice(11)
        var warChest = info[4].slice(11)

        let currentSiege = 
        {
            name: fn.removeStyleCharacters(siegeName),
            town: fn.removeStyleCharacters(besiegedTown),
            type: siegeType,
            points: siegeBal,
            time: timeLeft,
            warchest: warChest
        }

    siegesArray.push(currentSiege)

    }

    siegesArray.forEach(function (a) 
    {
        this[a.name] = 
        { 
            name: a.name,
            town: a.town,
            type: a.type,
            points: a.points,
            time: a.time,
            warchest: a.warchest
        }    

        siegesArrayNoDuplicates.push(this[a.name])},
     Object.create(null))

    return siegesArrayNoDuplicates
}
// Using Naval Siege markers, get all the Naval Sieges on Nations, and the information about them.
async function getNavalSieges()
{
    let mapData = await getMapData()

    var navalSiegesArray = [],
    navalSiegesArrayNoDuplicates = [],
    navalSiegesData = mapData.sets["worldguard.markerset"].areas,
    navalSiegesAreaNames = Object.keys(navalSiegesData)

    for (let i = 0; i < navalSiegesAreaNames.length; i++)
    {      
        let navalSiege = navalSiegesData[navalSiegesAreaNames[i]],
            rawinfo = navalSiege.desc.split("<br />")

        var info = []

        rawinfo.forEach(x => { info.push(striptags(x)) })

		var navalSiegeName = info[1]
		var navalSiegeController = info[3].split(" - ")[1].replace("*", "")

     let currentNavalSiege = 
        {
			name: navalSiegeName,
			controller: navalSiegeController
        }

    navalSiegesArray.push(currentNavalSiege)

    }

    navalSiegesArray.forEach(function (a) 
    {
        this[a.name] = 
        { 
			name: a.name,
			controller: a.controller
        }    

        navalSiegesArrayNoDuplicates.push(this[a.name])},
     Object.create(null))

    return navalSiegesArrayNoDuplicates
}
// Get information about a single nation on Nations, with input.
async function getNation(nationNameInput)
{
    let nations = await getNations()
    if (!nations) return

    let foundNation = nations.find(nation => nation.name.toLowerCase() == nationNameInput.toLowerCase()) 
    return !foundNation ? "That nation does not exist!" : foundNation
}
// Get information about every nation on Nations.
async function getNations()
{
    let towns = await getTowns()
    if (!towns) return

    let nationsArray = []

    towns.forEach(function (town) 
    {        
        if (town.nation != "No Nation")
        {
            // If nation doesn't exist
            if (!this[town.nation]) 
            {          
                this[town.nation] = 
                { 
                    name: town.nation,
                    residents: town.residents,
                    towns: [],
                    king: "Unavailable",
                    capitalName: "Unavailable",
                    capitalX: 0,
                    capitalZ: 0,
                    area: 0
                }

                nationsArray.push(this[town.nation])
            }

            // If it already exists, add up stuff.
            this[town.nation].residents = fn.removeDuplicates(this[town.nation].residents.concat(town.residents))       
            this[town.nation].area += town.area // Add up the area

            // If the nation name is equal to the current towns nation
            if (this[town.nation].name == town.nation)
                this[town.nation].towns.push(town.name) // Push it to nation towns

            if (town.capital) 
            {
                this[town.nation].capitalX = town.x
                this[town.nation].capitalZ = town.z
                this[town.nation].capitalName = town.name
                this[town.nation].king = town.mayor
            }   
        }
    }, Object.create(null))

    return nationsArray
}
// Get enhanced information about an online player (e.g coords, rank)
async function getOnlinePlayer(playerNameInput)
{
  if (!playerNameInput) throw { name: "NO_PLAYER_INPUT", message: "No player was inputted!" }
  else if (!isNaN(playerNameInput)) throw { name: "INVALID_PLAYER_TYPE", message: "Player cannot be an integer." }

  var ops = await getOnlinePlayers(true)
  if (!ops) throw { name: "FETCH_ERROR", message: "Error fetching data, please try again." }

  let foundPlayer = ops.find(op => op.name.toLowerCase() == playerNameInput.toLowerCase())
  if (!foundPlayer) throw { name: "INVALID_PLAYER", message: "That player is offline or does not exist!" }

  return foundPlayer
}

async function getOnlinePlayers(includeResidentInfo)
{
    var onlinePlayers = await getOnlinePlayerData()
    
    if (!includeResidentInfo) return onlinePlayers

    let residents = await getResidents()
    if (!residents) return

    let merged = []
    
    for (let i = 0; i < onlinePlayers.length; i++) 
    {
        merged.push
        ({
            ...onlinePlayers[i], 
            ...(residents.find((itmInner) => itmInner.name === onlinePlayers[i].name))
        })
    }

    return merged
}

async function getResident(residentNameInput)
{
    let residents = await getResidents(),
        foundResident = {}

    if (!residents)
        foundResident = residents.find(resident => resident.name.toLowerCase() == residentNameInput.toLowerCase())

    if (!foundResident) throw { name: "INVALID_RESIDENT", message: "That resident does not exist!" }
    else return foundResident
}
// Get information about every resident on Nations.
async function getResidents()
{
    let towns = await getTowns()
    if (!towns) return

    let residentsArray = []

    if (!towns) return

    for (let i = 0; i < towns.length; i++)
    {
        var currentTown = towns[i],
            rank

        for (let i = 0; i < currentTown.residents.length; i++)
        {
            var currentResident = currentTown.residents[i]

            if (currentTown.capital && currentTown.mayor == currentResident) rank = "Nation Leader"
            else if (currentTown.mayor == currentResident) rank = "Mayor"
            else rank = "Resident"

            let resident =
            {
                name: currentResident,
                town: currentTown.name,
                nation: currentTown.nation,
                rank: rank
            }

            residentsArray.push(resident)
        }
    }

    return residentsArray
}
// Get a list of every player by collecting residents from Town Markers.
async function getAllPlayers()
{
    var onlinePlayers = await getOnlinePlayerData(),
        residents = await getResidents()

    if (!onlinePlayers || !residents) return

    let merged = []
    
    for (let i = 0; i < residents.length; i++) 
    {
        merged.push
        ({
            ...residents[i], 
            ...(onlinePlayers.find((itmInner) => itmInner.name === residents[i].name))
        })
    }

    return merged
}

async function getPlayer(playerNameInput)
{
    var allPlayers = await getAllPlayers()
    return allPlayers.find(p => p.name.toLowerCase() == playerNameInput.toLowerCase())
}
// This is broken, as CCNet dynmap cuts off the resident list if there is more than x amount of residents.
async function getTownless()
{
    let mapData = await getMapData(),
        onlinePlayers = await getOnlinePlayers()

    if (!onlinePlayers || !mapData) return

    var allTowns = [], allResidents = []
    var townData = mapData.sets["towny.markerset"].areas
    let townAreaNames = Object.keys(townData)
    
    for (let i = 0; i < townAreaNames.length; i++)
    {
        let town = townData[townAreaNames[i]]
        let rawinfo = town.desc.split("<br />")
        var info = []

        rawinfo.forEach(x => 
        {
            info.push(striptags(x)) // Strips html tags from town desc
        })

        var name = info[1].split(" (")[0].replace(/_/gi, " ").trim()
        if (name.endsWith("(Shop)")) continue
                
        var mayor = info[3].slice(9)
        if (mayor == "") continue
        
        let residents = info[12].slice(19).split(", ")

        allTowns.push(residents)
    }

    // Push every resident in every town
    allTowns.forEach(town => 
    {
        town.forEach(resident => allResidents.push(resident))
    })

    var townlessPlayers = onlinePlayers.filter(op => !allResidents.find(resident => resident == op.name))
                                                
    townlessPlayers.sort((a, b) => 
    {
        if (b.name.toLowerCase() < a.name.toLowerCase()) return 1
        if (b.name.toLowerCase() > a.name.toLowerCase()) return -1
    })

    return townlessPlayers
}
// Get a list of all towns that are not in a nation.
async function getInvitableTowns(nationName, includeBelonging)
{
    let nation = await getNation(nationName)

    if (nation == "That nation does not exist!") 
        return nation

    let towns = await getTowns()
    if (!towns) return

    function invitable(town)
    {
        if (includeBelonging) return Math.hypot(town.x - nation.capitalX, town.z - nation.capitalZ) <= 3000 && town.nation != nationName
        else return Math.hypot(town.x - nation.capitalX, town.z - nation.capitalZ) <= 3000 && town.nation != nationName && town.nation == "No Nation"
    }

    return towns.filter(town => invitable(town))
}

async function getJoinableNations(townName)
{
    let town = await getTown(townName)
    if (town == "That town does not exist!") return town
    
    let nations = await getNations()
    if (!nations) return

    function joinable(nation)
    {
        return Math.hypot(nation.capitalX - town.x, nation.capitalZ - town.z) <= 3000 && town.nation == "No Nation"
    }

    return nations.filter(n => joinable(n))
}
// Get a list of players that are near these coords, in this radius.
async function getNearbyPlayers(xInput, zInput, xRadius, zRadius)
{
    let allPlayers = await getAllPlayers()

    return allPlayers.filter(p => 
    {            
        if (p.x != 0 && p.z != 0)
        {
            return (p.x <= (xInput + xRadius) && p.x >= (xInput - xRadius)) &&
                   (p.z <= (zInput + zRadius) && p.z >= (zInput - zRadius))
        }
    })
}
// Get a list of towns that are near these coords, in this radius.
async function getNearbyTowns(xInput, zInput, xRadius, zRadius)
{
    let towns = await getTowns()
    if (!towns) return

    return towns.filter(t => 
    {            
        return (t.x <= (xInput + xRadius) && t.x >= (xInput - xRadius)) &&
               (t.z <= (zInput + zRadius) && t.z >= (zInput - zRadius))
    })
}
// Get a list of nations that are near these coords, in this radius.
async function getNearbyNations(xInput, zInput, xRadius, zRadius)
{
    let nations = await getNations()
    if (!nations) return

    return nations.filter(n => 
    {            
        return (n.capitalX <= (xInput + xRadius) && n.capitalX >= (xInput - xRadius)) &&
               (n.capitalZ <= (zInput + zRadius) && n.capitalZ >= (zInput - zRadius))
    })
}

// Export async functions for use in other programs that depend on this NPM package.
module.exports =    
{
    getTown,
    getTowns,
    getNation,
    getNations,
    getResident,
    getResidents,
    getOnlinePlayer,
    getOnlinePlayers,
    getAllPlayers,
    getPlayer,
    getTownless,
    getServerInfo,
    getInvitableTowns,
    getJoinableNations,
    getNearbyPlayers,
    getNearbyTowns,
    getNearbyNations,
    getSieges,
    getNavalSieges,
    getOnlineTownyPlayerData
}
//#endregion