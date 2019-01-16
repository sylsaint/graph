import isEqual from 'lodash/isEqual';
import { getTypeLower } from './utils';
import { MetaSchemaJson } from './metaschema';
class MetaSchema {
  private json: object = MetaSchemaJson;
  constructor() {

  }

}

// Basic types
const ARRAY: string = 'array';
const STRING: string = 'string';
const NULL: string = 'null';
const OBJECT: string = 'object';
const BOOLEAN: string = 'boolean';
const UNDEFINED: string = 'undefined';
const NUMBER: string = 'number';

// JSON Schema is a JSON media type for defining the structure of JSON data. 
// JSON Schema is intended to define validation, documentation, hyperlink navigation, and interaction control of JSON data.
class JsonSchema {

  constructor() {

  }
  validateType(val: any, typ: string): boolean {
    return getTypeLower(val) === typ;
  }
  validateEnum(enumList: any): boolean {
    if (!this.validateType(enumList, ARRAY)) return false;
    if (enumList.length < 1) return false;
    let enumMap: object = {};
    for (let i: number = 0; i < enumList.length; i++) {
      if (!enumMap[enumList[i]]) enumMap[enumList[i]] = true;
      if (enumMap[enumList[i]]) return false;
    }
    return true;
  }
  validateConst(v: any): boolean {

  }
  validate(form: object): boolean {
    return true;
  }
}

class NumberValidator {
  KEYWORDS = [
    'multipleOf',
    'maximum',
    'exclusiveMaximum',
    'minimum',
    'exclusiveMinimum'
  ];
  constructor() {

  }
  multipleOf(n: number, divider: number): boolean {
    if (divider <= 0) return false;
    if (Math.floor(n / divider) !== Math.ceil(n / divider)) return false;
    return true;
  }
  maximum(n: number, max: number): boolean {
    return n < max || n === max;
  }
  exclusiveMaximum(n: number, max: number): boolean {
    return n < max;
  }
  minimum(n: number, min: number): boolean {
    return n > min || n === min;
  }
  exclusiveMinimum(n: number, min: number): boolean {
    return n > min;
  }
}

class StringValidator {
  KEYWORDS = [
    'maxLength',
    'minLength',
    'pattern'
  ]
  constructor() {

  }
  maxLength(s: string, max: number): boolean {
    return s.length <= max;
  }
  minLength(s: string, min: number): boolean {
    return s.length >= min;
  }
  pattern(s: string, pt: string): boolean {
    return new RegExp(pt).test(s);
  }
}

class ArrayValidator {
  KEYWORDS = [
    'items',
    'additionalItems',
    'maxItems',
    'minItems',
    'uniqueItems',
    'contains'
  ]
  constructor() {

  }
  items(items: any): boolean {
    if (getTypeLower(items) === 'array') {

    }
    if (getTypeLower(items) === 'object') {

    }
    return true;
  }
  additionalItems(): boolean {

  }
  maxItems(items: Array<any>, max: number): boolean {
    if (max < 0 || parseInt(max.toString()) !== max) return false;
    return items.length <= max;
  }
  minItems(items: Array<any>, min: number): boolean {
    if (min < 0 || parseInt(min.toString()) !== min) return false;
    return items.length >= min;
  }
  uniqueItems(uniq: boolean, items: Array<any>): boolean {
    if (!uniq) return true;
    let isUniq: boolean = true;
    for (let i: number = 0; i < items.length - 1; i++) {
      for (let j: number = i + 1; j < items.length; j++) {
        if (isEqual(items[i], items[j])) {
          isUniq = false;
          break;
        }
      }
      if (!isUniq) break;
    }
    return isUniq;
  }
  contains(cmp: any, items: Array<any>): boolean {
    let contained: boolean = false;
    for (let i: number = 0; i < items.length; i++) {
      if (isEqual(cmp, items[i])) {
        contained = true;
        break;
      }
    }
    return contained;
  }
}

class ObjectValidator {
  KEYWORDS = [
    'maxProperties',
    'minProperties',
    'required',
    'properties',
    'patternProperties',
    'additionalProperties',
    'dependencies',
    'propertyNames'
  ]
}