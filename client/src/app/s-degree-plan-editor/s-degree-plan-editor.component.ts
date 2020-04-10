import { Component, OnInit } from "@angular/core";

import { PlanService, YearStub, CoursesStub } from "../plan.service";

@Component({
  selector: "app-s-degree-plan-editor",
  templateUrl: "./s-degree-plan-editor.component.html",
  styleUrls: ["./s-degree-plan-editor.component.css"],
})
export class SDegreePlanEditorComponent implements OnInit {
  // new semester states
  newSemesterIsActive: boolean;
  newSemesterTermSelect: string;
  newSemesterYearField: number;

  draggedCourse: string;

  semestersStub: Array<YearStub>;
  coursesStub: CoursesStub;

  constructor(private planService: PlanService) {
    this.newSemesterIsActive = false;
    this.newSemesterTermSelect = "";
    this.newSemesterYearField = 2020;

    this.semestersStub = [];

    this.coursesStub = {
      eligible: [
        {
          type: "ENGL",
          courses: ["ENGL001A"],
        },
        {
          type: "CS",
          courses: ["CS046A", "CS046B"],
        },
        {
          type: "MATH",
          courses: ["MATH030", "MATH031", "MATH032", "MATH042"],
        },
        {
          type: "CMPE",
          courses: ["CMPE131"],
        },
      ],
      ineligible: [
        {
          type: "CMPE",
          courses: [
            "CMPE133",
            "CMPE148",
            "CMPE165",
            "CMPE187",
            "CMPE195A",
            "CMPE195B",
            "CMPE172",
          ],
        },
        {
          type: "CS",
          courses: ["CS157A", "CS166", "CS149"],
        },
      ],
    } as CoursesStub;
  }

  ngOnInit() {}

  onClickNewSemester() {
    if (this.newSemesterIsActive === true) {
      this.newSemesterTermSelect = "";
      this.newSemesterYearField = 2020;
    }
    this.newSemesterIsActive = !this.newSemesterIsActive;
  }

  onClickAddNewSemester() {
    if (
      this.planService.addNewSemester(
        this.newSemesterTermSelect,
        this.newSemesterYearField,
        this.semestersStub
      ) === false
    ) {
      console.log("Semester already exists!");
      // TODO: Show in UI that semester already exists
    }
  }

  onDragStartCourse(courseCode: string) {
    this.draggedCourse = courseCode;
  }

  onDropCourse(term: string, year: number) {
    if (
      this.planService.addNewCourseToSemester(
        term,
        year,
        this.semestersStub,
        this.draggedCourse
      )
    ) {
      console.log("passed");
    } else {
      console.log("failed");
    }
  }
}

/*
  this.semestersStub = [
      {
        beginning: 2017,
        ending: 2018,
        semesters: [
          {
            term: "FALL",
            year: 2017,
            status: "completed",
            difficulty: 1.5,
            units: 7,
            courses: [
              {
                school: "San Jose State University",
                code: "CS046A",
                title: "Introduction to Programming",
                credit: "4",
                description:
                  "Basic skills and concepts of computer programming in an object-oriented approach using Java. Classes, methods and argument passing, control structures, iteration. Basic graphical user interface programming. Problem solving, class discovery and stepwise refinement. Programming and documentation style. Weekly hands-on activity.",
                prerequisites: [],
                corequisites: [],
                difficulty: 3,
                impaction: 3,
                termsOffered: "Spring, Fall, Summer, Winter",
              },
              {
                school: "San Jose State University",
                code: "MATH030",
                title: "Calculus I",
                credit: "3",
                description:
                  "Introduction to calculus including limits, continuity, differentiation, applications and introduction to integration. Graphical, algebraic and numerical methods of solving problems.",
                prerequisites: [],
                corequisites: [],
                difficulty: 3,
                impaction: 3,
                termsOffered: "Spring, Fall, Summer, Winter",
              },
            ],
          },
          {
            term: "SPRING",
            year: 2018,
            status: "in-progress",
            difficulty: 1.5,
            units: 6,
            courses: [
              {
                school: "San Jose State University",
                code: "ENGL001A",
                title: "First Year Writing",
                credit: "3",
                description:
                  "English 1A is an introductory course that prepares students to join scholarly conversations across the university. Students develop reading skills, rhetorical sophistication, and writing styles that give form and coherence to complex ideas for various audiences, using a variety of genres.",
                prerequisites: [],
                corequisites: [],
                difficulty: 3,
                impaction: 3,
                termsOffered: "Spring, Fall, Summer, Winter",
              },
              {
                school: "San Jose State University",
                code: "MATH042",
                title: "Discrete Mathematics",
                credit: "3",
                description:
                  "Sets, logic, methods of proof including mathematical induction, functions, relations, elementary combinatorics, probability, Boolean algebras.",
                prerequisites: [],
                corequisites: [],
                difficulty: 3,
                impaction: 3,
                termsOffered: "Spring, Fall, Summer, Winter",
              },
            ],
          },
        ],
      },
    ];
*/
