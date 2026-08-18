import { BarChart3, LayoutList, Settings2 } from "lucide-react";
import type { ReactNode } from "react";

export type NavigationLeafItem = {
  key: string;
  label: string;
  path: string;
  icon: ReactNode;
};

export type NavigationGroupItem = {
  key: string;
  label: string;
  icon: ReactNode;
  children: NavigationItem[];
};

export type NavigationItem = NavigationLeafItem | NavigationGroupItem;

export const navigationItems: NavigationItem[] = [
  {
    key: "master-data",
    label: "主数据配置",
    path: "/master-data",
    icon: <Settings2 size={18} />,
  },
  {
    key: "class-hour-record",
    label: "课时记录",
    path: "/class-hour-record",
    icon: <LayoutList size={18} />,
  },
  {
    key: "analysis",
    label: "数据分析",
    path: "/analysis",
    icon: <BarChart3 size={18} />,
  },
];

export function isNavigationGroupItem(item: NavigationItem): item is NavigationGroupItem {
  return "children" in item;
}

export function flattenNavigationItems(items = navigationItems): NavigationLeafItem[] {
  return items.flatMap((item) =>
    isNavigationGroupItem(item) ? flattenNavigationItems(item.children) : [item],
  );
}

