export interface PropertyMapping {
  from: string;
  to: string;
}

export interface ComponentPair {
  // To get a component key: select a variant in Figma → console → figma.currentPage.selection[0].mainComponent?.key
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
        //Buttons
        deprecatedComponentKey: "0dca1cfbf18de1993d7a33e6d22ba96b5ed51186",
        targetComponentKey: "ab394e0a39eb5f4962adb451c7e3043ef8876383",
        propertyMappings: [
          { from: "appearance", to: "appearance" },
        ],
      },
      {
        //Icon Buttons
        deprecatedComponentKey: "a5df3055c2586b7008d9e9136fc259da623dc409",
        targetComponentKey: "de9df53fe09037810ef10f70a57958db9c4e6a84",
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
