import { Types } from 'mongoose';
import { base64Decode, base64Encode, escapeRegExp, fieldKey, isNumber, isNumericString, isString } from './utils';

describe('utils', () => {

  describe('escapeRegExp', () => {
    it('should escape regular expressions', () => {
      const regExp = new RegExp('ab+c');
      expect(escapeRegExp('')).toEqual('');
      expect(escapeRegExp(regExp.toString())).toEqual('/ab\\+c/');
    });
  });

  describe('fieldKey', () => {
    it('should retrieve a field key', () => {
      expect(fieldKey('prop')).toEqual('prop');
      expect(fieldKey('id')).toEqual('_id');
    });
  });

  describe('base64Encode', () => {
    it('should encode a Mongoose Object ID as base64', () => {
      const objectId = Types.ObjectId();
      const encoded = base64Encode(objectId.toHexString());
      expect(base64Decode(encoded)).toEqual(objectId.toHexString());
    });
  });

  describe('base64Decode', () => {
    it('should decode a base64 encoded cursor', () => {
      const value = '10';
      const encoded = base64Encode(value);
      const decoded = base64Decode(encoded);
      expect(decoded).toEqual(value);
    });
  });

  describe('isNumericString', () => {
    it('should recognize strings containing only numeric values', () => {
      expect(isNumericString('10')).toBe(true);
      expect(isNumericString('abc')).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('should recognize a number', () => {
      expect(isNumber(5)).toBe(true);
      expect(isNumber('abc')).toBe(false);
      expect(isNumber({ key: 'abc' })).toBe(false);
      expect(isNumber([])).toBe(false);
      expect(isNumber(() => { })).toBe(false);
    });
  });

  describe('isString', () => {
    it('should recognize a string', () => {
      expect(isString('abc')).toBe(true);
      expect(isString(10)).toBe(false);
      expect(isString({ key: 'abc' })).toBe(false);
      expect(isString([])).toBe(false);
      expect(isString(() => { })).toBe(false);
    });
  });
});
