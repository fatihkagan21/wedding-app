import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { PhotoService } from '../../../../core/services/photo.service';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  templateUrl: './photo-upload.component.html',
  styleUrl: './photo-upload.component.css'
})
export class PhotoUploadComponent {
  private readonly photoService = inject(PhotoService);
  private readonly maxFileSize = 100 * 1024 * 1024;
  private readonly allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]);

  selectedFiles: File[] = [];
  uploading = false;
  errorMessage = '';
  successMessage = '';

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    this.errorMessage = '';
    this.successMessage = '';

    const invalidType = files.find(file => !this.allowedMimeTypes.has(file.type));
    if (invalidType) {
      this.clearSelection(input);
      this.errorMessage = 'Sadece JPEG, PNG, WebP, HEIC veya HEIF fotoğrafları seçebilirsiniz.';
      return;
    }

    const oversizedFile = files.find(file => file.size > this.maxFileSize);
    if (oversizedFile) {
      this.clearSelection(input);
      this.errorMessage = `“${oversizedFile.name}” 100 MB sınırını aşıyor.`;
      return;
    }

    this.selectedFiles = files;
  }

  upload(input: HTMLInputElement): void {
    if (!this.selectedFiles.length || this.uploading) {
      this.errorMessage = 'Lütfen en az bir fotoğraf seçin.';
      return;
    }

    this.uploading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.photoService.uploadPhotos(this.selectedFiles)
      .pipe(finalize(() => this.uploading = false))
      .subscribe({
        next: response => {
          this.successMessage = response.message;
          this.clearSelection(input);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.error
            ?? 'Fotoğraflar yüklenemedi. Lütfen daha sonra tekrar deneyin.';
        }
      });
  }

  private clearSelection(input: HTMLInputElement): void {
    this.selectedFiles = [];
    input.value = '';
  }
}
