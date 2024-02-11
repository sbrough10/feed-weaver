import React from "react";

export interface PageConfig {
  offset: number;
  size: number;
  limit: number;
}

export interface VirtualizedListProps<Item> {
  pageConfig: PageConfig;
  itemList: Item[];
  getPage: (offset: number) => void;
  getItem: (item: Item) => React.ReactNode;
}

// export const VirtualizedList: React.FC<VirtualizedListProps<Item>> = ({
//   pageConfig,
//   getPage,
//   getItem,
// }) => {
//   return <></>;
// };
