import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    httpTesting.expectOne('http://localhost:5000/api/jobs').flush([]);

    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the job tracker heading', async () => {
    const fixture = TestBed.createComponent(App);
    httpTesting.expectOne('http://localhost:5000/api/jobs').flush([]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Candidature');
  });

  it('should keep the application form closed until requested', () => {
    const fixture = TestBed.createComponent(App);
    httpTesting.expectOne('http://localhost:5000/api/jobs').flush([]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.job-form')).toBeNull();

    compiled.querySelector<HTMLButtonElement>('.add-offer-strip')?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.job-form')).not.toBeNull();
  });
});
