import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {

  constructor(private a: AuthService, private router: Router) { }

  ngOnInit() {
  }


  onClick() {
    this.a.logout();
    this.router.navigateByUrl('main')
  }
}
