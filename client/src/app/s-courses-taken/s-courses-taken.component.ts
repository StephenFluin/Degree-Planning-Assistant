import { Component, OnInit } from "@angular/core";
import { ConnectionService } from "../connection.service";

@Component({
  selector: "app-s-courses-taken",
  templateUrl: "./s-courses-taken.component.html",
  styleUrls: ["./s-courses-taken.component.css"]
})
export class SCoursesTakenComponent implements OnInit {
  constructor(private connectionService: ConnectionService) {}

  ngOnInit() {}
}
