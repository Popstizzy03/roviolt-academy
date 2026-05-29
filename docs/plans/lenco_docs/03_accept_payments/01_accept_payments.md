Accept Payments

# Accept Payments

Lenco provides a simple and convenient payment flow for web with the popup widget. It can be integrated in a few easy steps.

### Step 1: Collect customer information

To begin, you need to pass information such as email, amount, reference, etc.\
Here is the full list of parameters you can pass:

[block:parameters]
{
  "data": {
    "h-0": "Param",
    "h-1": "Required?",
    "h-2": "Description",
    "0-0": "key",
    "0-1": "Yes",
    "0-2": "Your public key from Lenco",
    "1-0": "email",
    "1-1": "Yes",
    "1-2": "Email address of customer",
    "2-0": "reference",
    "2-1": "Yes",
    "2-2": "Unique case sensitive reference. Only `-`, `.`, `_`, and alphanumeric characters allowed",
    "3-0": "amount",
    "3-1": "Yes",
    "3-2": "Amount the customer is to pay. This can include decimals (i.e. 10.75)",
    "4-0": "currency",
    "4-1": "No",
    "4-2": "ISO 3-Letter Currency Code e.g. `ZMW`, `USD`",
    "5-0": "label",
    "5-1": "No",
    "5-2": "Text to show on the widget. This could be the name of the checkout form.",
    "6-0": "bearer",
    "6-1": "No",
    "6-2": "Decide who will bear the fee. Either `merchant` (you), or `customer` (your customer).  \nNote: This will only be used if not already set in your dashboard.",
    "7-0": "channels",
    "7-1": "No",
    "7-2": "An array of payment channels to control what is made available to the customer to make a payment with.  \nAvailable channels include: [`card`, `mobile-money`]",
    "8-0": "customer",
    "8-1": "No",
    "8-2": "This field holds the customer details",
    "9-0": "customer.firstName",
    "9-1": "No",
    "9-2": "The first name of the customer",
    "10-0": "customer.lastName",
    "10-1": "No",
    "10-2": "The last name of the customer",
    "11-0": "customer.phone",
    "11-1": "No",
    "11-2": "The phone number of the customer",
    "12-0": "billing",
    "12-1": "No",
    "12-2": "This field holds the customer's billing address",
    "13-0": "billing.streetAddress",
    "13-1": "No",
    "13-2": "The street address",
    "14-0": "billing.city",
    "14-1": "No",
    "14-2": "The city ",
    "15-0": "billing.state",
    "15-1": "No",
    "15-2": "The state or province.  \nIf a country does not have states or provinces, this can be left blank.  \n  \nNote: For US states and Canada provinces, this should be the 2-letter code for the state / province. i.e. California should be `CA`.  \n  \nYou can find the list of US State and Canada Province codes [here](https://www.ups.com/worldshiphelp/WSA/ENU/AppHelp/mergedProjects/CORE/Codes/State_Province_Codes.htm)",
    "16-0": "billing.postalCode",
    "16-1": "No",
    "16-2": "The postal code",
    "17-0": "billing.country",
    "17-1": "No",
    "17-2": "2-letter code i.e. United states should be `US`.  \nYou can find the list of country codes [here](https://www.iban.com/country-codes)",
    "18-0": "onSuccess",
    "18-1": "No",
    "18-2": "Javascript function that runs when payment is successful. This should ideally be a script that uses the verify endpoint to check the status of the payment.",
    "19-0": "onClose",
    "19-1": "No",
    "19-2": "Javascript function that is called if the customer closes the payment window instead of making a payment.",
    "20-0": "onConfirmationPending",
    "20-1": "No",
    "20-2": "Javascript function that is called if the customer closes the payment window before we verify their payment."
  },
  "cols": 3,
  "rows": 21,
  "align": [
    "left",
    "left",
    "left"
  ]
}
[/block]

<br />

### Step 2: Initiate the Payment

When you have all the details needed to initiate the payment, the next step is to pass them to Lenco to display the popup widget.

```html
<script src="https://pay.lenco.co/js/v1/inline.js"></script>

<script>
function getPaidWithLenco() {
	LencoPay.getPaid({
		key: 'YOUR_PUBLIC_KEY', // your Lenco public key
		reference: 'ref-' + Date.now(), // a unique reference you generated
		email: 'customer@email.com', // the customer's email address
		amount: 1000, // the amount the customer is to pay
		currency: "ZMW",
		channels: ["card", "mobile-money"],
		customer: {
			firstName: "John",
			lastName: "Doe",
			phone: "0971111111",
		},
		onSuccess: function (response) {
			//this happens after the payment is completed successfully
			const reference = response.reference;
			alert('Payment complete! Reference: ' + reference);
			// Make an AJAX call to your server with the reference to verify the payment
		},
		onClose: function () {
			alert('Payment was not completed, window closed.');
		},
		onConfirmationPending: function () {
			alert('Your purchase will be completed when the payment is confirmed');
		},
	});
}
</script>

```

For the sandbox environment, use `https://pay.sandbox.lenco.co/js/v1/inline.js` as the source for the lenco widget script.

**Important Notes:**

1. The `key` field takes your Lenco **public** key.
2. The `amount` field should not be converted to the lowest currency unit. Rather you can pass in a number with decimal places i.e. 10.75
3. It is ideal to generate a unique reference from your system for every payment to avoid duplicate attempts.
4. The `onSuccess` callback function is called when payment has been completed successfully. See the next section for how to handle the callback.
5. The `onClose` callback function is called if the user closes the widget without completing payment.
6. The `onConfirmationPending` callback function is called if the customer closes the payment window before we verify their payment.

<br />

### Step 3: Handle the `onSuccess` callback method

The `onSuccess` callback function is fired when the payment is successful. This is where you include any action you want to perform when the payment is successful.

The recommended next step here is to verify the payment as detailed in step 4.

> 📘
>
> **Note**\
> To verify the payment, you have to set up a route or page on your server that you pass the reference to. Then from your server, you call the verify endpoint to confirm the statis of the payment, and the response is returned to your frontend.

There are 2 ways you can call your server from the callback function

1. Make an AJAX request to the endpoint on your server that handles the payment verification

```javascript
onSuccess: function(response){
	$.ajax({
		url: 'https://www.yoururl.com/verify_payment?reference=' + response.reference,
		method: 'get',
		success: function (response) {
			// the payment status is in response.data.status
		} 
	});
}
```

2. Redirect to the verification endpoint URL on your server.

```javascript
onSuccess: function(response) {
	window.location = "https://www.yoururl.com/verify_payment.php?reference=" + response.reference;
}
// On the redirected page, you can call Lenco's API to verify the payment.
```

> ❗️
>
> **Warning**\
> Never call the Lenco API directly from your frontend to avoid exposing your api secret key on the frontend. All requests to the Lenco API should be initiated from your server, and your frontend gets the response from your server.

<br />

### Step 4: Verify the Payment

You do this by making a GET request to `https://api.lenco.co/access/v2/collections/status/:reference` from your server using your reference. You can find more information about this endpoint [here](https://lenco-api.readme.io/v2.0/reference/get-collection-by-reference).

```curl
# Sample Request

curl https://api.lenco.co/access/v2/collections/status/ref-1
-H "Authorization: Bearer API_SECRET_KEY"
-X GET
```

```json
// Sample Response

{
  "status": true,
  "message": "",
  "data": {
    "id": "d7bd9ccb-0737-4e72-a387-d00454341f21",
    "initiatedAt": "2024-03-12T07:06:11.562Z",
    "completedAt": "2024-03-12T07:14:10.412Z",
    "amount": "10.00",
    "fee": "0.25",
    "bearer": "merchant",
    "currency": "ZMW",
    "reference": "ref-1",
    "lencoReference": "240720004",
    "type": "mobile-money",
    "status": "successful",
    "source": "api",
    "reasonForFailure": null,
    "settlementStatus": "settled",
    "settlement": {
      "id": "c04583d7-d026-4dfa-b8b5-e96f17f93bb8",
      "amountSettled": "9.75",
      "currency": "ZMW",
      "createdAt": "2024-03-12T07:14:10.439Z",
      "settledAt": "2024-03-12T07:14:10.496Z",
      "status": "settled",
      "type": "instant",
      "accountId": "68f11209-451f-4a15-bfcd-d916eb8b09f4"
    },
    "mobileMoneyDetails": {
      "country": "zm",
      "phone": "0977433571",
      "operator": "airtel",
      "accountName": "Beata Jean",
      "operatorTransactionId": "MP240312.0000.A00001"
    },
    "bankAccountDetails": null,
    "cardDetails": null
  }
}
```

<br />

### Step 5: Handle webhook

When a payment is successful, Lenco sends a `collection.successful` webhook event to your webhook URL. You can [learn more here](https://lenco-api.readme.io/v2.0/reference/webhooks).