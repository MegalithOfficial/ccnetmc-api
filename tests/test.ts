import { CCnet } from "../dist/main";

async function main() {
  const ccnet = new CCnet();
  console.log(await ccnet.towns.getTown("Orion"));
};

main();