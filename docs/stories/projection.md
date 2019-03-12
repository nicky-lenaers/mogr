# MoGr Projection

🚀 [MoGr Projection Demo (Work in Progress)](https://repl.it/@nicky_lenaers/mogr-projection)

## 1. Prerequisites
In order to use MoGr Projection, you need three pieces in place up front.
1. [MoGr Registry](getting-started.md#_2-setup)
2. [Mongoose Model](https://mongoosejs.com/docs/models.html)  
3. [GraphQL Query](https://graphql.org/learn/queries/)

## 2. Usage
Once you have set up the prerequisites, you can use the [MoGr Registry](getting-started.md#_2-setup) to generate a Mongoose Projection from the GraphQL Resolve Info. You then use the Projection on your Mongoose Query.

**1. Import MoGr Registry**  
```js
import { registry } from './registry';
```
**2. Import Mongoose Model**  
```js
import { model } from './model';
```

**3. Combine the MoGr Registry, Mongoose Model and GraphQL Query to perform MoGr Projection**

```js
import { registry } from './registry';
import { model } from './model';
import { ExampleType } from './types/example';

/** GraphQL Query */
const gqlQuery = {
  type: ExampleType,
  resolve: async (root, args, ctx, info) => {
    
    const projection = registry.project(info, model.modelName);
    const result = await model.find().select(projection).exec();

    return result;
  }
}
```

## Demo
See the 🚀 [MoGr Projection Demo (Work in Progress)](https://repl.it/@nicky_lenaers/mogr-projection) for more example usage.
