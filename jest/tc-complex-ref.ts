import { GraphQLList, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { Connection, Schema } from 'mongoose';
import { getSimpleModel } from './common/simple.model';
import { simpleFields } from './common/simple.type';
import { TestCase } from './tc';

interface ComplexRefTestCase extends TestCase {
  parentModelName: string;
  childModelName: string;
}

/**
 * A Complex Ref Test Case.
 *
 * @param connection        Mongoose Connection
 * @returns                 Test Case
 */
export function complexRefCase(connection: Connection): ComplexRefTestCase {

  const parentModelName = 'ComplexRefParentModel';
  const childModelName = 'ComplexRefChildModel';
  const bazModelName = 'BazModelName';

  const ComplexRefParentSchema = new Schema({
    children: {
      type: [{
        child: {
          type: Schema.Types.ObjectId,
          ref: childModelName
        },
        baz: {
          fiz: {
            type: Schema.Types.String
          },
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

  const ComplexRefChildSchema = new Schema({
    child: {
      type: Schema.Types.ObjectId,
      ref: childModelName
    },
    doo: {
      type: Schema.Types.ObjectId,
      select: true,
      ref: childModelName
    },
    bazzes: {
      type: [{
        type: Schema.Types.ObjectId,
        ref: bazModelName
      }],
      select: true
    },
    cuzzes: {
      type: [{
        type: Schema.Types.String
      }],
      select: true
    }
  });

  const BazSchema = new Schema({
    fiz: {
      type: Schema.Types.String
    }
  });

  const simpleModel = getSimpleModel(connection);
  simpleModel.discriminator(childModelName, ComplexRefChildSchema);

  const model = connection.model(parentModelName, ComplexRefParentSchema);
  connection.model(bazModelName, BazSchema);

  const response = {
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
  };

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
      ...simpleFields,
      baz: {
        type: BazType
      },
      child: {
        type: ChildType
      }
    })
  });

  const ComplexRefType: GraphQLObjectType = new GraphQLObjectType({
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

  const complexRefSchema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'ComplexRefQueries',
      fields: () => ({
        complexRef: {
          type: ComplexRefType,
          resolve: () => response
        }
      })
    })
  });

  return {
    model,
    response,
    schema: complexRefSchema,
    parentModelName,
    childModelName
  };
}
