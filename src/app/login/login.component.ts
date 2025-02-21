import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CouchdbService } from '../couchdb.service';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginTimes: string = '';
  Username: string = '';

  Phonenumber: string = '';
  Email: string = '';
  Password: string = '';
  userid: string = '';
  Confirmpassword: string = '';
  firstname: string = '';
  lastname: string = '';
  NewPassword: string = '';
  ConfirmPassword: string = '';
  flag: boolean = false;
  dob: Date = new Date();
  gender: string = '';
  images: string = '';
  loginDetails: string = '';
  passwordMismatch: boolean = true;
  otpInvalid: boolean = false;
  otpTouched: boolean = false;
  enteredOTP: string = '';
  generatedOTP: string = '';
  routerVariable = inject(Router)

  // Flags for form toggling
  showRegistrationPage: boolean = false;
  showLoginPage: boolean = true;
  showForgotPasswordPage: boolean = false;
  showOTPPage: boolean = false;
  showNewPasswordPage: boolean = false;

  generateuuid() {
    this.userid = `user_2_${uuidv4()}`

    console.log("inside the generateuuid");
    console.log(this.userid);


  }
  generateuuidlogin() {
    this.loginTimes = `logindetails_2_${uuidv4()}`
    console.log("inside the generateuuidlogin");
    console.log(this.loginTimes);


  }
  generateuuidlogindetails() {
    this.loginDetails = uuidv4()
  }
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
          this.generateuuid()
          this.generateuuidlogindetails()
          const data: any = {
            _id: this.userid,
            data: {
              username: this.Username,
              phonenumber: this.Phonenumber,
              email: this.Email,
              password: this.Password,
              dob: this.dob,
              images: this.images,
              gender: this.gender,
              loginDetails: this.Email,
              firstname: this.firstname,
              lastname: this.lastname,
              type: 'users',
            }
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
    this.generateuuidlogin()
    const loginDetails: any = {
      _id: this.loginTimes,
      data: {
        loginDetails: this.Email,
        dob: this.dob,
        type: "logindetails"
      }
    }

    this.couch.validateUserByEmail(this.Email).subscribe({
      next: (response: any) => {
        let status = false;
        console.log(response)
        response.rows.forEach((e: any) => {
          if (e.value.data.email === this.Email && e.value.data.password === this.Password) {
            status = true;
            localStorage.setItem("userId", e.value._id)
            console.log(this.userid)
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
          console.log(localStorage.getItem(this.userid))
          this.routerVariable.navigate(['home'])
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
    }
  }

  // Reset Password
  resetPassword() {
    if (this.NewPassword === this.ConfirmPassword) {
      // If the passwords match, update the password in the database
      this.couch.getUserDetails().subscribe({
        next: (response: any) => {
          const existData = response.rows.map((user: any) => user.value).find((user: any) => user.data.email === this.Email)
          const updatedData = { ...existData.data, password: this.NewPassword }
          console.log(existData);
          console.log(updatedData);
          console.log({ ...existData, updatedData });
          


          this.couch.updatePassword(existData._id, { ...existData, data:updatedData }).subscribe({
            next: (response: any) => {
              alert('Password reset successful');
              // Hide the password reset page and show the login page
              this.showLoginPage = response.value;
              this.showNewPasswordPage = false;
              this.showLoginPage = true;
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
