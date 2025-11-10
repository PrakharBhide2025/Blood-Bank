import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Donor } from '../donor';
import { DonorService } from '../donor.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-donorlist',
  templateUrl: './donorlist.component.html',
  styleUrls: ['./donorlist.component.css']
})
export class DonorlistComponent implements OnInit {

  loggedUser = '';
  tempUser = '';
  title = '';
  bloodGroup: string = '';
  donors: Observable<Donor[]> | undefined;

  constructor(
    private donorService: DonorService,
    private activatedRoute: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit(): void {
    // Load logged-in user
    this.tempUser = JSON.stringify(sessionStorage.getItem('loggedUser') || '{}');
    if (this.tempUser.charAt(0) === '"' && this.tempUser.charAt(this.tempUser.length - 1) === '"') {
      this.tempUser = this.tempUser.substr(1, this.tempUser.length - 2);
    }
    this.loggedUser = this.tempUser;

    // Set dashboard title
    this.title = (this.loggedUser === 'admin@gmail.com') ? 'Admin Dashboard' : 'User Dashboard';

    // Load donor data
    this.reloadData();
  }

  /** Load donors and validate each entry before displaying */
  reloadData() {
    this.donors = this.donorService.getDonorList().pipe(
      map((donors: Donor[] = []) =>
        donors.filter((donor: Donor) => this.isValidDonor(donor))
      )
    );
  }

  /** Validate every donor field (name, blood group, gender, phone, age, city) */
  isValidDonor(donor: Donor): boolean {
    // Default values to avoid undefined issues
    const name = donor.name ?? '';
    const bloodGroup = donor.bloodGroup ?? '';
    const gender = donor.gender ?? '';
    const mobile = donor.mobile ?? '';
    const age = donor.age ?? 0;
    const city = donor.city ?? '';

    // Regex patterns
    const namePattern = /^[A-Za-z ]+$/;
    const mobilePattern = /^[0-9]{10}$/;
    const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    // Validation checks
    const nameValid = namePattern.test(name);
    const bloodValid = validGroups.includes(bloodGroup.toUpperCase());
    const genderValid = ['male', 'female', 'Male', 'Female'].includes(gender);
    const mobileValid = mobilePattern.test(mobile);
    const ageValid = age >= 18 && age <= 65;
    const cityValid = city.trim().length > 0;

    // Log invalid entries
    if (!(nameValid && bloodValid && genderValid && mobileValid && ageValid && cityValid)) {
      console.warn(`⚠️ Invalid donor skipped: ${name || '(unknown)'} (${bloodGroup || 'N/A'})`);
    }

    // Return true only if all validations pass
    return !!(nameValid && bloodValid && genderValid && mobileValid && ageValid && cityValid);
  }

  /** Navigate Home based on user role */
  navigateHome() {
    if (this.loggedUser === 'admin@gmail.com') {
      this.title = 'Admin Dashboard';
      this._router.navigate(['/loginsuccess']);
    } else {
      this.title = 'User Dashboard';
      this._router.navigate(['/userdashboard']);
    }
  }

  /** Logout and clear session */
  logout() {
    sessionStorage.clear();
    this._router.navigate(['/login']);
  }

  /** Validate and search donors by blood group */
  search() {
    this.bloodGroup = this.bloodGroup.trim();

    const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    // If search box empty → reload all donors
    if (this.bloodGroup === '') {
      this.reloadData();
    }
    // Invalid blood group entered
    else if (!validGroups.includes(this.bloodGroup.toUpperCase())) {
      alert(' Invalid blood group entered! Please enter one of: A+, A-, B+, B-, AB+, AB-, O+, O-');
      this.bloodGroup = '';
      this.reloadData();
    }
    // Valid search → filter donors
    else {
      this.donors = this.donors?.pipe(
        map(results =>
          results.filter(res =>
            res.bloodGroup.toLocaleLowerCase().match(this.bloodGroup.toLocaleLowerCase())
          )
        )
      );
    }
  }
}
