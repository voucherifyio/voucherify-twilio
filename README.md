## Voucherify and #Twilio example

[Voucherify](http://voucherify.io?utm_source=inbound&utm_medium=github&utm_campaign=voucherify-twilio) has a new platform that will help your team automate voucher campaigns. It does this by providing composable API and the marketer-friendly interface that increases teams' productivity:

- **roll-out thousands** of vouchers **in minutes** instead of weeks,
- **check status** or disable **every single** promo code in real time,
- **track redemption** history and build reports on the fly.

Here you can find a library that makes it easier to integrate Voucherify with your Node.js server.

Full documentation is located at [voucherify.readme.io](https://voucherify.readme.io).

### Features

- Send voucher code in SMS message (`/voucher-code/:recipient/send`)
- Handler for inbound messages - send voucher code in SMS to specific phone number, as a result service will call back you (`/voucher-code/verify`)
- Call to customer after successfully redeemed voucher and bring a few options to choose (`/consultancy-call`)
- Redirect call to consultant (redirect to some configurable phone number) (`/consultancy-call`)


### Usage

#### Fill placeholders for your credentials to services

`src\config.js`

```javascript
    host: 'placeholder', // Address of your app visible from internet - Twilio needs it to configure properly routing 
    twilio: {
        account_sid: "placeholder",
        auth_token: "placeholder",
        sender: "placeholder", // Twilio phone number from which you are going to send smses, you have to configure that in Twilio web console
        caller: "placeholder" // Twilio phone number from which you will make calls - configurable the same as above
    }
```

`src\views\redirect.xml`

Put here a phone number to which you want to redirect call after successfully redeemed voucher:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Dial>placeholder</Dial>
</Response>

```

`src\server.js`

If you already have Voucherify account, you can switch to it from our test one:

```javascript
var voucherify = voucherifyClient({
    applicationId: "c70a6f00-cf91-4756-9df5-47628850002b",
    clientSecretKey: "3266b9f8-e246-4f79-bdf0-833929b1380c"
});
```

### Changelog

- **2016-04-01** - `0.1.0` - First version: sending sms with voucher, handler for incoming SMS, phone call to customer