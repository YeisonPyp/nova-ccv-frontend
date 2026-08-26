/** Level an area occupies in the organizational chart. */
export type AreaType =
  | 'GOVERNANCE'
  | 'PRESIDENCY'
  | 'DIRECTORATE'
  | 'COORDINATION'
  | 'OFFICE';

export const AREA_TYPE_LABELS: Record<AreaType, string> = {
  GOVERNANCE: 'Gobierno corporativo',
  PRESIDENCY: 'Presidencia',
  DIRECTORATE: 'Dirección',
  COORDINATION: 'Coordinación',
  OFFICE: 'Oficina / Sede',
};

export interface Area {
  id: number;
  name: string;
  /**
   * Optional because a few call sites seed a search-select from just an
   * id+name pair; responses from the API always carry it.
   */
  type?: AreaType;
  parentId?: number | null;
  parentName?: string | null;
}

/** One node of the organizational chart, with its descendants nested. */
export interface AreaTreeNode {
  id: number;
  name: string;
  type: AreaType;
  parentId?: number | null;
  children: AreaTreeNode[];
}
