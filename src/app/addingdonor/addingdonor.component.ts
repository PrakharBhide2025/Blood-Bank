import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Donor } from '../donor';
import { DonorService } from '../donor.service';

declare var $: any;

@Component({
  selector: 'app-addingdonor',
  templateUrl: './addingdonor.component.html',
  styleUrls: ['./addingdonor.component.css']
})
export class AddingdonorComponent implements OnInit {

  loggedUser = '';
  tempUser = '';
  donor = new Donor();
  msg: string = '';
  msgColor: string = ''; // to change message color dynamically

  constructor(private _service: DonorService, private _router: Router) { }

  ngOnInit(): void {
    $(document).ready(function () {
      const now = new Date();
      const day = ("0" + now.getDate()).slice(-2);
      const month = ("0" + (now.getMonth() + 1)).slice(-2);
      const today = now.getFullYear() + "-" + (month) + "-" + (day);
      $('#date').val(today);
    });

    this.tempUser = JSON.stringify(sessionStorage.getItem('loggedUser') || '{}');
    if (this.tempUser.charAt(0) === '"' && this.tempUser.charAt(this.tempUser.length - 1) === '"') {
      this.tempUser = this.tempUser.substr(1, this.tempUser.length - 2);
    }
    this.loggedUser = this.tempUser;
  }

  navigateHome() {
    if (this.loggedUser === 'admin@gmail.com') {
      this._router.navigate(['/loginsuccess']);
    } else {
      this._router.navigate(['/userdashboard']);
    }
  }

  // Validation Logic
  validateDonor(): string | null {
    const { name, bloodGroup, mobile, gender, age, city, disease } = this.donor;

    // Required fields
    if (!name || !bloodGroup || !mobile || !gender || !age || !city) {
      return 'Please fill in all required fields.';
    }

    // Mobile number must be exactly 10 digits
    if (!/^\d{10}$/.test(mobile)) {
      return 'Mobile number must be exactly 10 digits.';
    }

    // Age validation
    if (age < 18 || age > 65) {
      return 'Donor must be between 18 and 65 years old.';
    }

    // Disease restriction (fever, cold, infection, flu, covid)
    const restrictedConditions = ['fever', 'cold', 'infection', 'flu', 'covid'];
    const donorDisease = (disease || '').toLowerCase().trim();

    if (donorDisease && restrictedConditions.some(cond => donorDisease.includes(cond))) {
      return `Donors suffering from "${disease}" are not eligible to donate blood.`;
    }

    return null; // all valid
  }

  // Add Donor Function
  addDonor() {
    const validationError = this.validateDonor();

    if (validationError) {
      this.msg = validationError;
      this.msgColor = 'red';
      return;
    }

    // Proceed with backend call
    this._service.addDonorFromRemote(this.donor).subscribe(
      data => {
        console.log("Donor added Successfully");
        this.msg = "✅ Donor added successfully!";
        this.msgColor = 'green';

        // Optional: reset form fields
        this.donor = new Donor();
      },
      error => {
        console.log("Process Failed", error);
        this.msg = "❌ Failed to add donor. Please try again.";
        this.msgColor = 'red';
      }
    );
  }
}
