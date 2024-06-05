# CheckoutSpartacusTranslations
Checkout.com provides an end-to-end platform that helps you move faster, instead of holding you back. With flexible tools, granular data and deep insights, it’s the payments tech that unleashes your potential. So you can innovate, adapt to your markets, create outstanding customer experiences, and make smart decisions faster. The Connector for SAP Commerce Cloud (formerly Hybris) enables customers to implement a global payment strategy through a single integration in a secure, compliant and unified approach.

This [Checkout.com](https://www.checkout.com/) library adds necessary translations to the Spartacus Storefront for SAP Commerce Cloud. 

## Release Compatibility
This library is tailored to the [Spartacus](https://sap.github.io/spartacus-docs/) Storefront:

This release is compatible with:
* Spartacus: version 4.2
* Node module `checkout-spartacus-connector` v4.2.7
* SAP Commerce Cloud: version 2011/2105/2205/2211
* Angular CLI: Version 12.0.5 or later, < 13.
* Node.js: Version 14.15 is required. Version 12.x reached end-of-life on April 30, 2022, and is no longer supported by Spartacus. It is strongly recommended that you migrate any existing Spartacus storefronts to Node.js 14 as soon as possible. If there are any issues with Spartacus and Node.js 14, please upgrade to the latest releases. If you continue to experience issues with Node.js 14, create a support ticket with SAP.
* Yarn: Version 1.15 or later.

## Release notes
### Release 4.2.7
* Removed translations for iDeal APM form

### Release 4.2.6
* Included support for SAP CX 2211
* Fixed dependencies issues.

### Release 4.2.4
* Included support for SAP CX 2205
* Included the following components in the list of components to be imported in the Spartacus configuration module:
  * GuestRegisterFormComponent.
  * AccountPaymentDetailsComponent.
* Included support for the following APMs:
  * Cartes Bancaires
  * Multiple Card Brands

### Release 4.2.3
Include binaries. Previous 4.2.x releases are missing binaries.

### Release 4.2.2
Update readme

### Release 4.2.0
Use this release if you are using Spartacus 4.2.x
* Upgrade to Spartacus 4.2
* Show first name + last name as the card account holder
* Fix for ApplePay transaction status

### Release 1.0.2
* Source code now publicly available

### Release 1.0.0
* Added support for SSR

### Release 0.0.0
* Lazy loaded feature module
* Translations moved to separate node module
* APM’s
  * AliPay
  * ApplePay
  * Bancontact
  * Benefit Pay
  * EPS
  * Fawry
  * Giropay
  * GooglePay
  * iDeal
  * Klarna
  * KNet
  * Mada
  * Multibanco
  * Oxxo
  * PayPal
  * Poli
  * Przelewy24
  * QPay
  * Sepa
  * Sofort
* Credit card form placeholder localisation
* Display card payment icon
* Made OCC endpoints configurable
* Added support for 3DS2
