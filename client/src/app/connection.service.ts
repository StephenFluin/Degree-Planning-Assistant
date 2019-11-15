import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError, Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  EMAIL_IS_EMPTY, EMAIL_IS_IN_WRONG_FORMAT, PASSWORD_IS_EMPTY,
  PASSWORD_LENGTH_MUST_BE_MORE_THAN_8, WRONG_PASSWORD, SOME_THING_WENT_WRONG,
  USER_NAME_IS_EMPTY, ROLE_IS_EMPTY, USER_EXISTS_ALREADY, USER_DOES_NOT_EXIST,
  TOKEN_IS_EMPTY, NAME_IS_INVALID
} from './constant';

export interface User {
  name?: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  uri = 'http://localhost:8080';

  // Accreditted to https://jasonwatmore.com/post/2019/06/22/angular-8-jwt-authentication-example-tutorial
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<User>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  /**
   * Register a new user
   * @param userData
   */
  create_new_user(userData: User) {
    return this.http.post(`${this.uri}/register`, userData);
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  /**
   * Login an existing user
   * @param userData
   */
  login(userData: User): Observable<any> {
    return this.http.post(`${this.uri}/login`, userData)
      .pipe(map(userDetails => {
        localStorage.setItem('currentUser', JSON.stringify(userDetails));
        this.currentUserSubject.next(userDetails);
        return userDetails;
      }));
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  /**
   * Handle server errors
   * @param err
   */
  handleError(err) {
    const errObj = err.error.errors;
    let errorMessage = '';

    for (const prop in errObj) {
      if (errObj.hasOwnProperty(prop)) {
        const propMsg = errObj[prop].msg;
        errorMessage += this.findErrorType(propMsg);
      }
    }

    window.alert(errorMessage);
    return throwError(errorMessage);
  }

  /**
   * Match err to the error type and alert user
   * @param err
   */
  findErrorType(errMsg): string {
    console.log('This is the error: ', errMsg);

    let resultString = '';

    switch (errMsg) {
      case USER_NAME_IS_EMPTY:
        resultString += 'No username was entered./n';
        break;
      case ROLE_IS_EMPTY:
        resultString += 'A role has not been assigned to this User.';
        break;
      case EMAIL_IS_EMPTY:
        resultString += 'No email was entered.\n';
        break;
      case EMAIL_IS_IN_WRONG_FORMAT:
        resultString += 'Email is not in the correct format.\n';
        break;
      case PASSWORD_IS_EMPTY:
        resultString += 'No password was entered.\n';
        break;
      case PASSWORD_LENGTH_MUST_BE_MORE_THAN_8:
        resultString += 'Password must be 8 characters or longer.\n';
        break;
      case WRONG_PASSWORD:
        resultString += 'Incorrect email or password. Please try again.\n';
        break;
      case USER_EXISTS_ALREADY:
        resultString += 'Please login to access this feature.';
        break;
      case USER_DOES_NOT_EXIST:
        resultString += 'This email is already taken./n';
        break;
      // user trying to access restricted feature
      case TOKEN_IS_EMPTY:
        break;
      case NAME_IS_INVALID:
        resultString += 'Name is invalid';
        break;
      case SOME_THING_WENT_WRONG:
        resultString = 'Something went wrong./n';
        break;
      default:
        resultString = 'Something went wrong./n';
        break;
    }
    return resultString;
  }
}


