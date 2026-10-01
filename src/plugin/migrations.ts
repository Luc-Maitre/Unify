export interface PropertyMapping {
  from: string;
  to: string;
}

export interface ComponentPair {
  deprecatedComponentKey: string;
  targetComponentKey: string;
  propertyMappings: PropertyMapping[];
}

export interface Migration {
  id: string;
  label: string;
  disabled?: boolean;
  pairs: ComponentPair[];
}

export const MIGRATIONS: Migration[] = [
  {
    id: "deprecated-button",
    label: "Buttons & Icon Buttons",
    pairs: [
      {
        deprecatedComponentKey: "c00de0b4c9558e33c5ad3315c178c6b55f51a6fd",
        targetComponentKey: "e2ba27ee66d299be37e2dc9dbe5cb3e0f732782c",
        propertyMappings: [
          { from: "appearance", to: "appearance" },
        ],
      },
      {
        deprecatedComponentKey: "4ae3b2470da9bc0e927ccc9c3559a01990d36611",
        targetComponentKey: "fc6cbd2625275ce36ab57d506440f7cf944bce6e",
        propertyMappings: [
          { from: "appearance", to: "appearance" },
        ],
      },
    ],
  },
  {
    id: "deprecated-tag",
    label: "Tags",
    disabled: true,
    pairs: [],
  },
  {
    id: "deprecated-chips",
    label: "Chips",
    disabled: true,
    pairs: [],
  },
];
