/collections/card

# /collections/card

> 📘 PCI DSS required
>
> Using this endpoint involves dealing with cardholder Personally Identifying Information (PII). A Payment Card Industry Data Security Standard (PCI DSS) certificate is therefore required.

This endpoint allows you to request a payment from customers by charging their debit/credit cards.

You send the customer details along with the card and billing information.

**Request**

The request payload would be encrypted. Please follow the guide [here](https://lenco-api.readme.io/v2.0/reference/encryption).\
The parameters you can use to build the request payload are given below:

[block:parameters]
{
  "data": {
    "h-0": "Param",
    "h-1": "Required?",
    "h-2": "Description",
    "0-0": "email",
    "0-1": "Yes",
    "0-2": "Email address of customer",
    "1-0": "reference",
    "1-1": "Yes",
    "1-2": "Unique case sensitive reference. Only `-`, `.`, `_`, and alphanumeric characters allowed",
    "2-0": "amount",
    "2-1": "Yes",
    "2-2": "Amount the customer is to pay. This can include decimals (i.e. 10.75)",
    "3-0": "currency",
    "3-1": "Yes",
    "3-2": "ISO 3-Letter Currency Code e.g. `ZMW`, `USD`",
    "4-0": "bearer",
    "4-1": "No",
    "4-2": "Decide who will bear the fee. Either `merchant` (you), or `customer` (your customer).  \nNote: This will only be used if not already set in your dashboard.",
    "5-0": "customer",
    "5-1": "Yes",
    "5-2": "This field holds the customer details",
    "6-0": "customer.firstName",
    "6-1": "Yes",
    "6-2": "The first name of the customer",
    "7-0": "customer.lastName",
    "7-1": "Yes",
    "7-2": "The last name of the customer",
    "8-0": "billing",
    "8-1": "Yes",
    "8-2": "This field holds the customer's billing address",
    "9-0": "billing.streetAddress",
    "9-1": "Yes",
    "9-2": "The street address",
    "10-0": "billing.city",
    "10-1": "Yes",
    "10-2": "The city ",
    "11-0": "billing.state",
    "11-1": "No",
    "11-2": "The state or province.  \nIf a country does not have states or provinces, this can be left blank.  \n  \nNote: For US states and Canada provinces, this should be the 2-letter code for the state / province. i.e. California should be `CA`.  \n  \nYou can find the list of US State and Canada Province codes [here](https://www.ups.com/worldshiphelp/WSA/ENU/AppHelp/mergedProjects/CORE/Codes/State_Province_Codes.htm)",
    "12-0": "billing.postalCode",
    "12-1": "Yes",
    "12-2": "The postal code",
    "13-0": "billing.country",
    "13-1": "Yes",
    "13-2": "2-letter code i.e. United states should be `US`.  \nYou can find the list of country codes [here](https://www.iban.com/country-codes)",
    "14-0": "card",
    "14-1": "Yes",
    "14-2": "This field holds the card details",
    "15-0": "card.number",
    "15-1": "Yes",
    "15-2": "Card PAN",
    "16-0": "card.expiryMonth",
    "16-1": "Yes",
    "16-2": "Card expiry month",
    "17-0": "card.expiryYear",
    "17-1": "Yes",
    "17-2": "Card expiry year ",
    "18-0": "card.cvv",
    "18-1": "Yes",
    "18-2": "Card security code",
    "19-0": "redirectUrl",
    "19-1": "No",
    "19-2": "The customer will be redirected to this url after completing the payment.  \nYour `reference`, `lencoReference`, `status`, and an optional `errorMessage` will be appended as query parameters to the redirectUrl"
  },
  "cols": 3,
  "rows": 20,
  "align": [
    "left",
    "left",
    "left"
  ]
}
[/block]

```json
// Sample payload to be encrypted

{
  "reference": "test-1",
  "email": "customer@email.com",
  "amount": "1000",
  "currency": "ZMW",
  "bearer": "merchant",
  "customer": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "billing": {
    "streetAddress": "901 metro center blvd",
    "city": "San Francisco",
    "state": "CA",
    "postalCode": "94404",
    "country": "US"
  },
  "card": {
    "number": "5555 5555 5555 4444",
    "cvv": "838",
    "expiryMonth": "12",
    "expiryYear": "2024"
  },
  "redirectUrl": "https://www.yoururl.com/verify_payment"
}
```

<br />

**Response**

For cards that require 3D Secure authorization, the value of `data`.`status` would be "3ds-auth-required" and the response would include an `authorization` object in the `meta` key.\
This `authorization` object would contain a `mode` key which will be "redirect", and a `redirect` key.\
You should redirect your customer to the URL specified in `meta`.`authorization`.`redirect` to complete the 3DS authorization.

```json
// Response Schema

{
    "status": boolean,
    "message": string,
    "data": {
	    "id": string,
	    "initiatedAt": date-time,
	    "completedAt": date-time | null,
	    "amount": string,
	    "fee": string | null,
	    "bearer": "merchant" | "customer",
	    "currency": string,
	    "reference": string,
	    "lencoReference": string,
	    "type": "card",
	    "status": "pending" | "successful" | "failed" | "3ds-auth-required",
	    "source": "api",
	    "reasonForFailure": string | null,
	    "settlementStatus": "pending" | "settled" | null,
	    "settlement": null,
	    "mobileMoneyDetails": null,
	    "bankAccountDetails": null,
	    "cardDetails": {
	        "firstName": string | null,
	        "lastName": string | null,
	        "bin": string | null,
	        "last4": string | null,
	        "cardType": string | null,
	    } | null,
	    "meta": { // optional
	        "authorization": {
	            "mode": "redirect",
	            "redirect": string
	        }
	    }
	}
}
```

> 📘
>
> You can use any of the cards [listed here](https://lenco-api.readme.io/v2.0/reference/test-cards-and-accounts) to test card collections in the sandbox environment

# OpenAPI definition

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Lenco API",
    "version": "2.0"
  },
  "servers": [
    {
      "url": "https://api.lenco.co/access/v2"
    }
  ],
  "components": {
    "securitySchemes": {
      "sec0": {
        "type": "apiKey",
        "in": "header",
        "name": "Authorization",
        "x-bearer-format": "bearer",
        "x-default": "xo+CAiijrIy9XvZCYyhjrv0fpSAL6CfU8CgA+up1NXqK"
      }
    }
  },
  "security": [
    {
      "sec0": []
    }
  ],
  "paths": {
    "/collections/card": {
      "post": {
        "summary": "/collections/card",
        "description": "",
        "operationId": "initiate-collection-from-card",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "encryptedPayload"
                ],
                "properties": {
                  "encryptedPayload": {
                    "type": "string",
                    "description": "JWE encrypted payload. See the [encryption](https://lenco-api.readme.io/v2.0/reference/encryption) guide"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n    \"status\": true,\n    \"message\": \"\",\n    \"data\": {\n        \"id\": \"e809a3de-3a9f-4a62-9e9b-077311a1924f\",\n        \"initiatedAt\": \"2024-03-13T17:06:44.778Z\",\n        \"completedAt\": null,\n        \"amount\": \"13.00\",\n        \"fee\": null,\n        \"bearer\": \"merchant\",\n        \"currency\": \"ZMW\",\n        \"reference\": \"ref-1\",\n        \"lencoReference\": \"240730008\",\n        \"type\": \"mobile-money\",\n        \"status\": \"3ds-auth-required\",\n        \"source\": \"api\",\n        \"reasonForFailure\": null,\n        \"settlementStatus\": null,\n        \"settlement\": null,\n        \"mobileMoneyDetails\": null,\n        \"bankAccountDetails\": null,\n        \"cardDetails\": {\n            \"firstName\": \"Haim\",\n            \"lastName\": \"Hasegawa\",\n            \"bin\": \"555555\",\n            \"last4\": \"4444\",\n            \"cardType\": \"Mastercard\"\n        }\n    },\n    \"meta\": {\n        \"authorization\": {\n            \"mode\": \"redirect\",\n            \"redirect\": \"https://pay.lenco.co/auth/03bab921-ba51-4b44-b3da-620928e99c5a\"\n        }\n    }\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "boolean",
                      "example": true,
                      "default": true
                    },
                    "message": {
                      "type": "string",
                      "example": ""
                    },
                    "data": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "example": "e809a3de-3a9f-4a62-9e9b-077311a1924f"
                        },
                        "initiatedAt": {
                          "type": "string",
                          "example": "2024-03-13T17:06:44.778Z"
                        },
                        "completedAt": {},
                        "amount": {
                          "type": "string",
                          "example": "13.00"
                        },
                        "fee": {},
                        "bearer": {
                          "type": "string",
                          "example": "merchant"
                        },
                        "currency": {
                          "type": "string",
                          "example": "ZMW"
                        },
                        "reference": {
                          "type": "string",
                          "example": "ref-1"
                        },
                        "lencoReference": {
                          "type": "string",
                          "example": "240730008"
                        },
                        "type": {
                          "type": "string",
                          "example": "mobile-money"
                        },
                        "status": {
                          "type": "string",
                          "example": "3ds-auth-required"
                        },
                        "source": {
                          "type": "string",
                          "example": "api"
                        },
                        "reasonForFailure": {},
                        "settlementStatus": {},
                        "settlement": {},
                        "mobileMoneyDetails": {},
                        "bankAccountDetails": {},
                        "cardDetails": {
                          "type": "object",
                          "properties": {
                            "firstName": {
                              "type": "string",
                              "example": "Haim"
                            },
                            "lastName": {
                              "type": "string",
                              "example": "Hasegawa"
                            },
                            "bin": {
                              "type": "string",
                              "example": "555555"
                            },
                            "last4": {
                              "type": "string",
                              "example": "4444"
                            },
                            "cardType": {
                              "type": "string",
                              "example": "Mastercard"
                            }
                          }
                        }
                      }
                    },
                    "meta": {
                      "type": "object",
                      "properties": {
                        "authorization": {
                          "type": "object",
                          "properties": {
                            "mode": {
                              "type": "string",
                              "example": "redirect"
                            },
                            "redirect": {
                              "type": "string",
                              "example": "https://pay.lenco.co/auth/03bab921-ba51-4b44-b3da-620928e99c5a"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "400",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n  \"status\": false,\n  \"message\": \"Duplicate reference\",\n  \"data\": null\n}"
                  }
                },
                "schema": {
                  "type": "object",
                  "properties": {
                    "status": {
                      "type": "boolean",
                      "example": false,
                      "default": true
                    },
                    "message": {
                      "type": "string",
                      "example": "Duplicate reference"
                    },
                    "data": {}
                  }
                }
              }
            }
          }
        },
        "deprecated": false
      }
    }
  },
  "x-readme": {
    "headers": [],
    "explorer-enabled": false,
    "proxy-enabled": true
  },
  "x-readme-fauxas": true,
  "_id": "65f06b6583c5de0051b8aa08:671129e8c3a3d20019c293c5"
}
```