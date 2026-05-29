Webhooks

# Webhooks

Learn how to listen to events whenever certain actions occur on your integration.

## What are webhooks?

Whenever certain actions occur on your Lenco account or API integration, we trigger events which your application can listen to. This is where webhooks come in. A webhook is a URL on your server where we send payloads for such events. For example, if you implement webhooks, once a transfer is successful, we will immediately notify your server with a `transfer.successful` event. Here is a [list of events](#types-of-events) we can send to your webhook URL.

> 📘
>
> **NB**: You may not be able to rely completely on webhooks to get notified. An example is if your server is experiencing a downtime and your hook endpoints are affected, some customers might still be transacting independently of that and the hook call triggered would fail because your server was unreachable.
>
> *In such cases we advise that developers set up a re-query service that goes to poll for the transaction status at regular intervals e.g. every 30 minutes using the `/transfers/:id` or `/transfers/status/:reference` endpoint, till a successful or failed response is returned.*

To setup your webhook URL, kindly reach out to <support@lenco.co>

**Here are some things to note when setting up a webhook URL:**

1. If using .htaccess, remember to add the trailing / to the url you set.
2. Do a test post to your URL and ensure the script gets the post body.
3. Ensure your webhook URL is publicly available (localhost URLs cannot receive events)

## Receiving an event

All you have to do to receive the event is to create an unauthenticated POST route on your application. The event object is sent as JSON in the request body.

```javascript Node
// Using Express
app.post("/my/webhook/url", function(req, res) {
    // Retrieve the request's body
    var event = req.body;
    // Do something with event
    res.send(200);
});
```
```php
<?php
// Retrieve the request's body and parse it as JSON
$input = @file_get_contents("php://input");
$event = json_decode($input);
// Do something with $event
http_response_code(200); // PHP 5.4 or greater
?>
```

## Verifying events

It is important to verify that events originate from Lenco to avoid delivering value based on a counterfeit event.\
Valid events are raised with an header `X-Lenco-Signature` which is essentially a HMAC SHA512 signature of the event payload signed using your `webhook_hash_key`.\
The `webhook_hash_key` is a SHA256 hash of your API token.

```javascript Node
var crypto = require('crypto');
var apiToken = process.env.API_TOKEN;
var webhookHashKey = crypto.createHash("sha256").update(apiToken).digest("hex");
// Using Express
app.post("/my/webhook/url", function(req, res) {
    //validate event
    var hash = crypto.createHmac('sha512', webhookHashKey).update(JSON.stringify(req.body)).digest('hex');
    if (hash === req.headers['x-lenco-signature']) {
        // Retrieve the request's body
        var event = req.body;
        // Do something with event  
    }
    res.send(200);
});
```
```php
<?php
// only a post with lenco signature header gets our attention
if ((strtoupper($_SERVER['REQUEST_METHOD']) != 'POST' ) || !array_key_exists('HTTP_X_LENCO_SIGNATURE', $_SERVER) ) 
    exit();
// Retrieve the request's body
$input = @file_get_contents("php://input");
define('LENCO_API_TOKEN','API_TOKEN');
$webhook_hash_key = hash("sha256", LENCO_API_TOKEN);
// validate event do all at once to avoid timing attack
if($_SERVER['HTTP_X_LENCO_SIGNATURE'] !== hash_hmac('sha512', $input, $webhook_hash_key))
    exit();
http_response_code(200);
// parse event (which is json string) as object
// Do something - that will not take long - with $event
$event = json_decode($input);
exit();
?>
```

## Responding to an event

You should respond to an event with a `200` OK. We consider this an acknowledgement by your application. If your application responds with any status outside of either `200`, `201`, or `202`, we will consider it unacknowledged and thus, continue to send it every 30 minutes for 24 hours. You don't need to send a request body or some other parameter as it would be discarded - we only pay attention to the status code.

If your application is likely to start a long running task in response to the event, Lenco may timeout waiting for the response and would ultimately consider the event unacknowledged and queue to be raised later. You can mitigate duplicity by having your application respond immediately with a 200 before it goes on to perform the rest of the task.

## Types of events

Here are the events we currently raise. We would add more to this list as we hook into more actions in the future.

| Event                   | Description                                                                             |
| :---------------------- | :-------------------------------------------------------------------------------------- |
| `transfer.successful`   | A transfer was successfully completed from any of the accounts linked to your API token |
| `transfer.failed`       | A transfer you attempted from any of the accounts linked to your API token has failed   |
| `collection.successful` | A collection you attempted was successfully completed                                   |
| `collection.failed`     | A collection you attempted has failed                                                   |
| `collection.settled`    | Your account was credited for a collection                                              |
| `transaction.credit`    | An account linked to your API token was credited                                        |
| `transaction.debit`     | An account linked to your API token was debited                                         |

```json transfer.successful
{
    "event": "transfer.successful",
    "data": {
        "id": string,
        "amount": string,
        "fee": string,
        "currency": string,
        "narration": string,
        "initiatedAt": date-time,
        "completedAt": date-time | null,
        "accountId": string,
        "creditAccount": {
            "id": string | null,
            "type": string,
            "accountName": string,
            "accountNumber": string | null,
            "bank": {
                "id": string,
                "name": string,
                "country": string
            } | null,
            "phone": string | null,
            "operator": string | null,
            "walletNumber": string | null,
            "tillNumber": string | null
        },
        "status": "pending" | "successful" | "failed",
        "reasonForFailure": string | null,
        "reference": string | null,
        "lencoReference": string,
        "extraData": {
            "nipSessionId": string | null,
        },
        "source": "banking-app" | "api"
    }
}
```
```json transfer.failed
{
    "event": "transfer.failed",
    "data": {
        "id": string,
        "amount": string,
        "fee": string,
        "currency": string,
        "narration": string,
        "initiatedAt": date-time,
        "completedAt": date-time | null,
        "accountId": string,
        "creditAccount": {
            "id": string | null,
            "type": string,
            "accountName": string,
            "accountNumber": string | null,
            "bank": {
                "id": string,
                "name": string,
                "country": string
            } | null,
            "phone": string | null,
            "operator": string | null,
            "walletNumber": string | null,
            "tillNumber": string | null
        },
        "status": "pending" | "successful" | "failed",
        "reasonForFailure": string | null,
        "reference": string | null,
        "lencoReference": string,
        "extraData": {
            "nipSessionId": string | null,
        },
        "source": "banking-app" | "api"
    }
}
```
```json collection.successful
{
    "event": "collection.successful",
    "data": {
        "id": string,
        "initiatedAt": date-time,
        "completedAt": date-time | null,
        "amount": string,
        "fee": string | null,
        "bearer": "merchant" | "customer",
        "currency": string,
        "reference": string | null,
        "lencoReference": string,
        "type": "card" | "mobile-money" | "bank-account" | null,
        "status": "pending" | "successful" | "failed" | "pay-offline",
        "source": "banking-app" | "api",
        "reasonForFailure": string | null,
        "settlementStatus": "pending" | "settled" | null,
        "settlement": {
            "id": string,
            "amountSettled": string,
            "currency": string,
            "createdAt": date-time,
            "settledAt": date-time | null,
            "status": "pending" | "settled",
            "type": "instant" | "next-day",
            "accountId": string,
        } | null,
        "mobileMoneyDetails": {
            "country": string,
            "phone": string,
            "operator": string,
            "accountName": string | null,
            "operatorTransactionId": string | null,
        } | null,
        "bankAccountDetails": null,
        "cardDetails": null,
    }
}
```
```json collection.failed
{
    "event": "collection.failed",
    "data": {
        "id": string,
        "initiatedAt": date-time,
        "completedAt": date-time | null,
        "amount": string,
        "fee": string | null,
        "bearer": "merchant" | "customer",
        "currency": string,
        "reference": string | null,
        "lencoReference": string,
        "type": "card" | "mobile-money" | "bank-account" | null,
        "status": "pending" | "successful" | "failed" | "pay-offline",
        "source": "banking-app" | "api",
        "reasonForFailure": string | null,
        "settlementStatus": "pending" | "settled" | null,
        "settlement": {
            "id": string,
            "amountSettled": string,
            "currency": string,
            "createdAt": date-time,
            "settledAt": date-time | null,
            "status": "pending" | "settled",
            "type": "instant" | "next-day",
            "accountId": string,
        } | null,
        "mobileMoneyDetails": {
            "country": string,
            "phone": string,
            "operator": string,
            "accountName": string | null,
            "operatorTransactionId": string | null,
        } | null,
        "bankAccountDetails": null,
        "cardDetails": null,
    }
}
```
```json collection.settled
{
    "event": "collection.settled",
    "data": {
        "id": string,
        "initiatedAt": date-time,
        "completedAt": date-time | null,
        "amount": string,
        "fee": string | null,
        "bearer": "merchant" | "customer",
        "currency": string,
        "reference": string | null,
        "lencoReference": string,
        "type": "card" | "mobile-money" | "bank-account" | null,
        "status": "pending" | "successful" | "failed" | "pay-offline",
        "source": "banking-app" | "api",
        "reasonForFailure": string | null,
        "settlementStatus": "pending" | "settled" | null,
        "settlement": {
            "id": string,
            "amountSettled": string,
            "currency": string,
            "createdAt": date-time,
            "settledAt": date-time | null,
            "status": "pending" | "settled",
            "type": "instant" | "next-day",
            "accountId": string,
        } | null,
        "mobileMoneyDetails": {
            "country": string,
            "phone": string,
            "operator": string,
            "accountName": string | null,
            "operatorTransactionId": string | null,
        } | null,
        "bankAccountDetails": null,
        "cardDetails": null,
    }
}
```
```json transaction.credit
{
    "event": "transaction.credit",
    "data": {
        "id": string,
        "amount": string,
        "currency": string,
        "narration": string,
        "type": "credit" | "debit",
        "datetime": date-time,
        "accountId": string,
        "balance": string | null
    }
}
```
```json transaction.debit
{
    "event": "transaction.debit",
    "data": {
        "id": string,
        "amount": string,
        "currency": string,
        "narration": string,
        "type": "credit" | "debit",
        "datetime": date-time,
        "accountId": string,
        "balance": string | null
    }
}
```