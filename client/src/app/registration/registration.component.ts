import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {

  registrationForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', Validators.email),
    password: new FormControl('', Validators.required)
  });

  constructor(private router: Router) { }

  /**
   * Register new user routes to a new page for registration
   */
  register() {
    if(!this.registrationForm.valid) {
      alert('Please fill out all form boxes.');
      return;
    }
  }

  /**
   * Triggers authentication check of user email and password
   */
  login() {
    this.router.navigate(['register']);
  }

}
