import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private cloudName = 'dchngmhud'; // 👈 tu Cloud Name
  private uploadPreset = 'NancyPapeleria'; // 👈 el nombre del preset (no el PID)

  async uploadImage(file: File): Promise<string> {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const response = await axios.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.secure_url;
  }
}
