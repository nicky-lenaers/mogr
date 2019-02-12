/** Populatable Field */
export interface PopulatableField {
  path: string;
  modelName: string;
}

/** Registry Map */
export type RegistryMap = Map<string, PopulatableField[]>;
