# Getting Started with MoGr

## 1. Installation
Install MoGr with your favorite Package Manager.

**NPM**  
```sh
$ npm i @nicky-lenaers/mogr -S
```

**NPX**  
```sh
& npx i @nicky-lenaers/mogr -S
```

**Yarn**  
```sh
$ yarn add @nicky-lenaers/mogr
```

## 2. Setup
MoGr uses a `Registry` to store information coming from `Mongoose` and `GraphQL`. To initialize MoGr, set up a registry from a `Mongoose` connection.
```js
import { createConnection } from 'mongoose';
import { Registry } from '@nicky-lenaers/mogr';

const connection = createConnection({ /*...*/ });
const registry = new Registry(connection);
```

That is all there is to it. Continue with one of the [Stories](stories/home.md).

- [Continue Projection Story](stories/projection.md)
- [Continue Population Story](stories/population.md)
- [Continue Pagination Story](stories/pagination.md)
