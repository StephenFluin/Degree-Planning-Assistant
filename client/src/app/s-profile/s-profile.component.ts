import { Component, OnInit } from "@angular/core";
import { UserService } from "../user.service";

@Component({
  selector: "app-s-profile",
  templateUrl: "./s-profile.component.html",
  styleUrls: ["./s-profile.component.css"]
})
export class SProfileComponent implements OnInit {
  // profile: Observable<UserProfile>;

  // Temp placeholders
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
    bio: "bruh I eat there like once a week."
  };

  editProfile: boolean = false;

  switchEditMode() {
    this.editProfile = !this.editProfile;
  }

  onEditProfile() {
    const editProfileForm = document.getElementById("editProfileForm");

    if (editProfileForm) {
      const payload = {
        firstName: editProfileForm["firstNameField"].value,
        lastName: editProfileForm["lastNameField"].value,
        email: editProfileForm["emailField"].value,
        school: "San Jose State University",
        major: "Software Engineering",
        minor: "---",
        bio: editProfileForm["bioField"].value,
        gradDate: `${editProfileForm["gradTermField"].value} ${editProfileForm["gradYearField"].value}`
      };

      console.log(payload);

      // TODO: Call backend to edit profile c:
    }
  }

  constructor(private userService: UserService) {
    // TODO: Set profile to refer to profile in userService
    // this.profile = this.userService.getProfile();
  }

  ngOnInit() {}
}
