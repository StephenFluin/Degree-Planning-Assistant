import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface UserData {
  name?: string;
  email: string;
  password: string;
}

export interface UserProfile {
  first_name?: string;
  last_name?: string;
  bio?: string;
  courses_taken?: [];
  grad_date?: {
    year?: number;
    term?: string;
  };
  major?: string;
  minor?: string;
  catalog_year?: number;
}

@Injectable({
  providedIn: "root"
})
export class UserService {
  uri = "http://localhost:8080";
  tokenKey = "tokenKey";

  constructor(private http: HttpClient) {}

  /**
   * Register a new user
   * @param user
   */
  create_new_user(user: UserData) {
    return this.http.post(`${this.uri}/register`, user);
  }

  /**
   * Login an existing user
   * @param user
   */
  login(user: UserData): Observable<any> {
    return this.http.post(`${this.uri}/login`, user).pipe(
      map(userDetails => {
        localStorage.setItem(this.tokenKey, userDetails["token"]);
        return userDetails;
      })
    );
  }

  /**
   * See if a user is currently logged in
   */
  getCurrentStorageStatus(): string {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * For checking if someone is logged in
   */
  isLoggedIn(): boolean {
    if (this.getCurrentStorageStatus() != null) {
      return true;
    }
    return false;
  }

  /**
   * Logout a user
   */
  logout() {
    localStorage.removeItem(this.tokenKey);
  }

  getHttpHeaders() {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.getCurrentStorageStatus()
      })
    };
    return httpOptions;
  }

  /**
   * Get courses taken by user
   */
  getProfile() {
    return this.http.get<UserProfile>(
      `${this.uri}/profile/`,
      this.getHttpHeaders()
    );
  }

  /**
   * Update courses taken
   */
  addToCoursesTaken(coursesTaken: []) {
    return this.http.put(
      `${this.uri}/coursesTaken/`,
      coursesTaken,
      this.getHttpHeaders()
    );
  }
}
