export interface EntityBaseShape {
  id: string
}

export interface EntityViewBaseShape extends EntityBaseShape{
  data: any,
  number: number,
  version: number,
  view_created: string,
  view_updated: string
}

export interface DBExisting {
  id: number | undefined,
  number: number | undefined,
  existing: boolean
}