# CCnetmc-api NPM Package

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

## Install

To Install Module run this command

```bash
npm install ccnetmc-api
```
or
```bash
npm install https://github.com/MegalithOffical/ccnetmc-api
```


## Features

- Lightweight an fast.
- Optimised functions.
- Easy to use.
- Supports Both server (Nations and Towny)


## Support

For support, Open PR/Issue from github.


## Authors

- [@MegalithOffical - Main Developer](https://www.github.com/MegalithOffical)
- [@Shadowevil015 - Old Author](https://github.com/Shadowevil015)



## Documentation

[Click to go Docs](https://linktodocumentation)


## Usage/Examples

```javascript
import { CCnet } from 'ccnetmc-api';

const api = new CCnet();

async function App() {
  const Players = await api.player.getOnlinePlayers(true, { server: "Nations" });
  console.log(Players)
};

App();
```


## License

[MIT](https://choosealicense.com/licenses/mit/)

## Credits 
Thank to [@Shadowevil015](https://github.com/Shadowevil015) and [@Owen3H](https://github.com/Owen3H)  for their Hard work.

