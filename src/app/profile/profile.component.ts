import { Component } from '@angular/core';
import { CouchdbService } from '../couchdb.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  constructor(private couch: CouchdbService) { }

  Phonenumber: string = ''
  userId: string = ''
  images: string = ''
  file: File | null = null
  // Add this method in your TestComponent class
  onImageChange(event: any): void {
    this.file = event.target.files[0]; // Get the selected file

    if (this.file) {
      this.couch.addUserAttachment(this.file).subscribe({
        next: (response) => {
          alert('Profile photo uploaded successfully');
        },
        error: (error) => {
          alert('Error uploading the profile photo');
        },
      });
    }
  }

  uploadImage(filename: string, base64Image: string) {
    // Create the attachment object
    const attachment = {
      _id: `user_000_${this.Phonenumber}`,  // User document ID
      image: this.file
    };
    console.log(base64Image);


    // Send the attachment to CouchDB
    this.couch.addUserAttachment(this.file).subscribe({
      next: (response) => {
        alert('Profile photo uploaded successfully');
      },
      error: (error) => {
        alert('Error uploading the profile photo');
      },
    });
  }
  getUserProfilePhoto() {
    const userId = localStorage.getItem('userId');  // Assuming userId is stored in localStorage
    if (userId) {
      this.couch.getUserProfilePhoto(userId).subscribe({
        next: (response) => {
          this.images = response.url; // Or however the image is returned from CouchDB
        },
        error: () => {
          alert('Error fetching profile photo');
        }
      });
    }
  }

}
