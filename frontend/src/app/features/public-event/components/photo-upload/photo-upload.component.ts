import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { PhotoService } from '../../../../core/services/photo.service';

type RecorderState = 'idle' | 'requesting' | 'recording' | 'recorded';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  templateUrl: './photo-upload.component.html',
  styleUrl: './photo-upload.component.css'
})
export class PhotoUploadComponent implements OnDestroy {
  private readonly photoService = inject(PhotoService);
  private readonly maxFileSize = 500 * 1024 * 1024;
  private readonly maxRecordingSeconds = 5 * 60;
  private readonly allowedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'video/x-m4v'
  ]);
  private readonly mimeAliases: Record<string, string> = {
    'image/jpg': 'image/jpeg',
    'image/pjpeg': 'image/jpeg',
    'image/x-png': 'image/png',
    'video/mov': 'video/quicktime',
    'video/m4v': 'video/x-m4v'
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
    m4v: 'video/x-m4v'
  };

  selectedFiles: File[] = [];
  uploading = false;
  errorMessage = '';
  successMessage = '';

  recorderState: RecorderState = 'idle';
  recordingSeconds = 0;
  recordedAudioUrl = '';
  audioUploading = false;
  audioErrorMessage = '';
  audioSuccessMessage = '';

  private mediaRecorder?: MediaRecorder;
  private mediaStream?: MediaStream;
  private recordedAudio?: File;
  private recordingChunks: Blob[] = [];
  private recordingTimer?: ReturnType<typeof setInterval>;

  get recordingSupported(): boolean {
    return typeof navigator !== 'undefined'
      && !!navigator.mediaDevices?.getUserMedia
      && typeof MediaRecorder !== 'undefined';
  }

  get recordingTime(): string {
    const minutes = Math.floor(this.recordingSeconds / 60);
    const seconds = this.recordingSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    this.errorMessage = '';
    this.successMessage = '';

    const normalizedFiles = files.map(file => this.normalizeMediaFile(file));
    if (normalizedFiles.some(file => file === null)) {
      this.clearSelection(input);
      this.errorMessage = 'Sadece JPEG, PNG, WebP, HEIC, HEIF, MP4, MOV, WebM veya M4V dosyaları yükleyebilirsiniz.';
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
      this.errorMessage = 'Lütfen en az bir fotoğraf veya video seçin.';
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

  async startRecording(): Promise<void> {
    if (!this.recordingSupported || this.recorderState === 'requesting' || this.recorderState === 'recording') return;

    this.resetRecording();
    this.recorderState = 'requesting';
    this.audioErrorMessage = '';
    this.audioSuccessMessage = '';

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const mimeType = this.getSupportedRecordingMimeType();
      this.mediaRecorder = mimeType
        ? new MediaRecorder(this.mediaStream, { mimeType })
        : new MediaRecorder(this.mediaStream);
      this.recordingChunks = [];

      this.mediaRecorder.addEventListener('dataavailable', event => {
        if (event.data.size > 0) this.recordingChunks.push(event.data);
      });
      this.mediaRecorder.addEventListener('stop', () => this.createRecordingFile());
      this.mediaRecorder.addEventListener('error', () => {
        this.audioErrorMessage = 'Kayıt sırasında bir sorun oluştu. Lütfen tekrar deneyin.';
        this.finishRecordingSession();
      });

      window.dispatchEvent(new CustomEvent('voice-recording-started'));
      this.mediaRecorder.start(1000);
      this.recorderState = 'recording';
      this.recordingSeconds = 0;
      this.recordingTimer = setInterval(() => {
        this.recordingSeconds += 1;
        if (this.recordingSeconds >= this.maxRecordingSeconds) this.stopRecording();
      }, 1000);
    } catch (error) {
      this.recorderState = 'idle';
      this.stopMediaStream();
      this.audioErrorMessage = this.getMicrophoneErrorMessage(error);
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder?.state === 'recording') this.mediaRecorder.stop();
    this.clearRecordingTimer();
    this.stopMediaStream();
  }

  discardRecording(): void {
    this.resetRecording();
    this.audioErrorMessage = '';
    this.audioSuccessMessage = '';
  }

  uploadRecording(): void {
    if (!this.recordedAudio || this.audioUploading) return;

    this.audioUploading = true;
    this.audioErrorMessage = '';
    this.audioSuccessMessage = '';

    this.photoService.uploadPhotos([this.recordedAudio])
      .pipe(finalize(() => this.audioUploading = false))
      .subscribe({
        next: response => {
          this.audioSuccessMessage = response.message;
          this.resetRecording();
        },
        error: (error: HttpErrorResponse) => {
          this.audioErrorMessage = this.getUploadErrorMessage(error);
        }
      });
  }

  ngOnDestroy(): void {
    if (this.mediaRecorder?.state === 'recording') this.mediaRecorder.stop();
    this.finishRecordingSession();
    this.revokeRecordedAudioUrl();
  }

  private createRecordingFile(): void {
    if (!this.recordingChunks.length) {
      this.audioErrorMessage = 'Ses kaydı oluşturulamadı. Lütfen tekrar deneyin.';
      this.finishRecordingSession();
      return;
    }

    const mimeType = this.mediaRecorder?.mimeType || this.recordingChunks[0].type || 'audio/webm';
    const blob = new Blob(this.recordingChunks, { type: mimeType });
    const extension = mimeType.includes('mp4') ? 'm4a' : mimeType.includes('ogg') ? 'ogg' : 'webm';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    this.recordedAudio = new File([blob], `sesli-ani-${timestamp}.${extension}`, {
      type: mimeType,
      lastModified: Date.now()
    });
    this.recordedAudioUrl = URL.createObjectURL(blob);
    this.recorderState = 'recorded';
    this.finishRecordingSession();
  }

  private getSupportedRecordingMimeType(): string {
    const candidates = [
      'audio/mp4',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus'
    ];
    return candidates.find(type => MediaRecorder.isTypeSupported(type)) ?? '';
  }

  private getMicrophoneErrorMessage(error: unknown): string {
    const errorName = error instanceof DOMException ? error.name : '';
    if (errorName === 'NotAllowedError' || errorName === 'SecurityError') {
      return 'Ses kaydı için mikrofon izni gerekli. Tarayıcı ayarlarından mikrofon iznini açıp tekrar deneyin.';
    }
    if (errorName === 'NotFoundError') return 'Bu cihazda kullanılabilir bir mikrofon bulunamadı.';
    return 'Mikrofona erişilemedi. Bağlantınızı ve tarayıcı izinlerini kontrol edip tekrar deneyin.';
  }

  private normalizeMediaFile(file: File): File | null {
    const originalMimeType = file.type.toLowerCase();
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const normalizedMimeType = this.allowedMimeTypes.has(originalMimeType)
      ? originalMimeType
      : this.mimeAliases[originalMimeType] ?? this.mimeTypesByExtension[extension];

    if (!normalizedMimeType || !this.allowedMimeTypes.has(normalizedMimeType)) return null;
    if (normalizedMimeType === originalMimeType) return file;

    return new File([file], file.name, {
      type: normalizedMimeType,
      lastModified: file.lastModified
    });
  }

  private getUploadErrorMessage(error: HttpErrorResponse): string {
    if (typeof error.error?.error === 'string') return error.error.error;
    if (error.status === 0) return 'Yükleme sırasında bağlantı kesildi. İnternet bağlantınızı kontrol edip tekrar deneyin.';
    if (error.status === 413) return 'Dosya 500 MB sınırını aşıyor.';
    if (error.status === 502 || error.status === 504) return 'Yükleme zaman aşımına uğradı. Lütfen tekrar deneyin.';
    return 'Anınız yüklenemedi. Lütfen daha sonra tekrar deneyin.';
  }

  private resetRecording(): void {
    this.clearRecordingTimer();
    this.stopMediaStream();
    this.revokeRecordedAudioUrl();
    this.recordingChunks = [];
    this.recordedAudio = undefined;
    this.mediaRecorder = undefined;
    this.recordingSeconds = 0;
    this.recorderState = 'idle';
  }

  private finishRecordingSession(): void {
    this.clearRecordingTimer();
    this.stopMediaStream();
    window.dispatchEvent(new CustomEvent('voice-recording-ended'));
  }

  private clearRecordingTimer(): void {
    if (this.recordingTimer) clearInterval(this.recordingTimer);
    this.recordingTimer = undefined;
  }

  private stopMediaStream(): void {
    this.mediaStream?.getTracks().forEach(track => track.stop());
    this.mediaStream = undefined;
  }

  private revokeRecordedAudioUrl(): void {
    if (this.recordedAudioUrl) URL.revokeObjectURL(this.recordedAudioUrl);
    this.recordedAudioUrl = '';
  }

  private clearSelection(input: HTMLInputElement): void {
    this.selectedFiles = [];
    input.value = '';
  }
}
