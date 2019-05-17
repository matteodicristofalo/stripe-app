import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StripeService, Elements, Element as StripeElement, ElementsOptions } from "ngx-stripe";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  formData: FormGroup;
  elements: Elements;
  card: StripeElement;
  showLoader: boolean = false;

  // optional parameters
  elementsOptions: ElementsOptions = {
    locale: 'en'
  };

  constructor(private fb: FormBuilder, private stripeService: StripeService, private http: HttpClient) { }

  ngOnInit() {

    this.formData = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      zipCode: ['', Validators.required],
      phone: ['', Validators.required],
      stripeToken: '',
      email: "test@gmail.com",
      amount: 500
    });

    this.stripeService.elements(this.elementsOptions).subscribe(elements => {
      this.elements = elements;
      // Only mount the element the first time
      if(!this.card) {
        this.card = this.elements.create('card', {
          hidePostalCode: true,
          style: {
            base: {
              iconColor: '#666EE8',
              color: '#31325F',
              lineHeight: '40px',
              fontWeight: 300,
              fontSize: '16px',
              '::placeholder': {
                  color: '#CFD7E0'
              }
            }
          }
        });
        this.card.mount('#card-element');
      }
    });

  }

  buy() {
    this.showLoader = true;
    this.stripeService.createToken(this.card, null).subscribe(result => {
      if (result.token) {
        // Create the charge
        this.formData.value.stripeToken = result.token.id;
        this.createCharge(this.formData.value).subscribe(
          res => {
            this.showLoader = false;
            console.log(res);
          },
          err => {
            this.showLoader = false;
            console.log(err);
          }
        );
      } else if (result.error) {
        // Error creating the token
        console.log(result.error.message);
      }
    });
  }

  createCharge(obj) {
    return this.http.post('http://localhost:3000/charge', obj);
  }

}
