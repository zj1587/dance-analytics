export type ProductMenuDoc = {
  menu: string;
  route: string;
  documentPath: string;
  relatedDocumentPaths?: string[];
  status: "已建立" | "持续迭代";
  updatedAt: string;
};

export const productMenuDocs: ProductMenuDoc[] = [
  {
    menu: "主数据配置",
    route: "/master-data",
    documentPath: "docs/product/master-data.md",
    relatedDocumentPaths: [
      "docs/product/home.md",
      "docs/product/class-hour-record.md",
      "docs/product/analysis.md",
    ],
    status: "已建立",
    updatedAt: "2026-08-18",
  },
  {
    menu: "课时记录",
    route: "/class-hour-record",
    documentPath: "docs/product/class-hour-record.md",
    relatedDocumentPaths: [
      "docs/product/home.md",
      "docs/product/master-data.md",
      "docs/product/analysis.md",
    ],
    status: "已建立",
    updatedAt: "2026-08-18",
  },
  {
    menu: "数据分析",
    route: "/analysis",
    documentPath: "docs/product/analysis.md",
    relatedDocumentPaths: [
      "docs/product/home.md",
      "docs/product/master-data.md",
      "docs/product/class-hour-record.md",
    ],
    status: "已建立",
    updatedAt: "2026-08-18",
  },
];

