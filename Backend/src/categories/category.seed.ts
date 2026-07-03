/** Default tree: Hoodie group + standalone roots (add more roots in code as needed). */
export const DEFAULT_CATEGORY_TREE = [
  {
    name: 'Hoodie',
    sortOrder: 1,
    children: [
      { name: 'Zip-up', sortOrder: 1 },
      { name: 'Non Zip', sortOrder: 2 },
      { name: 'Limited Edition', sortOrder: 3 },
    ],
  },
  /** Placeholder root for the upcoming motorbike parts/accessories line — ready before any products exist. */
  {
    name: 'Motor Parts & Accessories',
    sortOrder: 2,
    children: [
      { name: 'Modified Parts', sortOrder: 1 },
      { name: 'Riding Accessories', sortOrder: 2 },
    ],
  },
] as const;
