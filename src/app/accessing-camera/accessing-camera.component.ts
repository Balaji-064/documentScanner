import { CommonModule } from '@angular/common';

import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import * as Tesseract from 'tesseract.js';

import * as cv from '@techstark/opencv-js';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-accessing-camera',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './accessing-camera.component.html',
  styleUrl: './accessing-camera.component.css'
})
export class AccessingCameraComponent {
  @ViewChild('video') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;
  userPrompt!: string;
  userMessage: string = '';  // Model for user input
  messages: { sender: string, ai: string }[] = [];  // Array to store messages

  // Send message function



  streamedOutput: string = '';
  constructor(private http: HttpClient) { }

  generateResponse() {

    const serverUrl = 'http://localhost:3001/query';
    const payload = { prompt: this.userPrompt };

    this.http.post(serverUrl, payload, { responseType: 'text' }).subscribe(
      (data: string) => {
        console.log('Received data:', data);
        this.streamedOutput = data;
        console.log(this.streamedOutput);
        this.messages.push({ sender: payload.prompt, ai: this.streamedOutput });
        console.log("messages: ", this.messages);


      },
      (error) => {
        console.error('Error fetching response:', error);
        alert('Failed to fetch data from server.');
      }
    );

    this.userPrompt = '';
  }




  capturedPhoto: string | null = null;
  croppedImage: string = "";
  private stream!: MediaStream;
  private context!: CanvasRenderingContext2D;
  extractedText: string = '';
  textExtracted: string = '';

  private startX: number = 0;
  private startY: number = 0;
  private width: number = 0;
  private height: number = 0;
  private isDrawing: boolean = false;

  ngOnInit(): void {
    this.initializeCamera();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  async initializeCamera(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement.nativeElement.srcObject = this.stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }


  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());

    }
  }

  capturePhoto(): void {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.capturedPhoto = canvas.toDataURL('image/png');
      this.context = context;
      console.log("Captured photo: ", this.capturedPhoto);
    }
  }

  // Handle mouse events for drawing the cropping rectangle
  onMouseDown(event: MouseEvent): void {
    this.isDrawing = true;
    this.startX = event.offsetX;
    this.startY = event.offsetY;
    console.log('Mouse Down:', this.startX, this.startY);
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDrawing) return;

    const canvas = this.canvasElement.nativeElement;
    const context = this.context;

    this.width = event.offsetX - this.startX;
    this.height = event.offsetY - this.startY;

    // Draw the image and the cropping rectangle
    const image = new Image();
    image.src = this.capturedPhoto!;

    image.onload = () => {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      context.strokeStyle = 'green';
      context.lineWidth = 2;
      context.strokeRect(this.startX, this.startY, this.width, this.height);
    };

    console.log('Mouse Move:', { x: event.offsetX, y: event.offsetY, width: this.width, height: this.height });
  }

  onMouseUp(event: MouseEvent): void {
    this.isDrawing = false;
    console.log('Mouse Up:', { x: this.startX, y: this.startY, width: this.width, height: this.height });
  }

  cropImage(): void {
    const canvas = this.canvasElement.nativeElement;
    const croppedCanvas = document.createElement('canvas');
    const croppedContext = croppedCanvas.getContext('2d')!;

    if (this.width === 0 || this.height === 0) {
      console.error('Invalid crop area');
      return;
    } else {
      console.log(this.width + " " + this.height);
    }

    // Create a cropped canvas with the selected area
    croppedCanvas.width = Math.abs(this.width);
    croppedCanvas.height = Math.abs(this.height);

    // Draw the cropped portion of the image
    croppedContext.drawImage(
      canvas,
      this.startX, this.startY, this.width, this.height, // Source rectangle
      0, 0, Math.abs(this.width), Math.abs(this.height) // Destination rectangle
    );

    this.croppedImage = croppedCanvas.toDataURL('image/png'); // Set the cropped image as base64
    console.log('Cropped Image Data URL:', this.croppedImage, croppedCanvas); // Check the cropped image data URL

    // Enhance the quality of the cropped image

  }

  // Preprocess Image for better OCR accuracy
  async preprocessImage(imageData: string, factor: number): Promise<string> {
    const img = new Image();
    img.src = imageData;
    await new Promise(resolve => img.onload = resolve);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    // Convert image to OpenCV Mat
    const src = cv.imread(canvas);
    const dst = new cv.Mat();

    // Apply bilateral filter for noise reduction
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    cv.bilateralFilter(src, dst, 9, 75, 75, cv.BORDER_DEFAULT);

    // Apply CLAHE for contrast improvement
    const clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
    clahe.apply(dst, dst);

    // Apply thresholding
    cv.threshold(dst, dst, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

    // Apply morphological operations to further clean the image
    const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2, 2));
    cv.morphologyEx(dst, dst, cv.MORPH_CLOSE, kernel);

    // Convert back to imageData
    cv.imshow(canvas, dst);
    const preprocessedImage = canvas.toDataURL('image/png');

    // Cleanup
    src.delete();
    dst.delete();
    clahe.delete();
    kernel.delete();

    return preprocessedImage
  }

  // Function to extract text using Tesseract.js
  extractTextFromImage(imageData: string): void {
    if (!imageData) {
      console.error("No image data to process for OCR");
      return;
    }

    console.log("Image : " + imageData);

    // Use Tesseract.js to recognize text from the image
    Tesseract.recognize(
      imageData,  // Base64 encoded image data
      'eng', // Language (English)
      {
        langPath: 'assets/tesseract/eng.traineddata',
        logger: (m) => console.log("OCR Progress: ", m),  // Logger for Tesseract's progress
      }
    ).then(({ data: { text } }) => {
      console.log('OCR Text:', text);  // Print recognized text
      this.extractedText = text;
      alert(this.extractedText);
      // Show the text in an alert (or use another method to display)
    }).catch((err) => {
      console.error("OCR Error: ", err);
    });
  }

}
