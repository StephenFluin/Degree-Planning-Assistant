import { Component, OnInit, Input } from "@angular/core";
import { UserService, UserProfile } from "../user.service";
import { Observable } from "rxjs";
import { CourseService, CourseData } from "../course.service";
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-s-courses-taken",
  templateUrl: "./s-courses-taken.component.html",
  styleUrls: ["./s-courses-taken.component.css"],
})
export class SCoursesTakenComponent implements OnInit {
  profile: Observable<UserProfile>;
  allCourses: Observable<CourseData[]>;
  showModal = false;
  modalData: string;
  openPanel = false;
  searchResults: Observable<CourseData[]>;
  listOfCourses: CourseData[] = [];

  searchForm = new FormGroup({
    searchTerm: new FormControl("", [Validators.required]),
  });

  visible = true;
  selectable = true;
  removable = true;

  constructor(
    private userService: UserService,
    private courseService: CourseService
  ) {
    this.profile = this.userService.getUserData();
    this.courseService.fetchAllCourses("sjsu");
    this.allCourses = this.courseService.getAllCourses();
  }

  remove(course: CourseData): void {
    const index = this.listOfCourses.indexOf(course);

    if (index >= 0) {
      this.listOfCourses.splice(index, 1);
    }
    console.log(this.listOfCourses);
    this.selectable = false;
  }

  @Input() set hasNewProfile(event: Event) {
    if (event) {
      this.userService.fetchUserData(true);
      this.profile = this.userService.getUserData();
      this.openPanel = true;
    }
  }

  onSearch() {
    if (!this.searchForm.valid) {
      // alert("Please enter in a search.");
      return;
    }
    this.searchResults = this.courseService.searchCourses(
      this.searchForm.value.searchTerm
    );
    this.searchForm.reset();
  }

  addToListOfCourses(course: CourseData) {
    if (!this.listOfCourses.includes(course)) {
      this.listOfCourses.push(course);
    }
    console.log(this.listOfCourses);
  }

  saveToUserProfile(courses: CourseData[]) {}

  /**
   * Recieve a boolean from the child component ModalComponent
   * to determine if the modal is closed.
   * @param $event
   */
  modalStatus($event) {
    console.log("The event: ", $event);
    this.showModal = $event;
  }

  getModalData($event) {
    console.log("The data event: ", $event);
    this.modalData = $event;
  }

  ngOnInit() {}
}
