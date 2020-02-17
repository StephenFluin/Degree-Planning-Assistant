import express from 'express';
import {
  check,
  validationResult
} from 'express-validator';
import passport from "passport";
import {
  generateServerErrorCode
} from '../store/utils';
import {
  Course
} from '../database/models';
import {
  COURSE_SCHOOL_IS_EMPTY,
  COURSE_EXISTS_ALREADY,
  COURSE_DOES_NOT_EXIST,
  COURSE_CODE_IS_EMPTY,
  DOES_NOT_CONTAIN_A_DIGIT,
  COURSE_TITLE_IS_EMPTY,
  COURSE_DESCRIPTION_IS_EMPTY,
  COURSE_TERMS_OFFERED_IS_EMPTY,
  SOME_THING_WENT_WRONG
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
  .withMessage(COURSE_TERMS_OFFERED_IS_EMPTY)
];

const validateSingleCourse = [
  check('school')
  .exists()
  .withMessage(COURSE_SCHOOL_IS_EMPTY),
  check('code')
  .exists()
  .withMessage(COURSE_CODE_IS_EMPTY)
  .matches(/\d/)
  .withMessage(DOES_NOT_CONTAIN_A_DIGIT)
];

const validateSchoolCourses = [
  check('school')
  .exists()
  .withMessage(COURSE_SCHOOL_IS_EMPTY),
];

/**
 * Creates a new Course with correct reference to ObjectId of prerequisites and corequisites
 * @param {String} schl 
 * @param {String} code 
 * @param {String} title 
 * @param {String} description 
 * @param {[ObjectId]} prereq 
 * @param {[ObjectId]} coreq 
 * @param {Number} difficulty 
 * @param {Number} impaction 
 * @param {String} termsOffered 
 * @returns {Course} new course
 */
async function createCourse(schl, code, title, description, prereq, coreq, difficulty, impaction, termsOffered) {
  console.log("Current course: ", schl, code);
  let course;
  let prerequisites;
  try {
    prerequisites = await loopThroughCourses(schl, prereq);
    let corequisites = coreq;
    // let corequisites = await loopThroughCourses(schl, coreq);
    const data = {
      school: schl,
      code,
      title,
      description,
      prerequisites,
      corequisites,
      difficulty,
      impaction,
      termsOffered
    };

    course = new Course(data);
    return course.save();

  } catch (e) {
    console.log("looping error", e);
  }
}

/**
 * Loop though an array of Courses to get the ObjectId of each
 * @param {String} school 
 * @param {[String]} codes 
 * @returns {[Course]} coursesWithIds
 */
async function loopThroughCourses(school, codes) {
  try {
    let coursesWithIds = [];
    for (let code of codes) {
      const objId = await getObjectId(school, code)
      coursesWithIds.push(objId);
    }
    return coursesWithIds;
  } catch (e) {
    console.log("The error e: ", e);
  }
}

/**
 * Get the ObjectId of a course based on school (schl) and course code
 * Or initialize a new course and retrieve the ObjectId
 * @param {String} schl 
 * @param {String} courseCode 
 * @returns {ObjectId} course._id
 */
async function getObjectId(school, code) {
  console.log("getObjectId of school and code: ", school, code);
  try {
    let course = await Course.findOne({
      school,
      code
    });
    if (!course) {
      const createdCourse = await createEmptyCourse(school, code);
      return new ObjectId(createdCourse._id);
    }
    return new ObjectId(course._id);
  } catch (e) {
    console.log("The unhandled error: ", e);
  }
}

/**
 * Initialiazes an empty course for future use
 * @param {String} schl 
 * @param {String} courseCode 
 * @returns {Course} new course
 */
async function createEmptyCourse(schl, courseCode) {
  const data = {
    school: schl,
    code: courseCode,
    title: " ",
    description: " ",
    prerequisites: [],
    corequisites: [],
    difficulty: 0,
    impaction: 0,
    termsOffered: " "
  };
  let newCourse = new Course(data);
  return newCourse.save();
}


// function populateCourseBasedOnId() {
//   .populate('prerequisites')
//       .exec(function (err, currentCourse) {
//         if (err) return handleError(err);
//         console.log('\nThe prerequisites are %s', currentCourse);
//       });
// }

/**
 * POST/
 * Create a new course, requires authentication of user
 */
courseController.post('/create',
  passport.authenticate('jwt', {
    session: false
  }),
  validateCourseCreation, async (req, res) => {
    const errorsAfterValidation = validationResult(req);
    if (!errorsAfterValidation.isEmpty()) {
      res.status(400).json({
        code: 400,
        errors: errorsAfterValidation.mapped()
      });
    } else {
      try {
        const {
          school,
          code,
          title,
          description,
          prerequisites,
          corequisites,
          difficulty,
          impaction,
          termsOffered
        } = req.body;

        // Check if course already exists
        const course = await Course.findOne({
          school,
          code
        });

        // It doesn't, so create a new course
        if (!course) {
          const createdCourse = await createCourse(school, code, title, description, prerequisites, corequisites, difficulty, impaction, termsOffered);
          const courseToReturn = {
            ...createdCourse.toJSON()
          };
          res.status(200).json(courseToReturn);
        } else {
          generateServerErrorCode(res, 403, 'course creation error', COURSE_EXISTS_ALREADY, 'code');
        }
      } catch (e) {
        generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
      }
    }
  });

/**
 * GET/
 * Get a single course based on school and code
 */
courseController.get('/:school/:code', validateSingleCourse, async (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped()
    });
  } else {
    try {
      const {
        school,
        code
      } = req.params;
      const course = await Course.findOne({
        school,
        code
      });

      if (course) {
        const courseToReturn = course;
        res.status(200).json(courseToReturn);
      } else {
        generateServerErrorCode(res, 403, 'course retrieval error', COURSE_DOES_NOT_EXIST, 'code');
      }
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
    }
  }
});

/**
 * GET/
 * Get all courses for a school
 */
courseController.get('/:school', validateSchoolCourses, async (req, res) => {
  const errorsAfterValidation = validationResult(req);
  if (!errorsAfterValidation.isEmpty()) {
    res.status(400).json({
      code: 400,
      errors: errorsAfterValidation.mapped()
    });
  } else {
    try {
      const courses = await Course.find({
        school: req.params.school
      });
      if (courses) {
        console.log("\n---COURSES---\n ", courses);
        const coursesToReturn = courses;
        console.log("\n---COURSES TO RETURN---\n ", coursesToReturn);
        res.status(200).json(coursesToReturn);
      } else {
        generateServerErrorCode(res, 403, 'course retrieval error', COURSE_DOES_NOT_EXIST, 'code');
      }
    } catch (e) {
      generateServerErrorCode(res, 500, e, SOME_THING_WENT_WRONG);
    }
  }
});

export default courseController;