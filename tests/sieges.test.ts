import { CCnet } from "../dist/main";
import { assert } from 'console';

class SiegesTestSuite {
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
    console.log('Starting Sieges Tests...\n');
    const startTime = Date.now();

    await this.runTest('Active Sieges', async () => {
      const sieges = await this.ccnet.sieges.getAllSieges();
      assert(Array.isArray(sieges), 'Should return array');
      if (sieges.length > 0) {
        const siege = sieges[0];
        assert(typeof siege.attacker === 'string', 'Should have attacker');
        assert(typeof siege.defender === 'string', 'Should have defender');
        assert(typeof siege.town === 'string', 'Should have town');
        assert(typeof siege.points.attacker === 'number', 'Should have attacker points');
        assert(typeof siege.points.defender === 'number', 'Should have defender points');
      }
    });

    await this.runTest('Siege Regions', async () => {
      const regions = await this.ccnet.sieges.getAllSiegeRegions();
      assert(Array.isArray(regions), 'Should return array');
      if (regions.length > 0) {
        const region = regions[0];
        assert(typeof region.name === 'string', 'Should have name');
        assert(typeof region.controlledBy === 'string', 'Should have controlling nation');
        assert(Array.isArray(region.timeWindows), 'Should have time windows array');
        assert(typeof region.corners === 'object', 'Should have corners object');
      }

      console.log('\nSiege Region Statistics:');
      console.log(`→ Total regions: ${regions.length}`);
      console.log(`→ Regions by controller:`, 
        regions.reduce((acc, r) => {
          acc[r.controlledBy] = (acc[r.controlledBy] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      );
    });

    await this.runTest('Cache Performance', async () => {
      console.log('Testing cache performance:');
      const start = performance.now();
      const regions1 = await this.ccnet.sieges.getAllSiegeRegions();
      const time1 = performance.now() - start;
      console.log(`→ Initial request: ${time1.toFixed(2)}ms`);

      const start2 = performance.now();
      const regions2 = await this.ccnet.sieges.getAllSiegeRegions();
      const time2 = performance.now() - start2;
      console.log(`→ Cached request: ${time2.toFixed(2)}ms`);
    });

    const endTime = Date.now();
    console.log(`\nSieges Test Results:
    ✅ Passed: ${this.testResults.passed}
    ❌ Failed: ${this.testResults.failed}
    ⏱️ Time: ${(endTime - startTime) / 1000}s`);
  }
}

// Run tests
const testSuite = new SiegesTestSuite();
testSuite.runTests().catch(console.error); 