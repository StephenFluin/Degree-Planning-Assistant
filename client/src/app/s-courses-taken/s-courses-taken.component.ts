import { Component, OnInit } from "@angular/core";
import { UserService, UserProfile } from "../user.service";
import { Observable } from "rxjs";
import { CourseData, CourseService } from "../course.service";

@Component({
  selector: "app-s-courses-taken",
  templateUrl: "./s-courses-taken.component.html",
  styleUrls: ["./s-courses-taken.component.css"]
})
export class SCoursesTakenComponent implements OnInit {
  profile: Observable<UserProfile>;
  showModal = false;
  modalData: string;
  currentCourse: Observable<CourseData>;
  constructor(
    private userService: UserService,
    private courseService: CourseService
  ) {
    this.profile = this.userService.getProfile("coursesTaken");
  }

  /**
   * Recieve a boolean from the child component ModalComponent
   * to determine if the modal is closed.
   * @param $event
   */
  modalStatus($event) {
    console.log("The event: ", $event);
    this.showModal = $event;
  }

  getmodalData($event) {
    console.log("The data event: ", $event);
    this.modalData = $event;
  }

  displayCourseInfo(courseId: string) {
    console.log("Display course info: ", courseId);
    this.currentCourse = this.courseService.getCourseById(courseId);
    this.showModal = true;
  }

  ngOnInit() {}
}
