import { Injectable } from "@angular/core";

import { UserService } from "./user.service";

import { map } from "rxjs/operators";

export interface Year {
  beginning: number;
  ending: number;
  semesters: Array<object>;
}

@Injectable({
  providedIn: "root",
})
export class PlanService {
  constructor(private userService: UserService) {}

  /**
   * Formats the user's plan for rendering
   */
  formatPlan() {
    const termsValue = {
      summer: 1,
      fall: 2,
      winter: 3,
      spring: 4,
    };

    const mapCallback = (userData) => {
      if (userData.degreePlanId && userData.degreePlanId.semesters.length > 0) {
        const yearArray = [];
        const { semesters } = userData.degreePlanId;
        semesters.sort((s1, s2) => {
          const num1 =
            s1.year - (termsValue[s1.term.toLowerCase()] > 2 ? 1 : 0);
          const num2 =
            s2.year - (termsValue[s2.term.toLowerCase()] > 2 ? 1 : 0);
          if (num1 === num2) {
            return (
              termsValue[s1.term.toLowerCase()] -
              termsValue[s2.term.toLowerCase()]
            );
          } else {
            return num1 - num2;
          }
        });

        let yearCounter = 0;
        semesters.forEach((semester) => {
          let creditSum = 0;
          let difficultySum = 0;
          let impactionSum = 0;
          semester.courses.forEach((course) => {
            creditSum += Number(course.credit);
            difficultySum += course.difficulty;
            impactionSum += course.impaction;
          });

          const numOfCourses = semester.courses.length;
          let semesterDifficulty = 0;
          let difficultyModifier = 0;

          if (numOfCourses === 1) {
            difficultyModifier = 0.25;
          } else if (numOfCourses === 2) {
            difficultyModifier = 0.5;
          } else if (numOfCourses === 3) {
            difficultyModifier = 0.75;
          } else {
            difficultyModifier = 1.0;
          }

          semesterDifficulty =
            (difficultySum / numOfCourses) * difficultyModifier;

          const currentYear =
            semester.year -
            (termsValue[semester.term.toLowerCase()] > 2 ? 1 : 0);
          if (currentYear > yearCounter) {
            const newYear = {
              beginning: currentYear,
              ending: currentYear + 1,
              semesters: [
                {
                  ...semester,
                  units: creditSum,
                  difficulty: semesterDifficulty,
                },
              ],
            } as Year;
            yearArray.push(newYear);
            yearCounter = currentYear;
          } else {
            yearArray[yearArray.length - 1].semesters.push({
              ...semester,
              units: creditSum,
              difficulty: semesterDifficulty,
            });
          }
        });

        return yearArray;
      }
      return [];
    };

    return this.userService.getUserData().pipe(map(mapCallback));
  }
}
