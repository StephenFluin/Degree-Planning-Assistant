import { Component, OnInit } from "@angular/core";
import { UserService, UserProfile } from "../user.service";
import { Observable } from "rxjs";

@Component({
  selector: "app-s-profile",
  templateUrl: "./s-profile.component.html",
  styleUrls: ["./s-profile.component.css"]
})
export class SProfileComponent implements OnInit {
  // profile: Observable<UserProfile>;
  profile = {
    firstName: "Dale Christian",
    lastName: "Seen",
    major: "Software Engineering",
    minor: "---",
    school: "San Jose State University",
    email: "Dale.Seen@gmail.com",
    catalogYear: 2017,
    expectedGradTerm: "Spring",
    expectedGradYear: 2020,
    bio: "Kimi no sei, Kimi no sei, Kimi no sei!"
  };

  constructor(private userService: UserService) {
    // TODO: Set profile to refer to profile in userService
    // this.profile = this.userService.getProfile();
  }

  ngOnInit() {}
}
