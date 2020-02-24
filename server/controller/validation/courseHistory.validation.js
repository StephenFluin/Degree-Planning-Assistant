import { param, query, body } from 'express-validator';

import {
  USER_ID_IS_REQUIRED,
  USER_ID_IS_EMPTY,
  USER_ID_IS_INVALID,
} from '../constant';

export const validateHistoryObjStructure = (arr, byCourseName) => {
  if (!arr || arr.constructor !== Array || arr.length === 0) {
    return false;
  }

  let checkerFunction;

  if (byCourseName && byCourseName === true) {
    const isCourseName = str => {
      if (!str || str.constructor !== String || str.length === 0) {
        return false;
      }

      const regExp = /[^\w\d]/;
      if (regExp.test(str) === true) {
        return false;
      }

      return true;
    };
    checkerFunction = isCourseName;
  } else {
    const isObjectId = str => {
      if (!str || str.constructor !== String || str.length != 24) {
        return false;
      }

      const regExp = /[^a-fA-F0-9]/;
      if (regExp.test(str) === true) {
        return false;
      }

      return true;
    };
    checkerFunction = isObjectId;
  }

  return arr.every(checkerFunction);
};

export const validateFetchHistory = [
  param('userId')
    .exists()
    .withMessage(USER_ID_IS_REQUIRED)
    .bail()
    .not()
    .isEmpty()
    .withMessage(USER_ID_IS_EMPTY)
    .bail()
    .escape()
    .ltrim()
    .rtrim()
    .isLength({ min: 24, max: 24 })
    .withMessage(USER_ID_IS_INVALID)
    .bail()
    .isHexadecimal()
    .withMessage(USER_ID_IS_INVALID),
  query('idOnly')
    .if(query('idOnly').exists())
    .not()
    .isEmpty()
    .withMessage(MUST_BE_BOOLEAN)
    .bail()
    .escape()
    .ltrim()
    .rtrim()
    .isBoolean()
    .withMessage(MUST_BE_BOOLEAN)
    .toBoolean(),
];

export const validateEditHistory = [
  param('userId')
    .exists()
    .withMessage(USER_ID_IS_REQUIRED)
    .bail()
    .not()
    .isEmpty()
    .withMessage(USER_ID_IS_EMPTY)
    .bail()
    .escape()
    .ltrim()
    .rtrim()
    .isLength({ min: 24, max: 24 })
    .withMessage(USER_ID_IS_INVALID)
    .bail()
    .isHexadecimal()
    .withMessage(USER_ID_IS_INVALID),
  query('byCourseName')
    .if(query('byCourseName').exists())
    .not()
    .isEmpty()
    .withMessage(MUST_BE_BOOLEAN)
    .bail()
    .escape()
    .ltrim()
    .rtrim()
    .isBoolean()
    .withMessage(MUST_BE_BOOLEAN)
    .toBoolean(),
];
