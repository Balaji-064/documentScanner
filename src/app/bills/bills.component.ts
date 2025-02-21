import { Component } from '@angular/core';
import { CouchdbService } from '../couchdb.service';
import FileSaver from 'file-saver';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [FormsModule,RouterModule,CommonModule],
  templateUrl: './bills.component.html',
  styleUrl: './bills.component.css'
})
export class BillsComponent {
  document_name: string = '';
  email:string='balaji@gmail.com';
  
  
  
  selectedFile: File | null = null;
  
  getdata: any[] = [];
  selectedDocumentContent: string | null = null;
  today=new Date;
  selectedsummarizedcontent: any;

  constructor(private data:CouchdbService) {}

  ngOnInit(): void {
    this.getDocuments(); // Fetch data on initialization
  }

  // Handle file selection
  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  // Add document to the database (PDF, DOCX, TXT)


  // Fetch all documents
  getDocuments(): void {
    this.data.get_document().subscribe({
     
          next: (response: any) => {
            if (response && response.rows) {
           
      
              this.getdata = response.rows.map((row: any, index: number) => {
                // Extract attachment details
                const attachments = row.doc.data._attachments || {};
                const attachmentKeys = Object.keys(attachments);
      
                let fileContent = null;
                let fileType = null;
      
                if (attachmentKeys.length > 0) {
                  const firstAttachmentKey = attachmentKeys[0]; // Assuming single attachment
                  const firstAttachment = attachments[firstAttachmentKey];
      
                  fileType = firstAttachment.content_type; // Get file type
      
                  if (firstAttachment.data) {
                    fileContent = firstAttachment.data; 
                    console.log(fileContent);
                    // Extract base64 content
                  }
                }
      
                return {
                  index: index + 1,
                  document_name: row.doc.data.uploaded_document_name || attachmentKeys[0] || 'Unknown',
                  summarized_text_name: row.doc.data.summarized_document_name || 'No summary available',
                  summarized_document_content:row.doc.data.summarized_document_content,
                  date: row.doc.data.date || 'N/A',
                  file: fileContent, // Store the base64 file content
                  fileType: fileType, // Store the file type
                };
              });
      
              console.log(this.getdata); // Debugging
            } else {
              this.getdata = [];
            }
          },
          error: (error) => {
            console.error('Error fetching documents:', error);
            alert('An error occurred while fetching documents.');
          }
        });
      }
// Retrieve and display the content
displayContent(document: any): void {
  console.log("inside the display")

  this.selectedsummarizedcontent=document
  if (!document.file || !document.file.content) {
    this.selectedDocumentContent = 'No content available for this document.';
    return;
  }

  try {
    console.log("inside the try");
    
    const base64Content = document.split(',')[1]; // Remove the base64 prefix
    const fileType = document.file.type;

    if (fileType.startsWith('application/pdf')) {
      this.displayPDF(base64Content);
    } else if (fileType.startsWith('application/msword') || fileType.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      this.displayDOCX(base64Content);
    } else if (fileType.startsWith('text/plain')) {
      this.displayTXT(base64Content);
    } else {
      this.selectedDocumentContent = 'Unsupported file type.';
    }
  } catch (error) {
    console.error('Error decoding document content:', error);
    this.selectedDocumentContent = 'Failed to decode document content.';
  }
}
// Display PDF content
private displayPDF(base64Content: string): void {
  const pdfSrc = `data:application/pdf;base64,${base64Content}`;
  const iframe = `<iframe src="${pdfSrc}" width="100%" height="500px"></iframe>`;
  this.selectedDocumentContent = iframe;
}

// Display DOCX content (this will display it as a downloadable link, for example)
private displayDOCX(base64Content: string): void {
  const byteArray = this.convertBase64ToByteArray(base64Content);
  const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const url = URL.createObjectURL(blob);
  this.selectedDocumentContent = `<a href="${url}" download="${document}.docx">Download DOCX</a>`;
}

// Display TXT content
private displayTXT(base64Content: string): void {
  const decodedContent = atob(base64Content); // Decode base64 content to text
  this.selectedDocumentContent = `<pre>${decodedContent}</pre>`; // Display text
  console.log("done insid the ts");
  
}
// Helper function to convert base64 to byte array (for DOCX, PDF, etc.)
private convertBase64ToByteArray(base64Content: string): Uint8Array {
  const binaryString = atob(base64Content);
  const byteArray = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i);
  }

  return byteArray;
}
downloadContent(document: any, format: string): void {
  if (!format) {
    alert('Please select a format before downloading.');
    return;
  }

  if (!document || !document.file.content) {
    alert('No content available for download.');
    return;
  }

  try {
    const base64Content = document.file.content.split(',')[1]; // Extract base64 content
    const binaryData = atob(base64Content); // Decode base64 to binary
    const byteArray = new Uint8Array(binaryData.length);

    for (let i = 0; i < binaryData.length; i++) {
      byteArray[i] = binaryData.charCodeAt(i);
    }

    let blob: Blob;
    switch (format) {
      case 'pdf':
        blob = new Blob([byteArray], { type: 'application/pdf' });
        break;
      case 'docx':
        blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        break;
      case 'txt':
        blob = new Blob([byteArray], { type: 'text/plain' });
        break;
      default:
        alert('Unsupported format.');
        return;
    }

    FileSaver.saveAs(blob, `${document.document_name}.${format}`);
  } catch (error) {
    console.error('Error processing content for download:', error);
    alert('Failed to process content for download.');
  }

}
downloadsummary(summarized_content:any,format:any){
  if(!format){
    alert('Please select a format before downloading.');
  }
  if (!summarized_content ) {
    alert('No content available for download.');
    return;
  }
  let blob: Blob;
    switch (format) {
      case 'pdf':
        blob = new Blob([summarized_content], { type: 'application/pdf' });
        break;
      case 'docx':
        blob = new Blob([summarized_content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        break;
      case 'txt':
        blob = new Blob([summarized_content], { type: 'text/plain' });
        break;
      default:
        alert('Unsupported format.');
        return;

}
}

viewSummary(document: any): void {
  if (!document.summarized_text_name) {
    this.selectedsummarizedcontent = 'No content available for this document.';
    return;
  }
  this.selectedsummarizedcontent = document.summarized_text_content;
}

// Function to close the summary
closeSummary(): void {
  this.selectedsummarizedcontent = null;
}

}






