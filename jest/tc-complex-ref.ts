import { GraphQLFieldConfig, GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { Connection, Schema } from 'mongoose';
import { TestCase } from './tc';

interface ComplexRefTestCase extends TestCase {
  parentModelName: string;
  childModelName: string;
}

const parentModelName = 'ComplexRefParentModel';
const childModelName = 'ComplexRefChildModel';
const bazModelName = 'BazModelName';

export const ComplexRefParentSchema = new Schema({
  children: {
    type: [{
      child: {
        type: Schema.Types.ObjectId,
        ref: childModelName
      },
      baz: {
        fiz: {
          type: Schema.Types.String
        }
      }
    }]
  },
  bazzes: {
    type: [{
      type: Schema.Types.ObjectId,
      ref: bazModelName
    }]
  }
});

export const ComplexRefChildSchema = new Schema({
  foo: {
    type: Schema.Types.String
  },
  bar: {
    type: Schema.Types.String
  },
  child: {
    type: Schema.Types.ObjectId,
    ref: childModelName
  }
});

export const BazSchema = new Schema({
  fiz: {
    type: Schema.Types.String
  }
});

export const complexRefResponse = {
  children: [{
    child: {
      foo: 'Foo',
      bar: 'Bar',
      child: {
        foo: 'Foo',
        bar: 'Bar'
      }
    },
    baz: {
      fiz: 'Fiz'
    }
  }],
  bazzes: [
    { fiz: 'Fiz' },
    { fiz: 'Fiz' }
  ]
}

const BazType = new GraphQLObjectType({
  name: 'BazType',
  fields: () => ({
    fiz: {
      type: GraphQLString
    }
  })
});

const ChildType = new GraphQLObjectType({
  name: 'ChildType',
  fields: () => ({
    foo: {
      type: GraphQLString
    },
    bar: {
      type: GraphQLString
    },
    baz: {
      type: BazType
    },
    child: {
      type: ChildType
    }
  })
});

export const ComplexRefType: GraphQLObjectType = new GraphQLObjectType({
  name: 'ComplexRefType',
  fields: () => ({
    children: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: 'ParentType',
          fields: () => ({
            child: {
              type: ChildType
            },
            baz: {
              type: BazType
            }
          })
        })
      )
    },
    bazzes: {
      type: new GraphQLList(BazType)
    }
  })
});

export const complexRef: GraphQLFieldConfig<object, any> = {
  type: ComplexRefType,
  resolve: () => complexRefResponse
}

export const complexRefSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'ComplexRefQueries',
    fields: () => ({
      complexRef
    })
  })
});

/**
 * A Complex Ref Test Case.
 *
 * @param connection        Mongoose Connection
 * @returns                 Test Case
 */
export function complexRefCase(connection: Connection): ComplexRefTestCase {

  const parentModel = connection.model(
    parentModelName,
    ComplexRefParentSchema,
    'complex-ref'
  );

  connection.model(
    bazModelName,
    BazSchema,
    'complex-ref'
  );

  connection.model(
    childModelName,
    ComplexRefChildSchema,
    'complex-ref'
  );

  return {
    model: parentModel,
    response: complexRefResponse,
    schema: complexRefSchema,
    parentModelName,
    childModelName
  };
}
