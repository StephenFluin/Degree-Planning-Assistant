import { Component, OnInit } from "@angular/core";
import { UserService, UserProfile } from "../user.service";
import { ErrorHandlerService } from "../error-handler.service";
import { Observable } from "rxjs";

@Component({
  selector: "app-s-courses-taken",
  templateUrl: "./s-courses-taken.component.html",
  styleUrls: ["./s-courses-taken.component.css"]
})
export class SCoursesTakenComponent implements OnInit {
  profile: Observable<UserProfile>;
  constructor(private userService: UserService) {
    this.profile = this.userService.getProfile();
  }

  ngOnInit() {}
}
