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

