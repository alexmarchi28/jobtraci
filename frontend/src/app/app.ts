import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';

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

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://localhost:5000/api';

  protected readonly health = signal<HealthResponse | null>(null);
  protected readonly jobs = signal<JobApplication[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly isLoading = signal(false);

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
}
