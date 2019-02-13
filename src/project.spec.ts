describe('project', () => {

  it('should test', () => {
    expect(true).toEqual(true);
  });

  // it('should execute a query', async () => {

  //   const spy = jest.spyOn(projectionModule, 'getProjection');

  //   const server = mockServer(schema, {
  //     String: (...args) => {

  //       const info: GraphQLResolveInfo = args[args.length - 1];
  //       const projection = registry.project(info, model.modelName);

  //       expect(projection).toEqual(fields.join(' '));

  //       return 'John Doe';
  //     }
  //   });

  //   const res = await server.query(`
  //     query testQuery {
  //       testQuery {
  //         ${fields.join(',')}
  //       }
  //     }
  //   `);

  //   expect(spy).toHaveBeenCalled();
  // });

});
