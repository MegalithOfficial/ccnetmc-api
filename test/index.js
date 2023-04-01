import { CCnet } from "../main.js";

const api = new CCnet();

(async () => {
const data = await api.server.getServerData();
console.log(data);
})();