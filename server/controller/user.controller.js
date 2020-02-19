import express from 'express';
import passport from 'passport';

import logger from 'winston';

import {
  validateRegisterUser,
  validateLoginUser,
  validateEditProfile,
  validateFetchProfile,
  checkIfCorrectGradDate,
} from './validation/user.validation';
import { validationResult } from 'express-validator';

import jwt from 'jsonwebtoken';

import {
  generatehashedPassword,
  generateServerErrorCode,
} from '../store/utils';
import { config } from '../store/config';

import { validationResult } from 'express-validator';
import { validation } from "./validation/user.validation";

import {
  SOME_THING_WENT_WRONG,
  USER_EXISTS_ALREADY,
  WRONG_PASSWORD,
  USER_DOES_NOT_EXIST,
  PARAMETERS_REQUIRED,
  SERVER_ERROR,
  INVALID_GRAD_DATE,
  USER_NOT_FOUND,
} from './constant';

import { User } from '../database/models';

const userController = express.Router();

function createUser(email, password) {
  const data = {
    email,
    hashedPassword: generatehashedPassword(password),
    avatarUrl: '',
    avatarType: '',
    firstName: '',
    lastName: '',
    bio: '',
    isAdmin: false,
    coursesTaken: [],
    gradDate: { year: undefined, term: '' },
    major: '',
    minor: '',
    catalogYear: undefined,
    degreePlanId: undefined,
  };

  user = new User(data);
  return user.save();
}

/**
 * POST/
 * Register a user
 */
userController.post('/register', validateRegisterUser, async (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped(),
    });
  } else {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        await createUser(email, password);
        // Sign token
        const newUser = await User.findOne({ email });
        const token = jwt.sign({ email }, config.passport.secret, {
          expiresIn: 10000000,
        });

        const userToReturn = { ...newUser.toJSON(), ...{ token } };

        delete userToReturn.hashedPassword;
        res.status(200).json(userToReturn);
      } else {
        generateServerErrorCode(
          res,
          403,
          'register email error',
          USER_EXISTS_ALREADY,
          'email'
        );
      }
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
    }
  }
});

/**
 * POST/
 * Login a user
 */
userController.post('/login', validateLoginUser, async (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped(),
    });
  } else {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (user && user.email) {
        const isPasswordMatched = user.comparePassword(password);
        if (isPasswordMatched) {
          // Sign token
          const token = jwt.sign({ email }, config.passport.secret, {
            expiresIn: 1000000,
          });
          const userToReturn = { ...user.toJSON(), ...{ token } };
          delete userToReturn.hashedPassword;
          res.status(200).json(userToReturn);
        } else {
          generateServerErrorCode(
            res,
            403,
            'login password error',
            WRONG_PASSWORD,
            'password'
          );
        }
      } else {
        generateServerErrorCode(
          res,
          404,
          'login email error',
          USER_DOES_NOT_EXIST,
          'email'
        );
      }
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
    }
  }
});

// @route   PUT /profile
// @desc    Edits a user's profile
// @access  Private
userController.put(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  validateEditProfile,
  async (req, res) => {
    // Check if the validators caught any invalid inputs
    const errors = validationResult(req);
    if (errors.isEmpty() === false) {
      return res.status(400).json(errors);
    }

    const {
      user_id,
      avatar_url,
      avatar_type,
      first_name,
      last_name,
      bio,
      major,
      minor,
      catalog_year,
      grad_date,
    } = req.body;

    // Check if the client had included at least one data to be changed
    if (
      !avatar_url &&
      !avatar_type &&
      !first_name &&
      !last_name &&
      !bio &&
      !major &&
      !minor &&
      !catalog_year &&
      !grad_date
    ) {
      // Client did not include data to be changed so there is nothing to be updated, return error code
      return res.status(400).json({ errors: PARAMETERS_REQUIRED });
    }

    // Check if the client had inputted grad_date and check if it's a valid object input
    if (grad_date && checkIfCorrectGradDate(grad_date) === false) {
      return res.status(400).json({ errors: INVALID_GRAD_DATE });
    }

    try {
      // Create an object containing the items to be changed and their new values
      // The following code adds key:value pairs from the request into an object. It checks if the key
      // exists before adding it into the object. It is important that we don't include keys that
      // don't exist so that their values in the database aren't changed.
      const itemsToBeUpdated = {
        ...(avatar_url && { avatarUrl: avatar_url }),
        ...(avatar_type && { avatarType: avatar_type }),
        ...(first_name && { firstName: first_name }),
        ...(last_name && { lastName: last_name }),
        ...(bio && { bio }),
        ...(major && { major }),
        ...(minor && { minor }),
        ...(catalog_year && { catalogYear: catalog_year }),
        ...(grad_date && { gradDate: grad_date }),
      };

      // Query the database with the data to be changed and the id of the user to be changed
      const updatedUser = await User.updateOne(
        { _id: user_id },
        itemsToBeUpdated
      );

      // If there is a value that had been modified then the update was successful.
      if (updatedUser.n > 0) {
        return res.status(200).json();
      } else {
        // Otherwise no document was changed therefore we return a 404 not found error code.
        return res.status(404).json({ errors: USER_NOT_FOUND });
      }
    } catch (databaseError) {
      // Our code caused an error, so we return error code 500 server error
      logger.info(databaseError);
      return res.status(500).json({ errors: SERVER_ERROR });
    }
  }
);

//  @route  GET /profile
//  @desc   Fetches a user's profile
//  @access Private
userController.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  validateFetchProfile,
  async (req, res) => {
    // Check if validators found invalid input
    const errors = validationResult(req);
    if (errors.isEmpty() === false) {
      return res.status(400).json(errors);
    }

    const {
      user_id,
      email,
      avatar_url,
      avatar_type,
      first_name,
      last_name,
      bio,
      major,
      minor,
      catalog_year,
      grad_date,
    } = req.query;

    try {
      // Check if client specified which fields to fetch
      // If field is specified, add them to an object which will be used for projection
      let itemsToBeFetched = {
        ...(email && { email: true }),
        ...(avatar_url && { avatarUrl: true }),
        ...(avatar_type && { avatarType: true }),
        ...(first_name && { firstName: true }),
        ...(last_name && { lastName: true }),
        ...(bio && { bio: true }),
        ...(major && { major: true }),
        ...(minor && { minor: true }),
        ...(catalog_year && { catalogYear: true }),
        ...(grad_date && { gradDate: true }),
      };

      // If client doesn't specify anything, fetch everything but the unnecessary fields
      if (Object.keys(itemsToBeFetched).length === 0) {
        itemsToBeFetched = {
          _id: false,
          hashedPassword: false,
          degreePlanId: false,
          isAdmin: false,
        };
      }

      // Fetch the document using the projection object
      const fetchedUser = await User.findOne(
        { _id: user_id },
        itemsToBeFetched
      );

      // Check if document was fetched. if so, include in response
      if (fetchedUser) {
        return res.status(200).json(fetchedUser);
      } else {
        // Otherwise return a 404 not found error code
        return res.status(404).json({ errors: USER_NOT_FOUND });
      }
    } catch (databaseError) {
      logger.info(databaseError);
      return res.status(500).json({ errors: SERVER_ERROR });
    }
  }
);

export default userController;
