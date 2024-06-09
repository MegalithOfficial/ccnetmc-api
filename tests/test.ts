import { CCnet } from "../dist/main";
const ccnet = new CCnet();

async function main() {
  console.log(await ccnet.towns.getTown("Zeltstatt"))
};

main();