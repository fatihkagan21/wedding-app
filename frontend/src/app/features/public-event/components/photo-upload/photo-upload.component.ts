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
  private readonly mimeAliases: Record<string, string> = {
    'image/jpg': 'image/jpeg',
    'image/pjpeg': 'image/jpeg',
    'image/x-png': 'image/png'
  };
  private readonly mimeTypesByExtension: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif'
  };

  selectedFiles: File[] = [];
  uploading = false;
  errorMessage = '';
  successMessage = '';

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    this.errorMessage = '';
    this.successMessage = '';

    const normalizedFiles = files.map(file => this.normalizeImageFile(file));
    if (normalizedFiles.some(file => file === null)) {
      this.clearSelection(input);
      this.errorMessage = 'Sadece JPEG, PNG, WebP, HEIC veya HEIF fotoğrafları seçebilirsiniz.';
      return;
    }

    const validFiles = normalizedFiles.filter((file): file is File => file !== null);

    const oversizedFile = validFiles.find(file => file.size > this.maxFileSize);
    if (oversizedFile) {
      this.clearSelection(input);
      this.errorMessage = `“${oversizedFile.name}” 100 MB sınırını aşıyor.`;
      return;
    }

    this.selectedFiles = validFiles;
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
          this.errorMessage = this.getUploadErrorMessage(error);
        }
      });
  }

  private normalizeImageFile(file: File): File | null {
    const originalMimeType = file.type.toLowerCase();
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const normalizedMimeType = this.allowedMimeTypes.has(originalMimeType)
      ? originalMimeType
      : this.mimeAliases[originalMimeType] ?? this.mimeTypesByExtension[extension];

    if (!normalizedMimeType || !this.allowedMimeTypes.has(normalizedMimeType)) {
      return null;
    }

    if (normalizedMimeType === originalMimeType) return file;

    return new File([file], file.name, {
      type: normalizedMimeType,
      lastModified: file.lastModified
    });
  }

  private getUploadErrorMessage(error: HttpErrorResponse): string {
    if (typeof error.error?.error === 'string') return error.error.error;
    if (error.status === 0) {
      return 'Yükleme sırasında bağlantı kesildi. İnternet bağlantınızı kontrol edip tekrar deneyin.';
    }
    if (error.status === 413) return 'Seçtiğiniz fotoğrafların toplam boyutu çok büyük.';
    if (error.status === 502 || error.status === 504) {
      return 'Yükleme zaman aşımına uğradı. Daha az fotoğrafla tekrar deneyin.';
    }

    return 'Fotoğraflar yüklenemedi. Lütfen daha sonra tekrar deneyin.';
  }

  private clearSelection(input: HTMLInputElement): void {
    this.selectedFiles = [];
    input.value = '';
  }
}
