import express from 'express';
import { check, validationResult } from 'express-validator';
import passport from 'passport';
import { generateServerErrorCode } from '../store/utils';
import { Course } from '../database/models';
import {
  COURSE_SCHOOL_IS_EMPTY,
  COURSE_EXISTS_ALREADY,
  COURSE_DOES_NOT_EXIST,
  SCHOOl_DOES_NOT_EXIST,
  COURSE_CODE_IS_EMPTY,
  DOES_NOT_CONTAIN_A_DIGIT,
  COURSE_TITLE_IS_EMPTY,
  COURSE_DESCRIPTION_IS_EMPTY,
  COURSE_TERMS_OFFERED_IS_EMPTY,
  SOME_THING_WENT_WRONG,
  COURSE_ID_IS_EMPTY,
  NO_DATA_TO_UPDATE,
} from './constant';

const courseController = express.Router();
const ObjectId = require('mongoose').Types.ObjectId;

const validateCourseCreation = [
  check('school')
    .exists()
    .withMessage(COURSE_SCHOOL_IS_EMPTY),
  check('code')
    .exists()
    .withMessage(COURSE_CODE_IS_EMPTY),
  check('title')
    .exists()
    .withMessage(COURSE_TITLE_IS_EMPTY),
  check('description')
    .exists()
    .withMessage(COURSE_DESCRIPTION_IS_EMPTY),
  check('termsOffered')
    .exists()
    .withMessage(COURSE_TERMS_OFFERED_IS_EMPTY),
];

const validateSingleCourse = [
  check('school')
    .exists()
    .withMessage(COURSE_SCHOOL_IS_EMPTY),
  check('code')
    .exists()
    .withMessage(COURSE_CODE_IS_EMPTY)
    .matches(/\d/)
    .withMessage(DOES_NOT_CONTAIN_A_DIGIT),
];

const validateSchoolCourses = [
  check('school')
    .exists()
    .withMessage(COURSE_SCHOOL_IS_EMPTY),
];

const validateCourseId = [
  check('course_id')
    .exists()
    .withMessage(COURSE_ID_IS_EMPTY),
];

/**
 * Creates a new Course with correct reference to ObjectId of prerequisites and corequisites
 * @param {} data
 * @returns {Course} Course
 */
async function createCourse(data) {
  try {
    let course;
    let prereqs = data.prerequisites;
    let coreqs = data.corequisites;

    data.prerequisites = await getAllCourseId(data.school, prereqs);
    data.corequisites = await getAllCourseId(data.school, coreqs);

    course = new Course(data);
    return course.save();
  } catch (e) {
    console.log('createCourse() Error: ', e);
  }
}

/**
 * Loop though an array of Courses to get the ObjectId of each
 * @param {String} school
 * @param {[String]} codes
 * @returns {[ObjectId]} [ObjectId]
 */
async function getAllCourseId(school, codes) {
  try {
    let coursesWithIds = [];
    for (let code of codes) {
      const objId = await getObjectId(school, code);
      coursesWithIds.push(objId);
    }
    return coursesWithIds;
  } catch (e) {
    console.log('getAllCourseId() Error: ', e);
  }
}

/**
 * Get the ObjectId of a course based on school (schl) and course code
 * Or initialize a new course and retrieve the ObjectId
 * @param {String} school
 * @param {String} code
 * @returns {ObjectId} ObjectId
 */
async function getObjectId(school, code) {
  try {
    let course = await Course.findOne({
      school,
      code,
    });
    if (!course) {
      const createdCourse = await createEmptyCourse(school, code);
      return new ObjectId(createdCourse._id);
    }
    return new ObjectId(course._id);
  } catch (e) {
    console.log('getObjectId() Error: ', e);
  }
}

/**
 * Initialiazes an empty course for future use
 * @param {String} schl
 * @param {String} courseCode
 * @returns {Course} Course
 */
async function createEmptyCourse(school, code) {
  const data = {
    school,
    code,
    title: ' ',
    description: ' ',
    prerequisites: [],
    corequisites: [],
    difficulty: 0,
    impaction: 0,
    termsOffered: ' ',
  };
  let newCourse = new Course(data);
  return newCourse.save();
}

/**
 * Removes the undefined properties of an object
 * Found: https://stackoverflow.com/questions/25421233/javascript-removing-undefined-fields-from-an-object/38340374#38340374
 * @param {Object} obj
 */
function removeUndefinedObjectProps(obj) {
  Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
  return obj;
}

function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0;
}

/**
 * POST/
 * Create a new course, requires authentication of user
 */
courseController.post(
  '/',
  passport.authenticate('jwt', {
    session: false,
  }),
  validateCourseCreation,
  async (req, res) => {
    const errorsAfterValidation = validationResult(req);
    if (!errorsAfterValidation.isEmpty()) {
      res.status(400).json({
        code: 400,
        errors: errorsAfterValidation.mapped(),
      });
    } else {
      try {
        const { school, code } = req.body;

        // Check if course already exists
        const course = await Course.findOne({
          school,
          code,
        });

        // Create a new course
        if (!course) {
          const createdCourse = await createCourse(req.body);
          res.status(200).json(createdCourse);
        } else {
          generateServerErrorCode(
            res,
            403,
            'course creation error',
            COURSE_EXISTS_ALREADY,
            'school, code'
          );
        }
      } catch (e) {
        generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
      }
    }
  }
);

/**
 * GET/
 * Get a single course based on school and code
 */
courseController.get(
  '/:school/:code',
  validateSingleCourse,
  async (req, res) => {
    const errorsAfterValidation = validationResult(req);
    if (!errorsAfterValidation.isEmpty()) {
      res.status(400).json({
        code: 400,
        errors: errorsAfterValidation.mapped(),
      });
    } else {
      try {
        const { school, code } = req.params;

        // Get course and populate the prerequisites and corequisities data using their _id
        const course = await Course.findOne({
          school,
          code,
        }).populate('prerequisites corequisites');

        if (course) {
          res.status(200).json(course);
        } else {
          generateServerErrorCode(
            res,
            403,
            'course retrieval error',
            COURSE_DOES_NOT_EXIST,
            'code'
          );
        }
      } catch (e) {
        generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
      }
    }
  }
);

/**
 * GET/
 * Get all courses for a school
 */
courseController.get('/:school', validateSchoolCourses, async (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped(),
    });
  } else {
    try {
      // Get all courses with matching school name and populate the prerequisites and corequisities data using their _id
      const courses = await Course.find({
        school: req.params.school,
      }).populate('prerequisites corequisites');

      if (courses) {
        res.status(200).json(courses);
      } else {
        generateServerErrorCode(
          res,
          403,
          'school courses retrieval error',
          SCHOOl_DOES_NOT_EXIST,
          'school'
        );
      }
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
    }
  }
});

/**
 * PUT/
 * Update a course based on ObjectId
 */
courseController.put(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateCourseId,
  async (req, res) => {
    const errorsAfterValidation = validationResult(req);
    if (!errorsAfterValidation.isEmpty()) {
      res.status(400).json({
        code: 400,
        errors: errorsAfterValidation.mapped(),
      });
    } else {
      try {
        // Get course ObjectId from query
        const course_id = req.query.course_id;

        // Remove undefined properties
        const updateData = removeUndefinedObjectProps(req.body);

        // Check if there is data to update
        if (isObjectEmpty(updateData)) {
          return res.status(400).json({ error: NO_DATA_TO_UPDATE });
        }

        const updatedCourse = await Course.findByIdAndUpdate(
          { _id: course_id },
          updateData,
          { useFindAndModify: false }
        );

        if (updatedCourse) {
          res.status(200).json(updatedCourse);
        } else {
          generateServerErrorCode(
            res,
            403,
            'update course error',
            COURSE_DOES_NOT_EXIST,
            'course_id'
          );
        }
      } catch (e) {
        generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
      }
    }
  }
);

/**
 * DELETE/
 * Delete a course
 */
courseController.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Get course ObjectId from query
      const course_id = req.query.course_id;

      const successfulDeletion = await Course.findByIdAndDelete({
        _id: course_id,
      });

      if (successfulDeletion) {
        return res.status(200).json({ message: 'deleted a course' });
      } else {
        generateServerErrorCode(
          res,
          403,
          'delete course error',
          COURSE_DOES_NOT_EXIST,
          'course_id'
        );
      }
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
    }
  }
);

/**
 * DELETE/
 * Delete everything!
 */
courseController.delete(
  '/all',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    Course.deleteMany({}, function(err, result) {
      if (err) {
        return res.status(500).json({ err });
      }
      return res.status(200).json({ message: 'deleted all courses' });
    });
  }
);

export default courseController;
