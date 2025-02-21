import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { HomeComponent } from './home/home.component';
import { UploadFilesComponent } from './upload-files/upload-files.component';
import { ImageToPdfConvertorComponent } from './image-to-pdf-convertor/image-to-pdf-convertor.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { AccessingCameraComponent } from './accessing-camera/accessing-camera.component';
import { ProfileComponent } from './profile/profile.component';
import { BillsComponent } from './bills/bills.component';

export const routes: Routes = [
    {path:'',component:LandingPageComponent},
    {path:'home',component:HomeComponent},
    {path:'uploadfiles',component:UploadFilesComponent},
    {path:'imagetopdfconvertor',component:ImageToPdfConvertorComponent},
    {path:'login',component:LoginComponent},
    {path:'logout',component:LogoutComponent},
    {path:'accesscamera',component:AccessingCameraComponent},
    {path:'profile',component:ProfileComponent},
    {path:'bills',component:BillsComponent}
];
