# Venge-io.js
A lightweight Node.js module for Venge.io private api 🔫

## Warning ⚠
venge.io devs recently changed their login mechanism and now it also requires the grecaptcha token.
Therefore, I suggest logging in via hash.

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

    const venge = new Venge('USERNAME', 'PASSWORD', 'GRECHAPTA_TOKEN');
    // Constructor variables are optional.

    (async () => {
        await venge.login('USERNAME', 'PASSWORD', 'GRECHAPTA_TOKEN');
        // Variables are optional if already specified in constructor.

        // or you can login via hash
        venge.setHash('HASH');

        venge.getStatus()
        .then(data => {
            console.log(`There are ${data.online} players online`);
        });

        const balance = await venge.getCoinDetails();
        console.log(`Your balance is ${balance.balance}`);

        setTimeout(() => {
            venge.logout();
            process.exit();
        }, 3500);
    })();
```