Getting Started

# Getting Started

This page will help you get started with Lenco API

To get your API token (also referred to as api key or secret key), kindly reach out to <support@lenco.co>

## Securing Your API Token

Someone who steals your Lenco API token can interact with your accounts on your behalf, so treat it as securely as you would treat any password. Tokens should never be stored in source control. If you accidentally publicize a token via version control or other methods, you should immediately reach out to <support@lenco.co> to generate a new API token.

## Using the Token

Authenticate your API calls by including your api token in the Authorization header of every request you make.\
Authorization headers should be in the following format: Authorization: `Bearer API_TOKEN`

```
curl -H "Authorization: Bearer xo+CAiijrIy9XvZCYyhjrv0fpSAL6CfU8CgA+up1NXqK"
```

API requests made without authentication will fail with the status code `401: Unauthorized`. All API requests must be made over HTTPS.

## Requests and Response

Both request body data and response data are formatted as JSON. Content type for responses will always be `application/json`. Generally, all responses will be in the following format:

Response Format

```json
{
  "status": [boolean],  // Only true if the details provided could be processed and no error occured while processing
  "message": [string], // Explains why status is false... Entirely informational. Please only log this but do not use for your checks
  "data": [object]    // contains actionable result of processing if present
}
```

While we generally recommend that developers use HTTP status codes to determine the result of an API call, we have provided a handy status key to let you know upfront if the request was successful or not.

The message key is a string which will contain a summary of the response and its status. For instance when trying to retrieve a list of recipients, message might read “Recipients retrieved”. In the event of an error, the message key will contain a description of the error as with the authorization header situation above. This is the only key that is universal across requests.

The data key is where you want to look at for the result of your request. It can either be an object, or an array depending on the request made. For instance, a request to retrieve a single recipient will return a recipient object in the data key, while the key would be an array of recipients if a list is requested instead.

The meta key is used to provide context for the contents of the data key. For instance, when retrieving the list of transactions, pagination parameters can be passed along to limit the result set. The meta key will then contain an object with the following attributes:

Meta Key Structure

```json
"meta": {
  "total": 2,
  "perPage": 50,
  "currentPage": 1,
  "pageCount": 1
}
```

## Keys

**Total** number\
This is the total number of records.

**PerPage** number\
This is the maximum number of records that will be returned per request.

**CurrentPage** number\
This is the current `page` being returned. This is dependent on what page was requested using the `page` query parameter. **Default: 1**

**PageCount** number\
This is how many pages in total are available for retrieval considering the maximum number of records returned per request (i.e. `perPage`). For context, if there are 101 records and `perPage` is 100, `pageCount` will have a value of 2.

## Errors

Lenco's API is RESTful and as such, uses conventional HTTP response codes to indicate the success or failure of requests.\
The common error codes can be found below:

**200, 201**\
Request was successful and intended action was carried out. Note that we will always send a 200 if a transaction was made. Do check the data object to know how the charge went (i.e. successful or failed).

**400**\
A validation or client side error occurred and the request was not fulfilled.

**401**\
The request was not authorized. This can be triggered by passing an invalid API key in the authorization header or the lack of one.

**404**\
Request could not be fulfilled as the request resource does not exist.

**500, 501, 502, 503, 504**\
Request could not be fulfilled due to an error on Lenco's end. This shouldn't happen so please report as soon as you encounter any instance of this.

<br />

If the HTTP response code is not 200 (or 201), the response would optionally include `errorCode` and / or `errors`.\
Possible values for `errorCode` is given in the table below.\
`errors` maps the specific `errorCode` and `errorMessage` to the `reference`.

| Error Code | Details                                                                    |
| :--------- | :------------------------------------------------------------------------- |
| 01         | Validation error. One or more parameters could not be validated correctly. |
| 02         | Insufficient funds in account                                              |
| 03         | The transfer limit on the account has been exceeded                        |
| 04         | Invalid or duplicate reference                                             |
| 05         | Invalid recipient account                                                  |
| 06         | Restriction on debit account                                               |
| 07         | Invalid or duplicate bulk transfer reference                               |
| 08         | Invalid number of objects in bulk transfer `transfers` parameter           |
| 21         | POS terminal was not found                                                 |
| 22         | POS terminal has already been assigned                                     |
| 23         | POS terminal is currently not assigned                                     |
| 24         | POS transaction was not found                                              |