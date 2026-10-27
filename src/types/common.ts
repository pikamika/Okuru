/** UUID string. */
export type Id = string
/** ISO 8601 string. Occasion dates use the date-only form `YYYY-MM-DD`. */
export type IsoDate = string

export interface Entity {
  id: Id
  createdAt: IsoDate
  updatedAt: IsoDate
}

/** Fields a caller supplies when creating an entity. */
export type NewEntity<T extends Entity> = Omit<T, keyof Entity>
