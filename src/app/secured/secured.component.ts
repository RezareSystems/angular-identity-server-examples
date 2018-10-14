import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserProfileService } from '../services/user-profile.service';

@Component({
  selector: 'app-secured',
  templateUrl: './secured.component.html',
  styleUrls: ['./secured.component.css']
})
export class SecuredComponent implements OnInit {

  userData$: Observable<any>;

  constructor(private userService: UserProfileService) { }

  ngOnInit() {
    this.userData$ = this.userService.currentUser$;
  }

}
