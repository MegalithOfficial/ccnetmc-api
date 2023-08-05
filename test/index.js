import { CCnet } from "../main.js";
import Benchmark from 'hyprbench';

const api = new CCnet();

const benchmark = new Benchmark();

(async () => {
  benchmark.on('cyclone', (data) => console.log(data));
  benchmark.on('complete', (data) => console.log(data));
  
  benchmark.set('speedtest', async () => await api.towns.getAllTowns());
  
  benchmark.run(10);
})();