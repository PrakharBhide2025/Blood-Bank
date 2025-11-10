import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Donor } from '../donor';
import { DonorService } from '../donor.service';

@Component({
  selector: 'app-userasdonor',
  templateUrl: './userasdonor.component.html',
  styleUrls: ['./userasdonor.component.css']
})
export class UserasdonorComponent implements OnInit {

  loggedUser = '';
  tempUser = '';
  msg = '';
  donor = new Donor();

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

  // ✅ Donor eligibility validation function
  isValidDonor(): string | null {
    if (!this.donor || !this.donor.name) {
      return 'Please fill out the form correctly.';
    }

    // ❌ Diseases that disqualify donation
    const restrictedConditions = [
      'fever',
      'cold',
      'flu',
      'malaria',
      'hepatitis',
      'hiv',
      'aids',
      'covid',
      'covid-19',
      'infection',
      'cancer',
      'asthma',
      'tuberculosis'
    ];

    if (this.donor.disease && restrictedConditions.some(d => this.donor.disease.toLowerCase().includes(d))) {
      return `Donors suffering from ${this.donor.disease} are not eligible to donate blood.`;
    }

    // 🔞 Age validation
    if (this.donor.age < 18) {
      return 'Donors below 18 years are not eligible to donate blood.';
    }
    if (this.donor.age > 65) {
      return 'Donors above 65 years are not eligible to donate blood.';
    }

    // 🩸 Blood group validation
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(this.donor.bloodGroup?.toUpperCase())) {
      return 'Invalid blood group. Please enter a valid type (e.g., A+, O-).';
    }

    // 📱 Mobile number length ≤ 10
    if (this.donor.mobile && this.donor.mobile.toString().length > 10) {
      return 'Mobile number should not exceed 10 digits.';
    }

    // 🧍 Gender validation
    if (!['Male', 'Female', 'Others'].includes(this.donor.gender)) {
      return 'Please select a valid gender.';
    }

    // 🧪 Units validation
    if (Number(this.donor.units) < 1 || Number(this.donor.units) > 3) {
      return 'Units of blood must be between 1 and 3.';
    }

    // 🏙️ City and address validation
    if (!this.donor.city || this.donor.city.trim().length < 2) {
      return 'Please enter a valid city name.';
    }
    if (!this.donor.address || this.donor.address.trim().length < 5) {
      return 'Please provide a proper address.';
    }

    // 📅 Date validation (optional)
    if (!this.donor.date) {
      return 'Please select a donation date.';
    }

    return null; // ✅ All checks passed
  }

  addDonor() {
    const validationError = this.isValidDonor();
    if (validationError) {
      this.msg = validationError;
      console.warn('Validation failed:', validationError);
      return;
    }

    this.donorService.requestForAddingDonor(this.donor).subscribe(
      data => {
        console.log('✅ Donor added successfully');
        this.msg = 'Donor Added Successfully!';
        setTimeout(() => this._router.navigate(['/userdashboard']), 1000);
      },
      error => {
        console.error('❌ Donor registration failed', error);
        this.msg = 'Failed to add donor. Please try again later.';
      }
    );
  }

  logout() {
    sessionStorage.clear();
    this._router.navigate(['/login']);
  }
}
