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
  private readonly maxFileSize = 500 * 1024 * 1024;
  private readonly allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'video/x-m4v',
    'audio/mpeg',
    'audio/mp4',
    'audio/aac',
    'audio/wav',
    'audio/x-wav',
    'audio/ogg',
    'audio/webm',
    'audio/3gpp',
    'audio/amr',
    'audio/flac'
  ]);
  private readonly mimeAliases: Record<string, string> = {
    'image/jpg': 'image/jpeg',
    'image/pjpeg': 'image/jpeg',
    'image/x-png': 'image/png',
    'video/mov': 'video/quicktime',
    'video/m4v': 'video/x-m4v',
    'audio/mp3': 'audio/mpeg',
    'audio/x-m4a': 'audio/mp4'
  };
  private readonly mimeTypesByExtension: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    webm: 'video/webm',
    m4v: 'video/x-m4v',
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    opus: 'audio/ogg',
    '3gp': 'audio/3gpp',
    amr: 'audio/amr',
    flac: 'audio/flac'
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

    const normalizedFiles = files.map(file => this.normalizeMediaFile(file));
    if (normalizedFiles.some(file => file === null)) {
      this.clearSelection(input);
      this.errorMessage = 'Sadece JPEG, PNG, WebP, HEIC, HEIF, MP4, MOV, WebM, M4V, MP3, M4A, AAC, WAV, OGG, Opus, 3GP, AMR veya FLAC dosyaları yükleyebilirsiniz.';
      return;
    }

    const validFiles = normalizedFiles.filter((file): file is File => file !== null);

    const oversizedFile = validFiles.find(file => file.size > this.maxFileSize);
    if (oversizedFile) {
      this.clearSelection(input);
      this.errorMessage = `“${oversizedFile.name}” 500 MB sınırını aşıyor.`;
      return;
    }

    this.selectedFiles = validFiles;
  }

  upload(input: HTMLInputElement): void {
    if (!this.selectedFiles.length || this.uploading) {
      this.errorMessage = 'Lütfen en az bir fotoğraf, video veya ses dosyası seçin.';
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

  private normalizeMediaFile(file: File): File | null {
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
    if (error.status === 413) return 'Seçtiğiniz dosya 500 MB sınırını aşıyor.';
    if (error.status === 502 || error.status === 504) {
      return 'Yükleme zaman aşımına uğradı. Daha küçük bir dosyayla tekrar deneyin.';
    }

    return 'Dosyalar yüklenemedi. Lütfen daha sonra tekrar deneyin.';
  }

  private clearSelection(input: HTMLInputElement): void {
    this.selectedFiles = [];
    input.value = '';
  }
}
