import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-testnb',
  templateUrl: './testnb.component.html',
  styleUrls: ['./testnb.component.css']
})
export class TestnbComponent implements OnInit {

  @Input() testnb: number;
  @Input() testtitle: string;

  constructor() { }

  ngOnInit() {
  }

}
