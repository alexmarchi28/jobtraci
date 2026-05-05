import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

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

interface SaveJobApplicationPayload {
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

  protected readonly jobs = signal<JobApplication[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly saveMessage = signal<string | null>(null);
  protected readonly saveError = signal<string | null>(null);
  protected readonly editingJobId = signal<number | null>(null);
  protected readonly deletingJobId = signal<number | null>(null);

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
    this.loadJobs();
  }

  protected loadJobs(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<JobApplication[]>(`${this.apiBaseUrl}/jobs`).subscribe({
      next: (jobs) => {
        this.jobs.set(this.sortJobs(jobs));
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Non riesco ad aggiornare le candidature. Riprova tra poco.');
        this.isLoading.set(false);
      }
    });
  }

  protected saveJob(): void {
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
    const editingId = this.editingJobId();

    if (editingId === null) {
      this.http.post<JobApplication>(`${this.apiBaseUrl}/jobs`, payload).subscribe({
        next: (createdJob) => {
          this.jobs.update((jobs) => this.sortJobs([createdJob, ...jobs]));
          this.resetForm();
          this.saveMessage.set(`Offerta aggiunta: ${createdJob.company} - ${createdJob.role}`);
          this.isSaving.set(false);
        },
        error: () => {
          this.saveError.set('Salvataggio non riuscito. Riprova tra poco.');
          this.isSaving.set(false);
        }
      });

      return;
    }

    this.http.put<JobApplication>(`${this.apiBaseUrl}/jobs/${editingId}`, payload).subscribe({
      next: (updatedJob) => {
        this.jobs.update((jobs) =>
          this.sortJobs(jobs.map((job) => job.id === updatedJob.id ? updatedJob : job))
        );
        this.resetForm();
        this.saveMessage.set(`Offerta aggiornata: ${updatedJob.company} - ${updatedJob.role}`);
        this.isSaving.set(false);
      },
      error: () => {
        this.saveError.set('Modifica non riuscita. Riprova tra poco.');
        this.isSaving.set(false);
      }
    });
  }

  protected beginEdit(job: JobApplication): void {
    this.editingJobId.set(job.id);
    this.saveMessage.set(null);
    this.saveError.set(null);
    this.jobForm.reset({
      company: job.company,
      role: job.role,
      location: job.location,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      contractType: job.contractType,
      status: job.status,
      applicationDate: job.applicationDate,
      contactName: job.contactName ?? '',
      postingUrl: job.postingUrl ?? '',
      notes: job.notes ?? ''
    });

    document.querySelector('.job-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected cancelEdit(): void {
    this.resetForm();
    this.saveMessage.set(null);
    this.saveError.set(null);
  }

  protected deleteJob(job: JobApplication): void {
    const confirmed = confirm(`Eliminare l'offerta "${job.role}" di ${job.company}?`);

    if (!confirmed) {
      return;
    }

    this.saveMessage.set(null);
    this.saveError.set(null);
    this.deletingJobId.set(job.id);

    this.http.delete<void>(`${this.apiBaseUrl}/jobs/${job.id}`).subscribe({
      next: () => {
        this.jobs.update((jobs) => jobs.filter((candidate) => candidate.id !== job.id));

        if (this.editingJobId() === job.id) {
          this.resetForm();
        }

        this.saveMessage.set(`Offerta eliminata: ${job.company} - ${job.role}`);
        this.deletingJobId.set(null);
      },
      error: () => {
        this.saveError.set('Eliminazione non riuscita. Riprova tra poco.');
        this.deletingJobId.set(null);
      }
    });
  }

  protected isInvalid(controlName: keyof typeof this.jobForm.controls): boolean {
    const control = this.jobForm.controls[controlName];

    return control.invalid && (control.dirty || control.touched);
  }

  private buildCreatePayload(): SaveJobApplicationPayload {
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

  private resetForm(): void {
    this.editingJobId.set(null);
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
  }

  private sortJobs(jobs: JobApplication[]): JobApplication[] {
    return [...jobs].sort((left, right) => {
      const dateComparison = right.applicationDate.localeCompare(left.applicationDate);

      return dateComparison || left.company.localeCompare(right.company);
    });
  }

  private todayIsoDate(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
