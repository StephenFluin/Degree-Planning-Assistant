import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { User, ConnectionService } from '../connection.service';
import { first } from 'rxjs/operators';

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

  constructor(private router: Router, private connectionService: ConnectionService) { }

  /**
   * Login existing user, validating input and server response
   */
  onSubmit() {
    if (!this.loginForm.valid) {
      alert('Please fill out all form boxes.');
      return;
    }

    const userData: User = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    // const tokenResult = this.connectionService.login(userData);

    // // retrieve token or handle server error
    // tokenResult
    //   .subscribe(
    //     result => {
    //       const config = { userToken: result['token'] };
    //       console.log('HTTP config and response: ', config, result);
    //       return tokenResult;
    //     },
    //     err => {
    //       console.log('HTTP Error: ', err);
    //       this.connectionService.handleError(err);
    //     },
    //     () => console.log('HTTP request completed.')
    //   );



    this.connectionService.login(userData)
      .pipe(first())
      .subscribe(
        data => {
          console.log('Result: ', data);
          window.alert('Success!');
          // this.router.navigate(['/']);
        },
        err => {
          console.log('HTTP Error: ', err);
          window.alert('Failure');
        });
  }

  /**
   * Register new user routes to a new page for registration
   */
  routeToRegister() {
    this.router.navigate(['register']);
  }

}
