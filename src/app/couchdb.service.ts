import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CouchdbService {

  readonly baseURL = 'https://192.168.57.185:5984/scano';

  readonly userName = 'd_couchdb';
  readonly password = 'Welcome#2';


  constructor(private http: HttpClient) { }

  private headers = new HttpHeaders({
    'Authorization': 'Basic ' + btoa(this.userName + ':' + this.password),
    'Content-type': 'application/json'
  });

  addUser(data: any) {
    return this.http.post<any>(this.baseURL, data, { headers: this.headers });
  }
  profileUpdate(id:string,data:any){
    return this.http.put<any>(`${this.baseURL}/${id}`,data, { headers: this.headers })
  }
  addLoginDetails(data: any) {
    return this.http.post<any>(this.baseURL, data, { headers: this.headers });
  }
  getUserDetails(): any {
    return this.http.get(`https://192.168.57.185:5984/scano/_design/view/_view/Users`, { headers: this.headers });
  }
  getUserDetailById(_id: string) {
    return this.http.get<any>(`https://192.168.57.185:5984/scano/_design/view/_view/Users?key="${_id}"`, { headers: this.headers });
  }

  updatePassword(_id: string, data: any) {
    // Fetch the user's current data from CouchDB
    return this.http.put<any>(`https://192.168.57.185:5984/scano/${_id}`, data, { headers: this.headers });
  }


  addUserAttachment(data: any) {
    const userDocId = data._id; // Assuming data contains the user ID
    console.log("service ", data);

    // Construct the URL to the user's document
    const url = `https://192.168.57.185:5984/scano/56cbc35e9b2f4749b042e2833d0e6638?rev=1-967a00dff5e02add41819138abb3284d`;

    // Send the attachment to CouchDB
    const formData = new FormData();
    formData.append('file', data, data.name);

    return this.http.put(url, formData, { headers: this.headers });
  }

  getUserProfilePhoto(userId: string) {
    // URL to fetch user profile photo attachment from CouchDB
    const imageUrl = `https://192.168.57.185:5984/scano/_design/view/_view/Users/${userId}/profilePhoto`;

    return this.http.get<any>(imageUrl, { headers: this.headers });
  }
  updateUser(userId: string, updatedData: any) {
    console.log(userId);

    return this.http.put<any>(`https://192.168.57.185:5984/scano/${userId}`, updatedData, { headers: this.headers });
  }
  validateUserByEmail(email: string) {
    return this.http.get<any>(`https://192.168.57.185:5984/scano/_design/view/_view/authenticatebyemail?key="${email}"`, { headers: this.headers });
  }

  getUserDetailsById(userId: any) {
    return this.http.get<any>(`https://192.168.57.185:5984/scano/_design/view/_view/Users?include_docs=true&userId="${userId}"`, { headers: this.headers });
  }

  add_document(document_data: any) {
    const url = `${this.baseURL}`;
    return this.http.post<any>(url, document_data, { headers: this.headers })
  }

  // Fetch all documents from the database
  get_document() {
    const url = `${this.baseURL}/_design/view/_view/Documents?include_docs=true&attachments=true`;
    return this.http.get<any>(url, { headers: this.headers })
  }
}
