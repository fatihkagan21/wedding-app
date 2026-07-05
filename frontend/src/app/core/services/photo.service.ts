import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { concatMap, from, last } from 'rxjs';
import { environment } from '../../../environments/environment';

interface PhotoUploadResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private readonly http = inject(HttpClient);

  uploadPhotos(files: File[]) {
    return from(files).pipe(
      concatMap(file => {
        const formData = new FormData();
        formData.append('photos', file);
        return this.http.post<PhotoUploadResponse>(environment.photoUploadUrl, formData);
      }),
      last()
    );
  }
}
