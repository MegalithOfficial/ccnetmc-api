# CCnetmc-api NPM Package

Easy to Use, fast and lightweight CCnet Minecraft server API warpper.

## Install

To Install Module run this command

```bash
npm install ccnetmc-api
```

## Features

- Lightweight an fast.
- Optimised functions.
- Easy to use.
- Supports Nations server.


## Support

For support, Open PR/Issue from github.


## Authors

- [@MegalithOffical - Main Developer](https://www.github.com/MegalithOffical)
- [@Shadowevil015 - Old Author](https://github.com/Shadowevil015)


## Usage/Examples

```javascript
// ES/Typescript
import { CCnet } from 'ccnetmc-api';

// Or CJS
const { CCnet } = require("ccnetmc-api");

const api = new CCnet();

async function App() {
  const Players = await api.player.getOnlinePlayers(true);
  console.log(Players)
};

App();
```

# Changelog

## [2.1.0] - 2025-02-22

### Added
- New test suite with separate test files for each provider
- Comprehensive caching mechanism for providers
- Enhanced parsing and data validation
- Server status provider with detailed monitoring

### Changed
- Refactored Player, Towns, Nations, Sieges providers with improved caching and type safety
- Optimized Towns provider with better performance and code cleanup
- Enhanced Nations provider with caching and performance improvements
- Updated RequestManager with robust caching and error handling
- Improved extractTownData method with better parsing and type safety


## License

[Apache 2.0](https://choosealicense.com/licenses/mit/)

## Special Thanks 
Thank to [@Shadowevil015](https://github.com/Shadowevil015) and [@Owen3H](https://github.com/Owen3H) for their inpiring Hard work.
