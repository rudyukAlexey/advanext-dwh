import { VIEW_ID_PREFIX } from '../constants';
import { EntityBaseShape } from "../interfaces";

export const isValidId = (entity: EntityBaseShape) => {
  const { id } = entity;
  return id && id.startsWith(VIEW_ID_PREFIX);
}

export const keys = (obj: any, stack = '') => {
  const oKeys = Object.keys(obj);
  return oKeys.reduce((result: string[], key) => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      return [...result, ...keys(obj[key], `${ stack ? stack + '.' + key : key }`)]
    } else {
      return [...result, stack ? stack + '.' + key : key];
    }
  }, [])
};