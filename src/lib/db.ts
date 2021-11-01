import { Connection, ConnectionManager, ConnectionOptions, createConnection, getConnectionManager } from "typeorm";
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { EntityViewBaseShape } from "../interfaces";
import { Queries } from "../constants";
import { keys } from "./helpers";
import get from 'lodash.get';

export class Database {
  private connectionManager: ConnectionManager;

  constructor() {
    this.connectionManager = getConnectionManager();
  }

  public async getConnection(): Promise<Connection> {
    const CONNECTION_NAME = 'redshift-lambda';
    let connection: Connection;
    if (this.connectionManager.has(CONNECTION_NAME)) {
      connection = await this.connectionManager.get(CONNECTION_NAME);
      if (!connection.isConnected) {
        connection = await connection.connect();
      }
    } else {
      const connectionOptions: ConnectionOptions = {
        type: 'postgres',
        port: 5439,
        name: CONNECTION_NAME,
        synchronize: false,
        logging: false,
        host: process.env.REDSHIFT_HOST,
        username: process.env.REDSHIFT_USERNAME,
        database: process.env.REDSHIFT_DATABASE,
        password: process.env.REDSHIFT_PASSWORD,
        namingStrategy: new SnakeNamingStrategy()
      }
      connection = await createConnection(connectionOptions);
    }
    return connection;
  }

  async tableID(tableName: string): Promise<number> {
    const connection = await this.getConnection();
    const result = await connection.query(Queries.TABLE_ID, [tableName]);
    return result.length > 0 ? Number(result[0].id) : -1;
  }

  async tableFields(tableID: number): Promise<string[]> {
    const connection = await this.getConnection();
    const result = await connection.query(Queries.TABLE_FIELDS, [tableID]);
    return result.map(el => el.name);
  }

  async createTable(tableName: string, fields: string[]) {
    const connection = await this.getConnection();
    const queryRunner = connection.createQueryRunner();
    try {
      await queryRunner.startTransaction()
      const query = Queries.CREATE_TABLE.replace(
        '{additionalFields}',
        fields.reduce((str, field) => {
          return str + `${ field } VARCHAR(MAX) NULL,\n`
        }, '')
      ).replace('{name}', tableName);
      await queryRunner.query(query);
      const id = await this.tableID(tableName);
      await queryRunner.query(Queries.ADD_TABLE_INFO, [tableName]);
      for (let i = 0; i < fields.length; i++) {
        await queryRunner.query(Queries.ADD_INFO_FIELD, [id, fields[i]]);
      }
      await queryRunner.commitTransaction()
    } catch(e) {
      console.log(e);
      await queryRunner.rollbackTransaction()
    } finally {
      await queryRunner.release();
    }
  }

  async addField(tableName, fieldName) {
    const connection = await this.getConnection();
    const id = await this.tableID(tableName);
    if (id === -1) {
      throw new Error('Table does not exists');
    }
    await connection.query(Queries.ADD_INFO_FIELD, [id, fieldName]);
    await connection.query(Queries.ADD_FIELD.replace('{tableName}', tableName).replace('{name}', fieldName));
  }

  async processEntity(entity: EntityViewBaseShape, tableName: string): Promise<void> {
    const connection = await this.getConnection();
    const tableID = await this.tableID(tableName);
    console.log(tableID, typeof tableID);
    const entityFields = keys(entity.data);
    if (tableID === -1) {
      try {
        console.log('CREATING TABLE')
        await this.createTable(tableName, keys(entity.data).map(el => '\"data.' + el + '\"'));
      } catch (e) {
        console.warn(e.message)
      }
    } else {
      console.log('TABLE EXISTS');
      const fields = await this.tableFields(tableID);
      console.log('FIELDS',fields);
      console.log('ENTITY FIELDS', entityFields)
      const newFields = entityFields.filter(key => !fields.includes('\"data.' + key + '\"'));
      if (newFields.length > 0) {
        for (let i = 0; i < newFields.length; i++) {
          try {
            await this.addField(tableName, '\"data.' + newFields[i] + '\"')
          } catch (e) {
            console.warn(e.message);
          }
        }
      }
    }
    const queryRunner = connection.createQueryRunner();
    await queryRunner.startTransaction()
    try {
      const labels = entityFields.map(el => '\"data.' + el + '\"').join(', ');
      const values = entityFields.map(el => get(entity.data, el) ? "\'" + get(entity.data, el) + "\'" : '\'NULL\'').join(', ');
      await queryRunner.query(
        Queries.INSERT_ENTITY.replace('{keys}', labels).replace('{values}', values).replace('{tableName}', tableName),
        [tableName, entity.id, entity.number, entity.version, entity.view_created, entity.view_updated || entity.view_created]
      )
      await queryRunner.commitTransaction()
    } catch (err) {
      console.log('ERROR', err.message, err);
      await queryRunner.rollbackTransaction()
    } finally {
      await queryRunner.release()
    }
  }

//   async getExisting(id: string, tableName: string): Promise<DBExisting> {
//     const connection = await this.getConnection();
//     const result = await connection.query('SELECT id, number FROM advanext WHERE id = $1 AND advanext_table = $2;', [id, tableName]);
//     return {
//       id: result[0],
//       number: result[1],
//       existing: result.length > 0
//     };
//   }
//
//   async insertEntity(data: EntityViewBaseShape, tableName: string): Promise<any> {
//     const connection = await this.getConnection();
//     const result = await connection.query(`
//     INSERT INTO advanext (id, advanext_table, number, version, view_created, view_updated, data)
// VALUES ($1, $2, $3, $4, $5, $6, $7)
//     `, [data.id, tableName, data.number, data.version, data.view_created, data.view_updated || data.view_created, JSON.stringify(data.data)]);
//     return result;
//   }
//
//   async updateEntity(data: EntityViewBaseShape, tableName: string): Promise<any> {
//     const connection = await this.getConnection();
//     const result = await connection.query(`
//     UPDATE advanext
// SET number       = $1,
//     version      = $2,
//     view_updated = $3,
//     data         = $4
// WHERE id = $5
//   AND advanext_table = $6;
//     `, [
//       data.number,
//       data.version,
//       data.view_updated || data.view_created,
//       JSON.stringify(data.data),
//       data.id,
//       tableName
//     ]);
//     return result
//   }
}