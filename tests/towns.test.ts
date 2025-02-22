import { CCnet } from "../dist/main";
import { assert } from 'console';

class TownsTestSuite {
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
    console.log('Starting Towns Tests...\n');
    const startTime = Date.now();

    await this.runTest('Town Data Processing', async () => {
      const town = await this.ccnet.towns.getTown("Thunderhold");
      if (!town) throw new Error('Town data is null');
      
      assert(Number.isInteger(town.x), 'X coordinate should be an integer');
      assert(Number.isInteger(town.z), 'Z coordinate should be an integer');
      assert(town.area > 0, 'Area should be positive');
    });

    await this.runTest('Town Collection', async () => {
      const allTowns = await this.ccnet.towns.getAllTowns();
      assert(Array.isArray(allTowns), 'Should return array');
      assert(allTowns.length > 0, 'Should have towns');

      console.log('\nTown Statistics:');
      console.log(`→ Total towns: ${allTowns.length}`);
      console.log(`→ Total residents: ${allTowns.reduce((sum, t) => sum + t.residents.length, 0)}`);
    });

    await this.runTest('Town Cache Performance', async () => {
      console.log('Testing cache performance:');
      const start = performance.now();
      const towns1 = await this.ccnet.towns.getAllTowns();
      const time1 = performance.now() - start;
      console.log(`→ Initial request: ${time1.toFixed(2)}ms`);

      const start2 = performance.now();
      const towns2 = await this.ccnet.towns.getAllTowns();
      const time2 = performance.now() - start2;
      console.log(`→ Cached request: ${time2.toFixed(2)}ms`);
    });

    const endTime = Date.now();
    console.log(`\nTowns Test Results:
    ✅ Passed: ${this.testResults.passed}
    ❌ Failed: ${this.testResults.failed}
    ⏱️ Time: ${(endTime - startTime) / 1000}s`);
  }
}

// Run tests
const testSuite = new TownsTestSuite();
testSuite.runTests().catch(console.error); 