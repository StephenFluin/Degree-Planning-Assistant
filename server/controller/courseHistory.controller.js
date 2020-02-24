import express from 'express';

import passport from 'passport';

import { User } from '../database/models';

import { validationResult } from 'express-validator';
import {
  validateHistoryObjStructure,
  validateFetchHistory,
} from './validation/courseHistory.validation';

import {
  SERVER_ERROR,
  USER_NOT_FOUND,
  COURSES_ARRAY_IS_INVALID,
  COURSES_NOT_FOUND,
} from './constant';

const courseHistoryController = express.Router();

// @route   GET /user/:userId
// @desc    Fetches a user's course history
// @access  Private
courseHistoryController.get(
  '/user/:userId',
  passport.authenticate('jwt', { session: false }),
  validateFetchHistory,
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty() === false) {
      return res.status(400).json(errors);
    }

    try {
      const { userId } = req.params;
      const { idOnly } = req.query;

      let user;

      if (idOnly && idOnly === true) {
        user = await User.findById(userId, 'courses_taken').populate(
          'courses_taken'
        );
      } else {
        user = await User.findById(userId, 'courses_taken');
      }

      if (!user) {
        return res.status(404).json({ error: USER_NOT_FOUND });
      } else {
        return res.status(200).json(user.courses_taken);
      }
    } catch (databaseErr) {
      console.log(databaseErr);
      logger.info(databaseErr);
      return res.status(500).json({ error: SERVER_ERROR });
    }
  }
);

// @route   PUT /user/:userId
// @desc    Edits the user's course history
// @access  Private
courseHistoryController.put(
  '/user/:userId',
  passport.authenticate('jwt', { session: false }),
  validateEditHistory,
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty() === false) {
      return res.status(400).json(errors);
    }

    if (
      validateHistoryObjStructure(req.body.courses, req.query.byCourseName) !==
      true
    ) {
      return res.status(400).json({ error: COURSES_ARRAY_IS_INVALID });
    }

    try {
      const { userId } = req.params;
      const { byCourseName } = req.query;
      const { courses } = req.body;

      const dataToUpdate = {
        courses_taken: courses,
      };

      if (byCourseName && byCourseName === true) {
        const fetchedCourseIds = await Course.find(
          { name: { $in: courses } },
          '_id'
        );

        if (!fetchedCourseIds) {
          return res.status(404).json({ error: COURSES_NOT_FOUND });
        }

        // TODO: Check if return is an array of strings
        dataToUpdate.courses_taken = fetchedCourseIds;
      }

      const editResult = await User.updateOne({ _id: userId }, dataToUpdate);
      if (editResult.n === 0) {
        return res.status(404).json({ error: USER_NOT_FOUND });
      } else {
        return res.status(200).json();
      }
    } catch (databaseErr) {
      return res.status(500).json({ error: SERVER_ERROR });
    }
  }
);

export default courseHistoryController;
