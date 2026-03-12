import React, { createContext, useContext } from "react";

interface DragContextType {
  activeDragData: DragData | null;
  overId: string | null;
  overData: unknown;
}

export const DragContext = createContext<DragContextType>({
  activeDragData: null,
  overId: null,
  overData: null,
});

export const useDragContext = () => useContext(DragContext);
