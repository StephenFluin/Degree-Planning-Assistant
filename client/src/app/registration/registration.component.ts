import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { User, ConnectionService } from '../connection.service';

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

  constructor(private router: Router, private connectionService: ConnectionService) { }

  /**
   * Register new user, validating input and server response
   */
  onSubmit() {
    if (!this.registrationForm.valid) {
      alert('Please fill out all form boxes.');
      return;
    }

    const userData: User = {
      name: this.registrationForm.value.name,
      email: this.registrationForm.value.email,
      password: this.registrationForm.value.password
    };

    const tokenResult = this.connectionService.login(userData);

    // retrieve token or handle server error
    tokenResult
      .subscribe(
        result => {
          const config = { userToken: result['token'] };
          console.log('HTTP config and response: ', config, result);
          return tokenResult;
        },
        err => {
          console.log('HTTP Error: ', err);
          this.connectionService.handleError(err);
        },
        () => console.log('HTTP request completed.')
      );
  }

  /**
   * Triggers authentication check of user email and password
   */
  routeTologin() {
    this.router.navigate(['login']);
  }

}
