import React, { createContext, useContext } from "react";

import { DragData } from "./types";

interface DragContextType {
  activeDragData: DragData | null;
  overId: string | null;
  overData: DragData;
}

export const DragContext = createContext<DragContextType>({
  activeDragData: null,
  overId: null,
  overData: {} as DragData
});

export const useDragContext = () => useContext(DragContext);
