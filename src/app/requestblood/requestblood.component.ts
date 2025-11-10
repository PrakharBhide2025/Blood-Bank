import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DonorService } from '../donor.service';
import { Requesting } from '../requesting';

@Component({
  selector: 'app-requestblood',
  templateUrl: './requestblood.component.html',
  styleUrls: ['./requestblood.component.css']
})
export class RequestbloodComponent implements OnInit {

  loggedUser = '';
  tempUser = '';
  request = new Requesting();
  msg = '';

  constructor(
    private _router: Router,
    private donorService: DonorService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.tempUser = JSON.stringify(sessionStorage.getItem('loggedUser') || '{}');
    if (this.tempUser.charAt(0) === '"' && this.tempUser.charAt(this.tempUser.length - 1) === '"') {
      this.tempUser = this.tempUser.substr(1, this.tempUser.length - 2);
    }
    this.loggedUser = this.tempUser;
    this.msg = '';
  }

  navigateHome() {
    this._router.navigate(['/userdashboard']);
  }

  // Logical + medical validation with mobile length restriction (≤10)
  isMedicallyEligible(): string | null {
    if (!this.request.disease) return null;
    const disease = this.request.disease.trim().toLowerCase();

    // Restricted diseases
    const restrictedDiseases = [
      'fever',
      'cold',
      'flu',
      'malaria',
      'hepatitis',
      'hiv',
      'aids',
      'covid',
      'covid-19',
      'typhoid',
      'dengue',
      'infection'
    ];

    if (restrictedDiseases.some(d => disease.includes(d))) {
      return `Patients suffering from ${this.request.disease} are not eligible to request blood.`;
    }

    // Age validation
    if (this.request.age < 1 || this.request.age > 120) {
      return 'Invalid patient age. Please enter a realistic value.';
    }

    // Blood group validation
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(this.request.bloodgroup?.toUpperCase())) {
      return 'Invalid blood group. Please enter a valid type (e.g., A+, O-).';
    }

    // Mobile number length check (≤10 digits)
    if (this.request.mobile && this.request.mobile.toString().length > 10) {
      return 'Mobile number should not be more than 10 digits.';
    }

    // Gender validation
    if (!['Male', 'Female', 'Others'].includes(this.request.gender)) {
      return 'Please select a valid gender.';
    }

    // Units validation
    if (Number(this.request.units) < 1 || Number(this.request.units) > 4) {
      return 'Requested units must be between 1 and 4.';
    }

    return null; // Passed all checks
  }

  requestBlood() {
    const error = this.isMedicallyEligible();
    if (error) {
      this.msg = error;
      console.warn('Validation failed:', error);
      return;
    }

    this.donorService.requestForBlood(this.request).subscribe(
      data => {
        console.log('Request sent successfully');
        this.msg = ' Blood Request Sent Successfully!';
        setTimeout(() => this._router.navigate(['/userdashboard']), 1000);
      },
      error => {
        console.error('Request failed', error);
        this.msg = ' Failed to send blood request. Please try again later.';
      }
    );
  }

  logout() {
    sessionStorage.clear();
    this._router.navigate(['/login']);
  }
}
