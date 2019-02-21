import { FieldNode, GraphQLResolveInfo, SelectionNode, SelectionSetNode } from 'graphql';
import { Connection, Document, Model, ModelPopulateOptions, SchemaType, SchemaTypeOpts } from 'mongoose';
import { PopulatableField, RegistryMap } from './common';
import { getPopulation } from './populate';
import { getProjection } from './project';

/**
 * MoGr Registry. Use the Registry to project or populate
 * your GraphQL Fields onto Mongoose Query Projection and/or Population.
 *
 * @author Nicky Lenaers
 */
export class Registry {

  private _registryMap: RegistryMap = new Map();
  private _connection: Connection;

  get registryMap() {
    return this._registryMap;
  }

  constructor(connection: Connection) {
    this._connection = connection;
  }

  /**
   * Retrieve the Field Projection.
   *
   * @param info            GraphQL Resolve Info
   * @param modelName       Model Name
   * @param root            Root Path
   * @returns               Projection String
   */
  public project(
    info: GraphQLResolveInfo,
    modelName: string,
    root: string = ''
  ): string {

    const selections = this._getSelections(info, root);
    const { fragments } = info;

    this._addToRegistry(modelName);

    return getProjection(
      selections,
      fragments,
      modelName,
      this._registryMap
    ).trim();
  }

  /**
   * Retrieve Field Population.
   *
   * @param info          GraphQL Resolve Info
   * @param resource      Resource
   * @returns             Model Populate Options
   */
  public populate(
    info: GraphQLResolveInfo,
    modelName: string,
    root: string = ''
  ): ModelPopulateOptions[] {

    const selections = this._getSelections(info, root);
    const { fragments } = info;

    this._addToRegistry(modelName);

    return getPopulation(
      selections,
      fragments,
      modelName,
      this._connection,
      this._registryMap
    );
  }

  /**
   * Add a Model to the Registry.
   *
   * @param modelName       Model Name
   * @returns               Void
   */
  private _addToRegistry(modelName: string): void {

    if (this._registryMap.has(modelName)) return;

    this._registryMap.set(
      modelName,
      this._getPopulatableFieldsByModel(this._connection.model(modelName))
    );

    const nextModelNames = new Set((
      this._registryMap.get(modelName) as PopulatableField[])
      .map(field => field.modelName)
    );

    nextModelNames
      .forEach(nextModelName => {
        if (!this._registryMap.has(nextModelName)) this._addToRegistry(nextModelName);
      });
  }

  /**
   * Get Selections.
   *
   * @param info        GraphQL Resolve Info
   * @param root        Root Path
   */
  private _getSelections(info: GraphQLResolveInfo, root: string) {

    const operationSelection: SelectionSetNode =
      (info.operation.selectionSet.selections[0] as FieldNode)
        .selectionSet as SelectionSetNode;

    return this._getSelectionsOffsetByPath(
      operationSelection,
      !!root ? root.split('.') : []
    );
  }

  /**
   * Retrieve the offset of the GraphQL Selections by
   * a given path.
   *
   * @param selectionSetNode          Root Selection Set Node
   * @param paths                     Paths
   * @returns                         List of Selection Nodes
   */
  private _getSelectionsOffsetByPath(
    selectionSetNode: SelectionSetNode,
    paths: string[]
  ): ReadonlyArray<SelectionNode> {

    const { selections } = selectionSetNode;

    if (paths.length === 0) return selections;

    const fieldNode = selections
      .filter(selection => selection.kind === 'Field' && selection.name.value === paths[0])[0] as FieldNode;

    if (!fieldNode || !fieldNode.selectionSet) return selections;

    return this._getSelectionsOffsetByPath(fieldNode.selectionSet, paths.splice(1));
  }

  /**
   * Get Populatable Fields by Mongoose Model.
   *
   * @param model       Mongoose Model
   * @returns           List of Populatable Fields
   */
  private _getPopulatableFieldsByModel(
    model: Model<Document>
  ): PopulatableField[] {

    const fields: PopulatableField[] = [];

    model
      .schema
      .eachPath((path: string, type: SchemaType) => {
        fields.push(...this._getPopulatableFields(path, type as SchemaType & SchemaTypeOpts<Document>));
      });

    return fields;
  }

  /**
   * Retrieve the Populatable Fields.
   *
   * @param path          Query Path
   * @param type          Schema Type
   * @param fields        Populatable Fields
   */
  private _getPopulatableFields(
    path: string,
    type: SchemaType & SchemaTypeOpts<Document>,
    fields: PopulatableField[] = []
  ): PopulatableField[] {

    if (type.ref && typeof type.ref === 'string') {

      if (!fields.map(field => field.path).includes(path)) {
        fields.push({
          modelName: type.ref,
          path
        });
      }

      return fields;

    } else if (type.options && type.options.ref) {

      if (!fields.map(f => f.path).includes(path)) {
        fields.push({
          modelName: type.options.ref,
          path
        });
      }

      return fields;

    } else if (type.options && type.options.type && type.options.type instanceof Array) {

      return type.options.type
        .reduce((_: PopulatableField[], nextType: SchemaType & SchemaTypeOpts<Document>) => {

          if (nextType.ref && typeof nextType.ref === 'string') {
            return this._getPopulatableFields(path, nextType, fields);
          } else {
            return Object.keys(nextType)
              .reduce((__, key) =>
                this._getPopulatableFields(`${path}.${key}`, nextType[key], fields),
                fields
              );
          }

        }, fields);

    } else {
      return fields;
    }
  }
}
