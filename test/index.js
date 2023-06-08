import { CCnet } from "../main.js";

const api = new CCnet();

(async () => {
const data = await api.nations.getNation()
console.log(data.area);
})();