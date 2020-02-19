import { check, body, query } from 'express-validator';

import {
  AVATAR_URL_IS_EMPTY,
  AVATAR_TYPE_IS_EMPTY,
  FIRST_NAME_IS_EMPTY,
  LAST_NAME_IS_EMPTY,
  BIO_IS_EMPTY,
  MAJOR_IS_EMPTY,
  MINOR_IS_EMPTY,
  CATALOG_YEAR_IS_EMPTY,
  AVATAR_TYPE_IS_INVALID,
  LAST_NAME_IS_INVALID,
  BIO_IS_TOO_LONG,
  MAJOR_IS_INVALID,
  MINOR_IS_INVALID,
  CATALOG_YEAR_IS_INVALID,
  AVATAR_URL_IS_INVALID,
  USER_ID_IS_REQUIRED,
  USER_ID_IS_EMPTY,
  USER_ID_IS_INVALID,
  PASSWORD_IS_EMPTY,
  PASSWORD_LENGTH_MUST_BE_MORE_THAN_8,
  EMAIL_IS_EMPTY,
  EMAIL_IS_IN_WRONG_FORMAT,
} from '../constant';

const checkIfLettersOnly = str => {
  const regExp = new RegExp(/^([a-z]|[A-Z]|\s)+$/, 'g');
  return regExp.test(str);
};

// Check if the proper object structure for grad date was inputted
export const checkIfCorrectGradDate = obj => {
  if (obj.constructor === Object) {
    if (
      !obj.year ||
      obj.year.constructor !== Number ||
      obj.year < new Date().getFullYear() ||
      obj.year >= Number.MAX_SAFE_INTEGER
    ) {
      return false;
    }
    if (
      !obj.term ||
      obj.term.constructor !== String ||
      (obj.term.toLowerCase() !== 'fall' &&
        obj.term.toLowerCase() !== 'spring' &&
        obj.term.toLowerCase() !== 'winter' &&
        obj.term.toLowerCase() !== 'summer')
    ) {
      return false;
    }
    if (Object.keys(obj).length !== 2) {
      return false;
    }
    return true;
  } else {
    return false;
  }
};

export const validateRegisterUser = [
  check('email')
    .exists()
    .withMessage(EMAIL_IS_EMPTY)
    .isEmail()
    .withMessage(EMAIL_IS_IN_WRONG_FORMAT),
  check('password')
    .exists()
    .withMessage(PASSWORD_IS_EMPTY)
    .isLength({ min: 8 })
    .withMessage(PASSWORD_LENGTH_MUST_BE_MORE_THAN_8),
];

export const validateLoginUser = [
  check('email')
    .exists()
    .withMessage(EMAIL_IS_EMPTY)
    .isEmail()
    .withMessage(EMAIL_IS_IN_WRONG_FORMAT),
  check('password')
    .exists()
    .withMessage(PASSWORD_IS_EMPTY)
    .isLength({ min: 8 })
    .withMessage(PASSWORD_LENGTH_MUST_BE_MORE_THAN_8),
];

export const validateEditProfile = [
  // Note that the INTENTION of the HTTP req/res that we're using this validator for requires the user's ID
  // and AT LEAST ONE data to be changed. The one data to be changed can be ANY of the other values
  // of a USER document (check schema). In order to allow the client to choose which data they want to change,
  // We make the other values OPTIONAL in this validator array. However, in the HTTP req/res itself, we will
  // check if the client had included at least ONE data to be changed.
  body('user_id') // The only input this validator array requires
    .exists()
    .withMessage(USER_ID_IS_REQUIRED)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .not()
    .isEmpty()
    .withMessage(USER_ID_IS_EMPTY)
    .bail()
    .isHexadecimal()
    .withMessage(USER_ID_IS_INVALID)
    .bail()
    .isLength({ min: 24, max: 24 })
    .withMessage(USER_ID_IS_INVALID),
  body('avatar_url') // Optional
    .if(body('avatar_url').exists()) // IF the client included avatar_url, then validate it
    .not()
    .isEmpty()
    .withMessage(AVATAR_URL_IS_EMPTY)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .isURL()
    .withMessage(AVATAR_URL_IS_INVALID),
  body('avatar_type') // Optional
    .if(body('avatar_type').exists()) // IF the client included avatar_type, then validate it
    .not()
    .isEmpty()
    .withMessage(AVATAR_TYPE_IS_EMPTY)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .custom(value => {
      if (checkIfLettersOnly(value) === true) {
        return Promise.resolve();
      } else {
        return Promise.reject(AVATAR_TYPE_IS_INVALID);
      }
    }),
  body('first_name') // Optional
    .if(body('first_name').exists()) // IF the client included first_name, then validate it
    .not()
    .isEmpty()
    .withMessage(FIRST_NAME_IS_EMPTY)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .custom(value => {
      if (checkIfLettersOnly(value) === true) {
        return Promise.resolve();
      } else {
        return Promise.reject(FIRST_NAME_IS_INVALID);
      }
    }),
  body('last_name') // Optional
    .if(body('last_name').exists()) // IF the client included last_name, then validate it
    .not()
    .isEmpty()
    .withMessage(LAST_NAME_IS_EMPTY)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .custom(value => {
      if (checkIfLettersOnly(value) === true) {
        return Promise.resolve();
      } else {
        return Promise.reject(LAST_NAME_IS_INVALID);
      }
    }),
  body('bio') // Optional
    .if(body('bio').exists()) // IF the client included bio, then validate it
    .not()
    .isEmpty()
    .withMessage(BIO_IS_EMPTY)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .isLength({ max: 160 })
    .withMessage(BIO_IS_TOO_LONG),
  body('major') // Optional
    .if(body('major').exists()) // IF the client included major, then validate it
    .not()
    .isEmpty()
    .withMessage(MAJOR_IS_EMPTY)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .custom(value => {
      if (checkIfLettersOnly(value) === true) {
        return Promise.resolve();
      } else {
        return Promise.reject(MAJOR_IS_INVALID);
      }
    }),
  body('minor') // Optional
    .if(body('minor').exists()) // IF the client included minor, then validate it
    .not()
    .isEmpty()
    .withMessage(MINOR_IS_EMPTY)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .custom(value => {
      if (checkIfLettersOnly(value) === true) {
        return Promise.resolve();
      } else {
        return Promise.reject(MINOR_IS_INVALID);
      }
    }),
  body('catalog_year') // Optional
    .if(body('catalog_year').exists()) // IF the client included catalog_year, then validate it
    .not()
    .isEmpty()
    .withMessage(CATALOG_YEAR_IS_EMPTY)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .isNumeric()
    .withMessage(CATALOG_YEAR_IS_INVALID),
];

export const validateFetchProfile = [
  query('user_id')
    .exists()
    .withMessage(USER_ID_IS_REQUIRED)
    .bail()
    .unescape()
    .ltrim()
    .rtrim()
    .not()
    .isEmpty()
    .withMessage(USER_ID_IS_EMPTY)
    .bail()
    .isHexadecimal()
    .withMessage(USER_ID_IS_INVALID)
    .bail()
    .isLength({ min: 24, max: 24 })
    .withMessage(USER_ID_IS_INVALID),
  query('email') // Optional
    .if(query('email').exists()) // IF the client included email, then validate it
    .unescape()
    .ltrim()
    .rtrim(),
  query('avatar_url') // Optional
    .if(query('avatar_url').exists()) // IF the client included avatar_url, then validate it
    .unescape()
    .ltrim()
    .rtrim(),
  query('avatar_type') // Optional
    .if(query('avatar_type').exists()) // IF the client included avatar_type, then validate it
    .unescape()
    .ltrim()
    .rtrim(),
  query('first_name') // Optional
    .if(query('first_name').exists()) // IF the client included first_name, then validate it
    .unescape()
    .ltrim()
    .rtrim(),
  query('last_name') // Optional
    .if(query('last_name').exists()) // IF the client included last_name, then validate it
    .unescape()
    .ltrim()
    .rtrim(),
  query('bio') // Optional
    .if(query('bio').exists()) // IF the client included bio, then validate it
    .unescape()
    .ltrim()
    .rtrim(),
  query('major') // Optional
    .if(query('major').exists()) // IF the client included major, then validate it
    .unescape()
    .ltrim()
    .rtrim(),
  query('minor') // Optional
    .if(query('minor').exists()) // IF the client included minor, then validate it
    .unescape()
    .ltrim()
    .rtrim(),
  query('catalog_year') // Optional
    .if(query('catalog_year').exists()) // IF the client included catalog_year, then validate it
    .unescape()
    .ltrim()
    .rtrim(),
];
