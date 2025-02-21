import { Component } from '@angular/core';
import { CouchdbService } from '../couchdb.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  constructor(private couch: CouchdbService) { }
  profileDetail: any = {}
  Phonenumber: string = ''
  userId: string = ''
  images: string = ''
  file: File | null = null
  firstname: string = ''
  lastname: string = ''
  email: string = ''
  gender: string = ''
  phone: string = ''
  username: string = ''
  isDidableEditing: boolean = true;

  // Add this method in your TestComponent class
  ngOnInit() {
    this.userId = localStorage.getItem("userId")!
    console.log(this.userId);

    console.log(this.userId)
    this.couch.getUserDetailById(this.userId).subscribe({
      next: (response: any) => {
        console.log(response)
        this.profileDetail = response.rows[0].value
        this.email = this.profileDetail.data.email
        this.username = this.profileDetail.data.username
        this.gender=this.profileDetail.data.gender
        this.phone=this.profileDetail.data.phone
        this.firstname=this.profileDetail.data.firstname
        this.lastname=this.profileDetail.data.lastname
        this.phone = this.profileDetail.data.phonenumber
        this.images=this.profileDetail.data.images


      }
    })

  }
  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.images = reader.result as string; // Set image as base64 string
      };
      reader.readAsDataURL(file);
    }
  }

  // uploadImage(filename: string, base64Image: string) {

  //   const attachment = {
  //     _id: `user_000_${this.Phonenumber}`,  
  //     image: this.file
  //   };
  //   console.log(base64Image);


  //   this.couch.addUserAttachment(this.file).subscribe({
  //     next: (response) => {
  //       alert('Profile photo uploaded successfully');
  //     },
  //     error: (error) => {
  //       alert('Error uploading the profile photo');
  //     },
  //   });
  // }
  // getUserProfilePhoto() {
  //   const userId = localStorage.getItem('userId');  // Assuming userId is stored in localStorage
  //   if (userId) {
  //     this.couch.getUserProfilePhoto(userId).subscribe({
  //       next: (response) => {
  //         console.log(response)
  //         this.images = response.url; // Or however the image is returned from CouchDB
  //       },
  //       error: () => {
  //         alert('Error fetching profile photo');
  //       }
  //     });
  //   }
  // }
  saveDetail() {
    console.log(this.profileDetail);
    
    const data = {
      ...this.profileDetail,
      data: {
        ...this.profileDetail.data,
        gender:this.gender,
        firstname:this.firstname,
        lastname:this.lastname,
        phone:this.phone,
        username:this.username,
        images:this.images

      }
      
      }
      this.couch.profileUpdate(this.profileDetail._id,data).subscribe({
        next:(response)=>{
          alert('update successfully')

        },
        error: () => {
          alert('Error ');
        },
      });
      this.isDidableEditing = false;
  }
  editProfile(){
    this.isDidableEditing = false;

  }
}
