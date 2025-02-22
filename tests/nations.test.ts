import { CCnet } from "../dist/main";
import { assert } from 'console';

class NationsTestSuite {
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
    console.log('Starting Nations Tests...\n');
    const startTime = Date.now();

    await this.runTest('Basic Nation Data', async () => {
      const allNations = await this.ccnet.nations.getAllNations();
      assert(Array.isArray(allNations), 'getAllNations should return an array');
      assert(allNations.length > 0, 'Should have at least one nation');
    });

    await this.runTest('Nation Properties', async () => {
      const allNations = await this.ccnet.nations.getAllNations();
      const nation = allNations[0];
      assert(typeof nation.name === 'string', 'Should have name');
      assert(Array.isArray(nation.residents), 'Should have residents array');
      assert(Array.isArray(nation.towns), 'Should have towns array');
      assert(typeof nation.king === 'string', 'Should have king');
    });

    await this.runTest('Nation Cache Performance', async () => {
      console.log('Testing cache with continuous requests:');
      const start = performance.now();
      const nations1 = await this.ccnet.nations.getAllNations();
      const time1 = performance.now() - start;
      console.log(`→ Initial request: ${time1.toFixed(2)}ms`);

      const start2 = performance.now();
      const nations2 = await this.ccnet.nations.getAllNations();
      const time2 = performance.now() - start2;
      console.log(`→ Cached request: ${time2.toFixed(2)}ms`);
    });

    const endTime = Date.now();
    console.log(`\nNations Test Results:
    ✅ Passed: ${this.testResults.passed}
    ❌ Failed: ${this.testResults.failed}
    ⏱️ Time: ${(endTime - startTime) / 1000}s`);
  }
}

// Run tests
const testSuite = new NationsTestSuite();
testSuite.runTests().catch(console.error); 