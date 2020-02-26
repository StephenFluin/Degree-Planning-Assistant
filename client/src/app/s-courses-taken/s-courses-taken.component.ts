import { Component, OnInit } from "@angular/core";
import { UserService } from "../user.service";
import { CourseService } from "../course.service";
import { ErrorHandlerService } from "../error-handler.service";

@Component({
  selector: "app-s-courses-taken",
  templateUrl: "./s-courses-taken.component.html",
  styleUrls: ["./s-courses-taken.component.css"]
})
export class SCoursesTakenComponent implements OnInit {
  coursesTaken;
  constructor(
    private userService: UserService,
    private courseService: CourseService,
    private errorHandler: ErrorHandlerService
  ) {
    this.coursesTaken = courseService.getAllCourses();
  }

  ngOnInit() {}

  getCurrentProfile() {
    const profileObs = this.userService.getProfile();

    // retrieve token or handle server error
    profileObs.subscribe(
      result => {
        // HTTP result: config and data:
        console.log("Profile result: ", result);
        return result;
      },
      err => {
        // HTTP error
        this.errorHandler.handleError(err);
      },
      () => {
        // HTTP request completed
        console.log("Profile data: ", profileObs);
      }
    );

    console.log("obser", profileObs);
  }

  addCourse() {}
}