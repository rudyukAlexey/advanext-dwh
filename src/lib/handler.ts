import { EntityViewBaseShape } from "../interfaces";
import { Database } from "./db";
import { isValidId } from "./helpers";

export const upsertEntity = async (entity: EntityViewBaseShape, entityType: string) => {
  if (!isValidId(entity)) return;
  await upsert(entity, entityType);
}

export const upsert = async (entity: EntityViewBaseShape, entityType: string) => {
  const database = new Database();
  await database.processEntity(entity, entityType);
  // const existingEntity = await database.getExisting(entity.id, entityType);
  // if (!existingEntity.existing) {
  //   await database.insertEntity(entity, entityType);
  // } else if (existingEntity.number && existingEntity.number < entity.number) {
  //   await database.updateEntity(entity, entityType);
  // }
}

