import express from 'express';
import { check, validationResult } from 'express-validator';
import passport from "passport";
import { generateServerErrorCode } from '../store/utils';
import { Course } from '../database/models';
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

async function createCourse(schl, code, title, description, prereq, coreq, difficulty, impaction, termsOffered) {
  let course;
  let prerequisites = [];
  let corequisites = [];
  
  console.log("PREREQS before: ", prereq);
  // retrieve each prereq's id and save that into the database
  for (let pre of prereq) {
    console.log("pre: ", pre);

    prerequisites.push(await findIdFromSchoolCode(schl, pre));
  }
  console.log("PREREQS after: ", prerequisites);


  // console.log("COREQS before: ", coreq);
  // // retrieve each coreq's id and save that into the database
  // for (let co of coreq) {
  //   corequisites.push(findIdFromSchoolCode(schl, co));
  // }
  // console.log("COREQS after: ", corequisites);

  const data = {
    school: schl,
    code,
    title,
    description,
    prerequisites,
    coreq,
    difficulty,
    impaction,
    termsOffered
  };

  course = new Course(data);
  return course.save();
}

async function findIdFromSchoolCode(schl, courseCode) {
  console.log("findIdFromSchoolCode")
  let course = await Course.findOne({ school: schl, code: courseCode });
  console.log(1)
  console.log(course)
  if (course) {
    console.log(course._id);
    return new ObjectId(course._id); 
  }

  console.log("Creating an empty course since no entry for ", courseCode);
  let newCourse = createEmptyCourse(schl, courseCode);
  newCourse.save();
}

function createEmptyCourse(schl, courseCode) {
  
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
  return new Course(data);
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

        const course = await Course.findOne({ school, code });
        if (!course) {
          const createdCourse = await createCourse(school, code, title, description, prerequisites, corequisites, difficulty, impaction, termsOffered);
          const courseToReturn = { ...createdCourse.toJSON() };
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
      const { school, code } = req.params;
      const course = await Course.findOne({ school, code });

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
      const courses = await Course.find({ school: req.params.school });
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