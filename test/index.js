import { CCnet } from "../main.js";

const api = new CCnet({});

(async () => {
const data = await api.getTowns({ server: "Nations" })
console.log(data)
})()

