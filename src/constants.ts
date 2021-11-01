export const VIEW_ID_PREFIX = 'VIEW|';

export const EntityType = {
  LOAN: ['loan', 'loans'],
}

export enum Queries {
  TABLE_ID = 'SELECT id FROM advanext_table_info WHERE table_name = $1',
  TABLE_FIELDS = 'SELECT name FROM advanext_field WHERE table_id = $1',
  CREATE_TABLE = `CREATE TABLE {name} 
    (
        id CHARACTER VARYING NOT NULL,
        number INTEGER NOT NULL,
        version INTEGER NOT NULL,
        view_created TIMESTAMP WITH TIME ZONE NOT NULL,
        view_updated TIMESTAMP WITH TIME ZONE NOT NULL,
        {additionalFields}
        PRIMARY KEY (id)      
    )`,
  ADD_FIELD = `ALTER TABLE {tableName} 
    ADD COLUMN {name} VARCHAR(MAX) NULL
    DEFAULT NULL
    `,
  INSERT_ENTITY = `INSERT INTO {tableName} (id, number, version, view_created, view_updated, {keys}) VALUES ($2, $3, $4, $5, $6, {values})`,
  ADD_TABLE_INFO = `INSERT INTO advanext_table_info (table_name) VALUES ($1)`,
  ADD_INFO_FIELD = `INSERT INTO advanext_field (table_id, name) VALUES ($1, $2)`
}