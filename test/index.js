import { CCnet } from "../main.js";

const api = new CCnet({});

(async () => {
const data = await api.towns.getTowns({ server: "nations" })
console.log(data)
})()