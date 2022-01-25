# Venge-io.js
A lightweight Node.js module for Venge.io private api 🔫

## Table Of Contents
  - [Installation](#installation)
  - [Example](#example)

## Installation

```sh
    npm install venge-io.js
```

## Example

```javascript
    const { Venge } = require('venge-io.js');

    const venge = new Venge('USERNAME', 'PASSWORD');

    (async () => {
        await venge.login();

        venge.getStatus()
        .then(data => {
            console.log(`There are ${data.online} players online`);
        });


        setTimeout(() => {
            venge.logout();
            process.exit();
        }, 3500);
    })();
```