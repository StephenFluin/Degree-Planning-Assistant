import { Component, OnInit } from "@angular/core";
import { UserService, UserProfile } from "../user.service";
import { Observable } from "rxjs";
import { Router } from "@angular/router";

@Component({
  selector: "app-s-profile",
  templateUrl: "./s-profile.component.html",
  styleUrls: ["./s-profile.component.css"]
})
export class SProfileComponent implements OnInit {
  profile: Observable<UserProfile>;
  editProfile: boolean = false;

  constructor(private router: Router, private userService: UserService) {
    this.profile = this.userService.getUserData();
  }

  ngOnInit() {}

  errors: Object = {
    firstNameField: "",
    lastNameField: "",
    emailField: "",
    catalogYearField: "",
    gradTermField: "",
    gradYearField: ""
  };

  switchEditMode() {
    this.editProfile = !this.editProfile;
  }

  onEditProfile() {
    const editProfileForm = document.getElementById("editProfileForm");

    for (const prop in this.errors) {
      document.getElementById(prop).classList.remove("error-text-field");
      const element = document.getElementById(`${prop}Error`);
      element.classList.remove("error");
      element.innerHTML = "";
      this.errors[prop] = "";
    }

    if (editProfileForm) {
      const validateStringInput = element => {
        if (element.value.length > 0) {
          if (new RegExp(/[^a-zA-Z\s]/).test(element.value) === false) {
          } else {
            this.errors[element.name] = "Field contains invalid characters";
          }
        } else {
          this.errors[element.name] = "Field cannot be empty";
        }
      };

      const validateNumInput = element => {
        if (element.value.length > 0) {
          if (isNaN(element.value) === true) {
            this.errors[element.name] = "Field contains invalid characters";
          }
        } else {
          this.errors[element.name] = "Field cannot be empty";
        }
      };

      const objIsEmpty = obj => {
        for (const prop in obj) {
          if (obj[prop].length > 0) {
            return false;
          }
        }

        return true;
      };

      validateStringInput(editProfileForm["firstNameField"]);
      validateStringInput(editProfileForm["lastNameField"]);
      validateStringInput(editProfileForm["gradTermField"]);
      validateNumInput(editProfileForm["catalogYearField"]);
      validateNumInput(editProfileForm["gradYearField"]);

      if (editProfileForm["emailField"].value.length == 0) {
        this.errors["emailField"] = "Field cannot be empty";
      }

      if (objIsEmpty(this.errors) === true) {
        const payload = {
          firstName: editProfileForm["firstNameField"].value,
          lastName: editProfileForm["lastNameField"].value,
          email: editProfileForm["emailField"].value,
          school: "San Jose State University",
          major: "Software Engineering",
          minor: "---",
          bio: editProfileForm["bioField"].value,
          catalogYear: Number(editProfileForm["catalogYearField"].value),
          gradDate: {
            term: editProfileForm["gradTermField"].value,
            year: Number(editProfileForm["gradYearField"].value)
          }
        };

        this.userService.editProfile(payload).subscribe({
          complete: () => {
            this.profile = this.userService.getUserData();
            this.editProfile = false;
          }
        });
      } else {
        for (const prop in this.errors) {
          if (this.errors[prop].length > 0) {
            document
              .getElementById(`${prop}`)
              .classList.add("error-text-field");
            const caption = document.getElementById(`${prop}Error`);
            caption.classList.add("error");
            caption.innerHTML = this.errors[prop];
          }
        }
      }
    }
  }

  onClickBack() {
    this.router.navigate(["dashboard"]);
  }
}
