import { CCnet } from "./src/main.js";
import ora from "ora"

import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

const api = new CCnet({
  cache: false,
  cacheRefreshInterval: 30000,
});

const data = new Map();

function format(number) {
  return number
    .toString()
    .replaceAll(",", "")
    .replaceAll("$", "")
    .split(".")[0];
}

async function start() {

    const answer = await (await rl.question('Enter Server option ("Nations" or "Towny"): ')).toLowerCase()

    if(!(answer === "nations" || answer === "towny")) {
        console.log(answer +" is a Invalid option!");
        return start();
    } else {

        const spinner = ora('Requesting Server for data...').start()
        spinner.color = 'green';
        const start = Date.now();

        let towns = [];

       await api.towns.getTowns({ server: answer }).then((d) => {
          d.forEach((a) => {
            const upkeep = parseInt(format(a.upkeep));
            const bank = parseInt(format(a.bank));
            if (bank < upkeep) {
              towns.push(a.name);
              data.set(a.name, {
                bank: bank,
                upkeep: upkeep,
                name: a.name,
                status: "Going to Ruin.",
              });
              //console.log(`${a.name} going to ruined. \n Town bank: ${format(a.bank)} \n Town Upkeep: ${format(a.upkeep)} \n ----------------------- `)
            } else if (a.bank.includes("-")) {
              towns.push(a.name);
              data.set(a.name, {
                bank: bank,
                upkeep: upkeep,
                name: a.name,
                status: "In Bankcrupt (Going to Ruin soon.).",
              });
            }
          });
        });

        console.log(towns)


        if (!towns) {
            spinner.fail("None of the town in " + answer + " going to be ruined today.");
          start();
        } else {
            let message = "";
            for(let i = 0; i < towns.length; i++) {
                const town = data.get(towns[i])
                  message += `
                  ~ Town Name: ${town.name}
                  ~ Status: ${town.status}
                  ~ Bank: ${town.bank}
                  ~ Upkeep: ${town.upkeep}
                  \n
                 `

            }

            const end = Date.now();


             spinner.succeed(`Server data Processed! Results: (took ${((end - start) / 1000).toFixed(2)} seconds) \n` + message);
        }

    }

}

(async function() {
start();    
})();
