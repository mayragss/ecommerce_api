import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="image-upload-container">
      <label class="form-label">{{ label }}</label>
      
      <!-- Upload Area -->
      <div 
        class="upload-area"
        [class.dragover]="isDragOver"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <div class="upload-content" *ngIf="!images.length">
          <i class="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
          <p class="text-muted mb-2">Arraste imagens aqui ou clique para selecionar</p>
          <small class="text-muted">Máximo {{ maxFiles }} imagens (JPG, PNG, GIF)</small>
        </div>
        
        <div class="upload-content" *ngIf="images.length > 0">
          <i class="fas fa-plus fa-2x text-muted mb-2"></i>
          <p class="text-muted mb-0">Adicionar mais imagens</p>
        </div>
      </div>
      
      <!-- Hidden File Input -->
      <input 
        #fileInput
        type="file" 
        multiple 
        accept="image/*"
        (change)="onFileSelected($event)"
        style="display: none;"
      >
      
      <!-- Image Preview -->
      <div class="image-preview-container" *ngIf="images.length > 0">
        <div class="row g-2">
          <div class="col-md-3 col-sm-4 col-6" *ngFor="let image of images; let i = index">
            <div class="image-preview-item">
              <img [src]="getImageUrl(image)" [alt]="'Imagem ' + (i + 1)" class="preview-image">
              <button 
                type="button" 
                class="btn-remove-image" 
                (click)="removeImage(i)"
                title="Remover imagem"
              >
                <i class="fas fa-times"></i>
              </button>
              <div class="image-order" *ngIf="images.length > 1">
                <button 
                  type="button" 
                  class="btn-order" 
                  (click)="moveImage(i, i - 1)"
                  [disabled]="i === 0"
                  title="Mover para cima"
                >
                  <i class="fas fa-chevron-up"></i>
                </button>
                <button 
                  type="button" 
                  class="btn-order" 
                  (click)="moveImage(i, i + 1)"
                  [disabled]="i === images.length - 1"
                  title="Mover para baixo"
                >
                  <i class="fas fa-chevron-down"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Error Message -->
      <div class="text-danger mt-2" *ngIf="errorMessage">
        <i class="fas fa-exclamation-triangle me-1"></i>
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .image-upload-container {
      margin-bottom: 1rem;
    }
    
    .upload-area {
      border: 2px dashed #dee2e6;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: #f8f9fa;
    }
    
    .upload-area:hover {
      border-color: #007bff;
      background-color: #e3f2fd;
    }
    
    .upload-area.dragover {
      border-color: #007bff;
      background-color: #e3f2fd;
      transform: scale(1.02);
    }
    
    .upload-content {
      pointer-events: none;
    }
    
    .image-preview-container {
      margin-top: 1rem;
    }
    
    .image-preview-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .preview-image {
      width: 100%;
      height: 120px;
      object-fit: cover;
      display: block;
    }
    
    .btn-remove-image {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: rgba(220, 53, 69, 0.9);
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn-remove-image:hover {
      background-color: #dc3545;
      transform: scale(1.1);
    }
    
    .image-order {
      position: absolute;
      bottom: 5px;
      right: 5px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .btn-order {
      width: 20px;
      height: 20px;
      border-radius: 3px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn-order:hover:not(:disabled) {
      background-color: rgba(0, 0, 0, 0.9);
    }
    
    .btn-order:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ImageUploadComponent implements OnInit, OnChanges {
  @Input() label = 'Imagens do Produto';
  @Input() maxFiles = 5;
  @Input() maxFileSize = 5 * 1024 * 1024; // 5MB
  @Input() images: (string | File)[] = [];
  @Output() imagesChange = new EventEmitter<(string | File)[]>();
  
  isDragOver = false;
  errorMessage = '';

  ngOnInit() {
    this.normalizeImages();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['images']) {
      this.normalizeImages();
    }
  }

  private normalizeImages() {
    if (!this.images) {
      this.images = [];
    }
    // Garantir que images seja sempre um array
    if (!Array.isArray(this.images)) {
      this.images = [];
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  handleFiles(files: File[]) {
    this.errorMessage = '';
    
    // Validar número de arquivos
    if (this.images.length + files.length > this.maxFiles) {
      this.errorMessage = `Máximo de ${this.maxFiles} imagens permitidas`;
      return;
    }

    // Validar cada arquivo
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Apenas arquivos de imagem são permitidos';
        return;
      }
      
      if (file.size > this.maxFileSize) {
        this.errorMessage = `Arquivo muito grande. Máximo ${this.maxFileSize / (1024 * 1024)}MB`;
        return;
      }
    }

    // Adicionar arquivos
    this.images = [...this.images, ...files];
    this.imagesChange.emit(this.images);
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
    this.imagesChange.emit([...this.images]);
  }

  moveImage(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= this.images.length) return;
    
    const images = [...this.images];
    const [movedImage] = images.splice(fromIndex, 1);
    images.splice(toIndex, 0, movedImage);
    
    this.images = images;
    this.imagesChange.emit(this.images);
  }

  getImageUrl(image: string | File): string {
    if (typeof image === 'string') {
      return image;
    }
    return URL.createObjectURL(image);
  }
}
