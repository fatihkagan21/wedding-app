import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

interface PhotoUploadResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private readonly api = inject(ApiService);

  uploadPhotos(files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));

    return this.api.post<PhotoUploadResponse>('/photos/upload', formData);
  }
}
