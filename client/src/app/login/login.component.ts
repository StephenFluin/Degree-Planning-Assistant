import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', Validators.email),
    password: new FormControl('', Validators.required)
  });

  constructor(private router: Router) { }

   /**
   * Triggers authentication check of user email and password
   */
  login() {
    if(!this.loginForm.valid) {
      alert('Please fill out all form boxes.');
      return;
    }
  }

  /**
   * Register new user routes to a new page for registration
   */
  register() {
    this.router.navigate(['registration']);
  }

}
