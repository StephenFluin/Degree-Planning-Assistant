import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-s-degree-plan-editor",
  templateUrl: "./s-degree-plan-editor.component.html",
  styleUrls: ["./s-degree-plan-editor.component.css"],
})
export class SDegreePlanEditorComponent implements OnInit {
  newSemesterIsActive: boolean;

  newSemesterTermField: string;
  newSemesterYearField: number;

  constructor() {
    this.newSemesterIsActive = false;
  }

  ngOnInit() {}

  onClickNewSemester() {
    this.newSemesterIsActive = !this.newSemesterIsActive;
  }
}
