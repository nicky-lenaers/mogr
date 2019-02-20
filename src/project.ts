import { FragmentDefinitionNode, SelectionNode } from 'graphql';
import { PopulatableField, RegistryMap } from './common';

/**
 * Recursively retrieve the Projection by utilizing
 * the GraphQL Query Selection. Handling Inline Fragments
 * and Fragment Spreads is also supported.
 *
 * @author Nicky Lenaers
 *
 * @param selections          GraphQL List of Selection Nodes
 * @param fragments           GraphQL Fragments
 * @param modelName           Model Name
 * @param registryMap         MoGr Registry Map
 * @param tree                Tree
 * @returns                   Projection String
 */
export function getProjection(
  selections: ReadonlyArray<SelectionNode>,
  fragments: { [fragmentName: string]: FragmentDefinitionNode },
  modelName: string,
  registryMap: RegistryMap,
  tree: string[] = []
): string {

  return selections
    .reduce((projection, selection) => {

      switch (selection.kind) {

        case 'Field':

          const value = selection.name.value;
          if (value === '__typename') return projection;

          const populatableFields = registryMap.get(modelName) as PopulatableField[];

          if (selection.selectionSet && selection.selectionSet.selections) {

            const populatableField = populatableFields
              .find(field => field.path === (tree.length
                ? `${tree.join('.')}.${value}`
                : `${value}`)
              );

            if (!populatableField) {

              projection += getProjection(
                selection.selectionSet.selections,
                fragments,
                modelName,
                registryMap,
                [...tree, value]
              );

            } else {

              projection += tree.length
                ? ` ${tree.join('.')}.${value}`
                : ` ${value}`;
            }

          } else {
            projection += tree.length
              ? ` ${tree.join('.')}.${value}`
              : ` ${value}`;
          }

          return projection;

        case 'InlineFragment':

          return projection += getProjection(
            selection.selectionSet.selections,
            fragments,
            modelName,
            registryMap,
            tree
          );

        case 'FragmentSpread':

          const fragment = fragments[selection.name.value];

          return projection += getProjection(
            fragment.selectionSet.selections,
            fragments,
            modelName,
            registryMap,
            tree
          );
      }
    }, '');
}
