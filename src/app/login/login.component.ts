import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CouchdbService } from '../couchdb.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule,FormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  Username: string = '';
  userId:string=''
  Phonenumber: string = '';
  Email: string = '';
  Password: string = '';
  Confirmpassword: string = '';
  NewPassword: string = '';
  ConfirmPassword: string = '';
  flag: boolean = false;
  dob: Date =new Date();
  gender: string = '';
  images: string = '';
  loginDetails: number = 0;
  passwordMismatch: boolean = true;
  otpInvalid: boolean = false;
  otpTouched: boolean = false;
  enteredOTP: string = '';
  generatedOTP: string = '';
  routerVariable=inject(Router)

  // Flags for form toggling
  showRegistrationPage: boolean = false;
  showLoginPage: boolean = true;
  showForgotPasswordPage: boolean = false;
  showOTPPage: boolean = false;
  showNewPasswordPage: boolean = false;

  constructor(private couch: CouchdbService) { }

  // Form toggling methods
  showRegistrationForm() {
    this.showRegistrationPage = true;
    this.showLoginPage = false;
    this.showForgotPasswordPage = false;
    this.showOTPPage = false;
    this.showNewPasswordPage = false;
  }

  showLoginForm() {
    this.showRegistrationPage = false;
    this.showLoginPage = true;
    this.showForgotPasswordPage = false;
    this.showOTPPage = false;
    this.showNewPasswordPage = false;
  }

  showForgotPasswordForm() {
    this.showRegistrationPage = false;
    this.showLoginPage = false;
    this.showForgotPasswordPage = true;
    this.showOTPPage = false;
    this.showNewPasswordPage = false;
  }

  showOTPForm() {
    this.showRegistrationPage = false;
    this.showLoginPage = false;
    this.showForgotPasswordPage = false;
    this.showOTPPage = true;
    this.showNewPasswordPage = false;
  }

  showNewPasswordForm() {
    this.showRegistrationPage = false;
    this.showLoginPage = false;
    this.showForgotPasswordPage = false;
    this.showOTPPage = false;
    this.showNewPasswordPage = true;
  }

  // User Registration
  create() {
    this.couch.getUserDetails().subscribe({
      next: (response: any) => {
        let emailExists = false;

        response.rows.forEach((e: any) => {
          if (e.value.Email === this.Email) {
            emailExists = true;
          }
        });

        if (emailExists) {
          alert('The email address is already in use. Please use a different email.');
        } else {
          const data: any = {
            _id: `user_000_${this.Phonenumber}`,
            username: this.Username,
            phonenumber: this.Phonenumber,
            email: this.Email,
            password: this.Password,
            dob:this.dob,
            images: this.images,
            gender: this.gender,
            loginDetails: this.loginDetails,
            type: 'users',
          };

          
          this.couch.addUser(data).subscribe({
            next: (response) => {
              alert('User added successfully');
              this.resetForm();
              this.showLoginForm();
            },
            error: () => {
              alert('Error occurred while adding user');
            },
          });
          
        }
      },
      error: () => {
        alert('Error occurred while verifying user');
      },
    });
  }

  // User Login
  login() {
    const loginDetails:any={
      _id: `loginDetails_000_${this.Phonenumber}`,
      loginDetails:this.loginDetails,
      dob:this.dob,
      type:'logindetails'
     }

    this.couch.getUserDetails().subscribe({
      next: (response: any) => {
        let status = false;
        console.log(response)
        response.rows.forEach((e: any) => {
          if (e.value.email === this.Email && e.value.password === this.Password) {
            status = true;
            localStorage.setItem(this.userId,e.value._id)
            this.couch.addLoginDetails(loginDetails).subscribe({
              next: (response) => {
                alert('loginDetails added successfully');
                
              },
              error: () => {
                alert('Error occurred loginDetails');
              },
            });
  
            
          }
        });

        if (status) {
          alert('Login successful');
          // Navigate to another page after login
          console.log(localStorage.getItem(this.userId))
          this.routerVariable.navigate(['camera'])
        } else {
          alert('Login failed');
        }
      },
      error: () => {
        alert('Error occurred while verifying user');
      },
    });
  }

  // Generate OTP for Forgot Password
  generateOTP(): string {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    alert(`Your OTP is: ${otp}`);  // Display OTP in alert
    return otp;
  }



  // Handle Forget Password
  ForgetPassword() {
    this.generatedOTP = this.generateOTP(); // Generate OTP
    this.showOTPForm(); // Show OTP form
  }

  // Verify OTP for Forgot Password
  verifyOTP() {
    if (this.enteredOTP === this.generatedOTP) {
      this.showNewPasswordForm(); // Show new password form
    } else {
      this.otpInvalid = true;
      this.otpTouched = true;
    }
  }

  // Reset Password
  resetPassword() {
    if (this.NewPassword === this.ConfirmPassword) {
      // If the passwords match, update the password in the database
      this.couch.getUserDetails().subscribe({
        next: (response: any) => {
          const existData = response.rows.map((user: any) => user.value).find((user: any) => user.email === this.Email)
          const updatedData = { ...existData, password: this.NewPassword }
          console.log(existData);
          console.log(updatedData);
          

          this.couch.updatePassword(existData._id, updatedData).subscribe({
            next: (response: any) => {
              alert('Password reset successful');
              // Hide the password reset page and show the login page
              this.showLoginPage = response.value;
              this.showNewPasswordPage = false;
              this.showLoginPage=true;
            },
            error: (error: any) => {
              alert('Error occurred while resetting the password');
            }
          });
        }
      })
    } else {
      this.passwordMismatch = true;
    }
  }


  // Reset Form
  resetForm() {
    this.Username = '';
    this.Email = '';
    this.Password = ''; 
    this.Confirmpassword = '';
    this.Phonenumber = '';
   
    this.gender = '';
    this.images = '';
  }

}
