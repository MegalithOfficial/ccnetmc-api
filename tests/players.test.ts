import { CCnet } from "../dist/main";
import { assert } from 'console';

class PlayersTestSuite {
  private ccnet: CCnet;
  private testResults: { passed: number; failed: number; };

  constructor() {
    this.ccnet = new CCnet();
    this.testResults = { passed: 0, failed: 0 };
  }

  private async runTest(name: string, testFn: () => Promise<void>) {
    try {
      console.log(`\nRunning test: ${name}`);
      await testFn();
      console.log(`✅ ${name} passed`);
      this.testResults.passed++;
    } catch (error) {
      console.error(`❌ ${name} failed:`, error);
      this.testResults.failed++;
    }
  }

  async runTests() {
    console.log('Starting Players Tests...\n');
    const startTime = Date.now();

    await this.runTest('Online Players', async () => {
      const players = await this.ccnet.player.getOnlinePlayers();
      assert(Array.isArray(players), 'Should return array');
      if (players.length > 0) {
        const player = players[0];
        assert(typeof player.name === 'string', 'Should have name');
        assert(typeof player.nickname === 'string', 'Should have nickname');
        assert(typeof player.rank === 'string', 'Should have rank');
      }
    });

    await this.runTest('Player Cache', async () => {
      console.log('Testing cache performance:');
      const start = performance.now();
      const players1 = await this.ccnet.player.getAllPlayers();
      console.log(players1);
      const time1 = performance.now() - start;
      console.log(`→ Initial request: ${time1.toFixed(2)}ms`);

      const start2 = performance.now();
      const players2 = await this.ccnet.player.getAllPlayers();
      const time2 = performance.now() - start2;
      console.log(`→ Cached request: ${time2.toFixed(2)}ms`);
    });

    await this.runTest('Player Data Processing', async () => {
      const allPlayers = await this.ccnet.player.getAllPlayers();
      console.log('\nPlayer Statistics:');
      console.log(`→ Total players: ${allPlayers.length}`);
      console.log(`→ Online players: ${allPlayers.filter(p => p.online).length}`);
      console.log(`→ Unique ranks: ${new Set(allPlayers.map(p => p.rank)).size}`);
    });

    const endTime = Date.now();
    console.log(`\nPlayers Test Results:
    ✅ Passed: ${this.testResults.passed}
    ❌ Failed: ${this.testResults.failed}
    ⏱️ Time: ${(endTime - startTime) / 1000}s`);
  }
}

// Run tests
const testSuite = new PlayersTestSuite();
testSuite.runTests().catch(console.error); 