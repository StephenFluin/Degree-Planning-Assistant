import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-s-degree-plan",
  templateUrl: "./s-degree-plan.component.html",
  styleUrls: ["./s-degree-plan.component.css"]
})
export class SDegreePlanComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  onClickEditPlan() {
    this.router.navigate(["plan-editor"]);
  }
}
