import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { catchError, tap, take } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public form: FormGroup;

  public error: string;

  constructor(fb: FormBuilder, private authService: AuthService) {
    this.form = fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {}

  public onSubmit() {
    if (this.form.valid) {
      this.authService
        .login(this.form.value.username, this.form.value.password)
        .pipe(
          take(1),
          catchError(error => (this.error = error.toString()))
        )
        .subscribe();
    }
  }
}
