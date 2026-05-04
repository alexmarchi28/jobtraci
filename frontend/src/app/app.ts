import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

interface HealthResponse {
  status: string;
  application: string;
  serverTimeUtc: string;
}

interface JobApplication {
  id: number;
  company: string;
  role: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  contractType: string;
  status: string;
  applicationDate: string;
  contactName: string | null;
  postingUrl: string | null;
  notes: string | null;
}

interface CreateJobApplication {
  company: string;
  role: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  contractType: string;
  status: string;
  applicationDate: string;
  contactName: string | null;
  postingUrl: string | null;
  notes: string | null;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly http = inject(HttpClient);
  private readonly formBuilder = inject(FormBuilder);
  private readonly apiBaseUrl = 'http://localhost:5000/api';

  protected readonly contractTypes = [
    'Apprendistato',
    'Determinato',
    'Indeterminato',
    'Consulenza'
  ];
  protected readonly statuses = [
    'Da valutare',
    'Candidatura inviata',
    'Colloquio',
    'Offerta ricevuta',
    'Rifiutata'
  ];

  protected readonly health = signal<HealthResponse | null>(null);
  protected readonly jobs = signal<JobApplication[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly saveMessage = signal<string | null>(null);
  protected readonly saveError = signal<string | null>(null);

  protected readonly jobForm = this.formBuilder.group({
    company: ['', [Validators.required, Validators.maxLength(120)]],
    role: ['', [Validators.required, Validators.maxLength(120)]],
    location: ['', [Validators.required, Validators.maxLength(120)]],
    salaryMin: [null as number | null, [Validators.min(0), Validators.max(1000000)]],
    salaryMax: [null as number | null, [Validators.min(0), Validators.max(1000000)]],
    contractType: ['Apprendistato', [Validators.required]],
    status: ['Da valutare', [Validators.required]],
    applicationDate: [this.todayIsoDate(), [Validators.required]],
    contactName: ['', [Validators.maxLength(120)]],
    postingUrl: ['', [Validators.maxLength(500)]],
    notes: ['', [Validators.maxLength(2000)]]
  });

  constructor() {
    this.loadBackendData();
  }

  protected loadBackendData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<HealthResponse>(`${this.apiBaseUrl}/health`).subscribe({
      next: (health) => this.health.set(health),
      error: () => {
        this.error.set('Backend non raggiungibile su http://localhost:5000');
        this.isLoading.set(false);
      }
    });

    this.http.get<JobApplication[]>(`${this.apiBaseUrl}/jobs`).subscribe({
      next: (jobs) => {
        this.jobs.set(jobs);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Impossibile leggere /api/jobs dal backend.');
        this.isLoading.set(false);
      }
    });
  }

  protected createJob(): void {
    this.saveMessage.set(null);
    this.saveError.set(null);

    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched();
      this.saveError.set('Compila almeno azienda, ruolo, sede e data candidatura.');
      return;
    }

    const payload = this.buildCreatePayload();

    if (
      payload.salaryMin !== null &&
      payload.salaryMax !== null &&
      payload.salaryMin > payload.salaryMax
    ) {
      this.saveError.set('La RAL massima deve essere maggiore o uguale alla RAL minima.');
      return;
    }

    this.isSaving.set(true);

    this.http.post<JobApplication>(`${this.apiBaseUrl}/jobs`, payload).subscribe({
      next: (createdJob) => {
        this.jobs.update((jobs) => [createdJob, ...jobs]);
        this.jobForm.reset({
          company: '',
          role: '',
          location: '',
          salaryMin: null,
          salaryMax: null,
          contractType: 'Apprendistato',
          status: 'Da valutare',
          applicationDate: this.todayIsoDate(),
          contactName: '',
          postingUrl: '',
          notes: ''
        });
        this.saveMessage.set(`Offerta aggiunta: ${createdJob.company} - ${createdJob.role}`);
        this.isSaving.set(false);
      },
      error: () => {
        this.saveError.set('Salvataggio non riuscito. Controlla che il backend sia avviato.');
        this.isSaving.set(false);
      }
    });
  }

  protected isInvalid(controlName: keyof typeof this.jobForm.controls): boolean {
    const control = this.jobForm.controls[controlName];

    return control.invalid && (control.dirty || control.touched);
  }

  private buildCreatePayload(): CreateJobApplication {
    const raw = this.jobForm.getRawValue();

    return {
      company: raw.company?.trim() ?? '',
      role: raw.role?.trim() ?? '',
      location: raw.location?.trim() ?? '',
      salaryMin: raw.salaryMin ?? null,
      salaryMax: raw.salaryMax ?? null,
      contractType: raw.contractType?.trim() ?? '',
      status: raw.status?.trim() ?? '',
      applicationDate: raw.applicationDate ?? this.todayIsoDate(),
      contactName: this.normalizeOptionalText(raw.contactName),
      postingUrl: this.normalizeOptionalText(raw.postingUrl),
      notes: this.normalizeOptionalText(raw.notes)
    };
  }

  private normalizeOptionalText(value: string | null | undefined): string | null {
    const normalized = value?.trim();

    return normalized ? normalized : null;
  }

  private todayIsoDate(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
