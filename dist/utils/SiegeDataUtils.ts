import { IStatistics, ISectionStatistics, ISiegeEntry, SiegeData, Killtable } from "../Interfaces/export";
import { RequestManager } from "./RequestManager";
import { JSDOM } from 'jsdom';
import fs from "node:fs"

export class SiegeDataUtils {
  private requestManager: RequestManager;
  private currentPage = 1;
  private hasNextPage = true;

  constructor(requestManager: RequestManager) {
    if (!requestManager) throw Error("Request Manager class cannot be found.");
    if (!(requestManager instanceof RequestManager)) throw Error("Given class is not RequestManager class.");

    this.requestManager = requestManager;
  };

  public async scrapeData(): Promise<ISiegeEntry[]> {
    const siegeData: ISiegeEntry[] = [];

    while (this.hasNextPage) {
      try {
        const response = await this.requestManager.getSiegeData(`/index.php?page=${this.currentPage}`)

        if (response !== null) {
          const dom = new JSDOM(response);
          const { document } = dom.window;

          const siegeTable = document.querySelector('#siegeTable');

          if (siegeTable) {
            siegeTable.querySelectorAll('tr').forEach((row: any) => {
              const columns = row.querySelectorAll('td');
              if (columns.length === 4) {
                //@ts-ignore
                const columnData = Array.from(columns).map((column) => (column.textContent || '').trim());
                const siegeEntry: ISiegeEntry = {
                  Time: columnData[0],
                  Siege: columnData[1],
                  Victim: columnData[2].replace(/\([^)]+\)/, ''),
                  VictimNation: columnData[2].match(/\([^)]+\)/)[0].slice(1, -1),
                  Killer: columnData[3].replace(/\([^)]+\)/, ''),
                  KillerNation: columnData[3].match(/\([^)]+\)/)[0].slice(1, -1),
                };
                siegeData.push(siegeEntry);
              }
            });

            if (response.includes('No kills found')) {
              this.hasNextPage = false;
            } else {
              this.currentPage++;
            }
          } else {
            console.log("Table with id 'siegeTable' not found on the page.");
            break;
          }
        } else {
          console.log('Failed to retrieve the web page.');
          break;
        }
      } catch (error) {
        console.error('Error:', error);
        break;
      }
    }

    return siegeData;
  }

  public async fetchPlayerData(playername: string): Promise<IStatistics | undefined> {
    try {
      const response = await this.requestManager.getSiegeData(`/player_stats.php?player=${playername}`);

      if (response !== null) {
        const dom = new JSDOM(response);
        const { document } = dom.window;

        const statistics: IStatistics = {};

        document.querySelectorAll('div.card').forEach((card: any) => {
          const cardTitle = (card.querySelector('.card-header')?.textContent || '').trim();
          if (cardTitle) {
            const table = card.querySelector('table');
            if (table) {
              const sectionStatistics: ISectionStatistics = { Kills: 0, Assists: '', Deaths: '', KDR: '', KDA: '' };
              table.querySelectorAll('tbody tr').forEach((row: any) => {
                const columns = Array.from(row.querySelectorAll('td') as NodeListOf<HTMLTableCellElement>);
                if (columns.length === 5) {
                  const labels = ['Kills', 'Assists', 'Deaths', 'KDR', 'KDA'];
                  columns.forEach((column, index) => {
                    const text = (column.textContent?.trim() || '');
                    sectionStatistics[labels[index]] = index === 0 ? parseInt(text, 10) : text;
                  });
                }
              });

              if (!statistics[cardTitle]) {
                statistics[cardTitle] = sectionStatistics;
              } else {
                statistics[cardTitle] = { ...statistics[cardTitle] as ISectionStatistics, ...sectionStatistics };
              }
            }
          }
        });

        const siegeTable = document.querySelector('#siegeTable');
        if (siegeTable) {
          const siegeData: ISiegeEntry[] = [];
          siegeTable.querySelectorAll('tbody tr').forEach((row: any) => {
            const columns = Array.from(row.querySelectorAll('td') as NodeListOf<HTMLTableCellElement>);
            if (columns.length === 4) {
              const rowData = columns.map((column) => column.textContent?.trim() || '');
              const siegeEntry: ISiegeEntry = {
                Time: rowData[0],
                Siege: rowData[1].trim(),
                Victim: rowData[2].trim().replace(/\([^)]+\)/, ""),
                //@ts-ignore
                VictimNation: rowData[2].trim().match(/\([^)]+\)/)[0].slice(1, -1),
                Killer: rowData[3].trim().replace(/\([^)]+\)/, ""),
                //@ts-ignore
                KillerNation: rowData[3].trim().match(/\([^)]+\)/)[0].slice(1, -1),
              };
              siegeData.push(siegeEntry);
            }
          });

          statistics['SiegeTable'] = siegeData;
        }

        return statistics;
      } else throw new Error("Website replied with unexpected response.");
    } catch (error) { throw error };
  };

  public async getSiegeUUID(): Promise<{ [key: string]: string }> {
    try {
      const response = await this.requestManager.getSiegeData("/sieges.php");

      if (response !== null) {
        const dom = new JSDOM(response);
        const { document } = dom.window;

        const siegeTable = document.querySelector('#siegeTable');

        if (siegeTable) {
          const townData: { [key: string]: string } = {};

          siegeTable.querySelectorAll('tbody tr').forEach((row: any) => {
            const columns = row.querySelectorAll('td');
            if (columns.length === 7) {
              //@ts-ignore
              const columnData = Array.from(columns).map((column) => column.textContent?.trim() ?? '');

              const viewLink = row.querySelector('a[href^="siege.php"]');
              let uuid = '';
              if (viewLink) {
                const href = viewLink.getAttribute('href');
                const match = href?.match(/siege_uuid=([0-9a-f-]+)/i);
                if (match) {
                  uuid = match[1];
                }
              }

              const townName = columnData[0];
              townData[townName] = uuid;
            }
          });

          return townData;
        } else throw new Error("'siegeTable' cannot be found in Website.");

      } else throw new Error("Website replied with unexpected response.");
    } catch (error) { throw error };
  };

  public async getSiegeData(townName: string): Promise<SiegeData | null> {
    const uuidlist = await this.getSiegeUUID();
    const uuid = uuidlist[townName]
    if (!uuid) throw new Error("Town cannot be found.")

    try {
      const response = await this.requestManager.getSiegeData(`/siege.php?siege_uuid=${uuid}&town=${townName}`);

      const dom = new JSDOM(response);
      const { document } = dom.window;

      const siegeData: SiegeData = {
        startTime: '',
        endTime: '',
        type: '',
        attacker: '',
        defender: '',
        pointsBalance: '',
        kills: {
          attackers: '',
          defenders: '',
          attackerKDR: '',
          defenderKDR: '',
        },
        craftKills: {
          attackers: '',
          defenders: '',
          attackerKDR: '',
          defenderKDR: '',
        },
        consumables: {
          pearls: {
            attackers: '',
            defenders: '',
          },
          pots: {
            attackers: '',
            defenders: '',
          },
          food: {
            attackers: '',
            defenders: '',
          },
        },
        //@ts-ignore
        killtable: [],
      };

      const summarySection = document.querySelector('#collapseSummary');
      if (summarySection) {
        const summaryText = summarySection.querySelectorAll('p.card-text');
        siegeData.startTime = summaryText[0].textContent!.trim().split(': ')[1];
        siegeData.endTime = summaryText[1].textContent!.trim().split(': ')[1];
        siegeData.type = summaryText[2].textContent!.trim().split(': ')[1];
        siegeData.attacker = summaryText[3].textContent!.trim().split(': ')[1];
        siegeData.defender = summaryText[4].textContent!.trim().split(': ')[1];
        siegeData.pointsBalance = summaryText[5].textContent!.trim().split(': ')[1];
      }

      const killsSection = document.querySelector('#collapseKills');
      if (killsSection) {
        const killsText = killsSection.querySelectorAll('p.card-text');
        siegeData.kills.attackers = killsText[0].textContent!.trim().split(': ')[1];
        siegeData.kills.defenders = killsText[1].textContent!.trim().split(': ')[1];
        siegeData.kills.attackerKDR = killsText[2].textContent!.trim().split(': ')[1];
        siegeData.kills.defenderKDR = killsText[3].textContent!.trim().split(': ')[1];
      }

      const craftKillsSection = document.querySelector('#collapseCraftKills');
      if (craftKillsSection) {
        const craftKillsText = craftKillsSection.querySelectorAll('p.card-text');
        siegeData.craftKills.attackers = craftKillsText[0].textContent!.trim().split(': ')[1];
        siegeData.craftKills.defenders = craftKillsText[1].textContent!.trim().split(': ')[1];
        siegeData.craftKills.attackerKDR = craftKillsText[2].textContent!.trim().split(': ')[1];
        siegeData.craftKills.defenderKDR = craftKillsText[3].textContent!.trim().split(': ')[1];
      }

      const consumablesSection = document.querySelector('#collapseConsumables');
      if (consumablesSection) {
        const consumablesTable = consumablesSection.querySelector('table');
        if (consumablesTable) {
          const rows = consumablesTable.querySelectorAll('tbody tr');
          if (rows.length >= 3) {
            siegeData.consumables.pearls.attackers = rows[0].querySelector('td:nth-child(2)')?.textContent?.trim() || '';
            siegeData.consumables.pearls.defenders = rows[0].querySelector('td:nth-child(3)')?.textContent?.trim() || '';
            siegeData.consumables.pots.attackers = rows[1].querySelector('td:nth-child(2)')?.textContent?.trim() || '';
            siegeData.consumables.pots.defenders = rows[1].querySelector('td:nth-child(3)')?.textContent?.trim() || '';
            siegeData.consumables.food.attackers = rows[2].querySelector('td:nth-child(2)')?.textContent?.trim() || '';
            siegeData.consumables.food.defenders = rows[2].querySelector('td:nth-child(3)')?.textContent?.trim() || '';
          }
        }
      }

      const killtable = await this.getKillsData(uuid, townName);
      siegeData.killTable = killtable;

      return siegeData;
    } catch (error) { throw error };
  };

  private async getKillsData(siegeUUID: string, town: string): Promise<Killtable[]> {
    const killsData: any[] = [];
    let page = 1;

    while (true) {
      const response = await this.requestManager.getSiegeData(`/siege.php?siege_uuid=${siegeUUID}&town=${town}&page=${page}`);
      const dom = new JSDOM(response);
      const { document } = dom.window;

      const siegeTable = document.querySelector('table#siegeTable');

      if (siegeTable) {
        const noUsersFoundElement = siegeTable.querySelector('tbody tr td');
        //@ts-ignore
        if (noUsersFoundElement && noUsersFoundElement.textContent.trim() === 'No users found') break;

        else {
          const tbody = siegeTable.querySelector('tbody'); // Typescript thinks these will be null but it wont.
          //@ts-ignore
          const rows = tbody.querySelectorAll('tr');

          for (const row of rows) {
            const columns = row.querySelectorAll('td');
            //@ts-ignore
            const time = columns[0].textContent.trim().replace(/\([^)]+\)/, "");
            //@ts-ignore
            const victim = columns[1].textContent.trim().replace(/\([^)]+\)/, "");
            //@ts-ignore
            const victimNation = columns[1].textContent.trim().match(/\([^)]+\)/)[0].slice(1, -1);
            //@ts-ignore
            const killer = columns[2].textContent.trim().replace(/\([^)]+\)/, "");
            //@ts-ignore
            const killerNation = columns[2].textContent.trim().match(/\([^)]+\)/)[0].slice(1, -1);
            //@ts-ignore
            const battlePoints = columns[3].textContent.trim().replace(/\([^)]+\)/, "");

            killsData.push({ time: time, victim: victim, killer: killer, battlePoints: battlePoints, victimNation: victimNation, killerNation: killerNation });
            page++
          }
        }
      }
    }
    return killsData;
  };

  private async getScriptfile(siegeUUID: string, town: string): Promise<any> {
    const response = await this.requestManager.getSiegeData(`/siege.php?siege_uuid=${siegeUUID}&town=${town}`);
    const dom = new JSDOM(response);
    const { document } = dom.window;

    const scriptElements = document.querySelectorAll('script');

    const scriptContentArray: string[] = [];
    scriptElements.forEach((script: HTMLScriptElement) => {
      if (script.textContent) {
        scriptContentArray.push(script.textContent);
      }
    });

    const scriptContent = scriptContentArray.join('\n');

    const jsFilePath = 'output/file.js';
    fs.writeFileSync(jsFilePath, scriptContent);

  }

};