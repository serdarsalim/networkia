export type CircleSetting = {
  id: string;
  name: string;
  isActive: boolean;
};

export const getDefaultCircleSettings = (): CircleSetting[] => [
  { id: "circle-1", name: "Family", isActive: true },
  { id: "circle-2", name: "Friend", isActive: true },
  { id: "circle-3", name: "Relative", isActive: true },
  { id: "circle-4", name: "Work", isActive: true },
  { id: "circle-5", name: "Acquaintance", isActive: true },
  { id: "circle-6", name: "", isActive: false },
  { id: "circle-7", name: "", isActive: false },
  { id: "circle-8", name: "", isActive: false },
  { id: "circle-9", name: "", isActive: false },
  { id: "circle-10", name: "", isActive: false },
];
