import { CCnet } from "../main.js";

const api = new CCnet({
  cache: false,
  cacheRefreshInterval: 30000
});

api.getAllPlayers().then((d) => {
  console.log(d)
})
api.getAllPlayers().then((d) => {
  console.log("fast")
  console.log(d)
})
/*
function format(number) {
  return number.toString().replaceAll(",", "").replaceAll("$", "").split(".")[0];
}

api.getTowns().then(d => {
  d.forEach(a => {
    const upkeep = parseInt(format(a.upkeep))
    const bank = parseInt(format(a.bank))
      if (bank < upkeep) {
        console.log(`${a.name} going to ruined. \n Town bank: ${format(a.bank)} \n Town Upkeep: ${format(a.upkeep)} \n ----------------------- `)
      }
  })
})*/
