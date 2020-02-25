import { Component, OnInit } from "@angular/core";
import { UserService } from "../user.service";
import { CourseService } from "../course.service";

@Component({
  selector: "app-s-courses-taken",
  templateUrl: "./s-courses-taken.component.html",
  styleUrls: ["./s-courses-taken.component.css"]
})
export class SCoursesTakenComponent implements OnInit {
  coursesTaken;
  constructor(
    private userService: UserService,
    private courseService: CourseService
  ) {
    this.coursesTaken = courseService.getAllCourses();
  }

  ngOnInit() {}
}
