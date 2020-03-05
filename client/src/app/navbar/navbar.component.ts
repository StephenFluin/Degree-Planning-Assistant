import { Component, OnInit, AfterViewInit } from "@angular/core";

import { BreakpointObserver } from "@angular/cdk/layout";
import { UserService } from "../user.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"]
})
export class NavbarComponent implements OnInit {
  isSmallScreen;
  userLoggedIn = false;

  constructor(
    breakpointObserver: BreakpointObserver,
    private userService: UserService,
    private router: Router
  ) {
    this.isSmallScreen = breakpointObserver.isMatched("(max-width: 599px)");
    this.userLoggedIn = this.userService.isLoggedIn();
  }

  ngOnInit() {
    this.userLoggedIn = this.userService.isLoggedIn();
  }

  ngAfterViewInit() {
    this.userLoggedIn = this.userService.isLoggedIn();
  }

  logoutButton() {
    this.userService.logout();
    this.router.navigate(["login"]);
  }
}
