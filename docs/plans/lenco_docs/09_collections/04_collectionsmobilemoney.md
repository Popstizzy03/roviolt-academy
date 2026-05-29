/collections/mobile-money

# /collections/mobile-money

This endpoint allows you to request a payment from customers by using their phone number enabled for mobile money.

At the point of payment, the customer is required to authorize the payment on their mobile phones. The status of the collection request would be `pay-offline`.\
Once you get this status, you should notify the customer to complete the authorization process on their mobile phones and then listen for webhook notification or requery the [collection request status endpoint](https://lenco-api.readme.io/v2.0/reference/get-collection-by-reference) at interval.

Response Schema:

```json
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
	    "type": "mobile-money",
	    "status": "pending" | "successful" | "failed" | "pay-offline",
	    "source": "api",
	    "reasonForFailure": string | null,
	    "settlementStatus": "pending" | "settled" | null,
	    "settlement": null,
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

> 📘
>
> You can use any of the accounts [listed here](https://lenco-api.readme.io/v2.0/reference/test-cards-and-accounts) to test mobile money collections in the sandbox environment

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
    "/collections/mobile-money": {
      "post": {
        "summary": "/collections/mobile-money",
        "description": "",
        "operationId": "initiate-collection-from-mobile-money",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "amount",
                  "reference",
                  "phone",
                  "operator"
                ],
                "properties": {
                  "amount": {
                    "type": "number",
                    "format": "double"
                  },
                  "reference": {
                    "type": "string",
                    "description": "Unique reference. Only `-`, `.`, `_` and alphanumeric characters allowed"
                  },
                  "phone": {
                    "type": "string"
                  },
                  "operator": {
                    "type": "string",
                    "description": "For Zambia, either `airtel`, or `mtn` <br>For Malawi, either `airtel`, or `tnm`",
                    "enum": [
                      "airtel",
                      "mtn",
                      "tnm"
                    ]
                  },
                  "country": {
                    "type": "string",
                    "description": "Optional. Either `zm` (Zambia), or `mw` (Malawi)",
                    "enum": [
                      "zm",
                      "mw"
                    ]
                  },
                  "bearer": {
                    "type": "string",
                    "description": "Optional. Decide who will bear the fee. Either `merchant` (you), or `customer` (your customer)",
                    "default": "merchant",
                    "enum": [
                      "merchant",
                      "customer"
                    ]
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
                    "value": "{\n    \"status\": true,\n    \"message\": \"\",\n    \"data\": {\n        \"id\": \"e809a3de-3a9f-4a62-9e9b-077311a1924f\",\n        \"initiatedAt\": \"2024-03-13T17:06:44.778Z\",\n        \"completedAt\": null,\n        \"amount\": \"13.00\",\n        \"fee\": null,\n        \"bearer\": \"merchant\",\n        \"currency\": \"ZMW\",\n        \"reference\": \"ref-1\",\n        \"lencoReference\": \"240730008\",\n        \"type\": \"mobile-money\",\n        \"status\": \"pay-offline\",\n        \"source\": \"api\",\n        \"reasonForFailure\": null,\n        \"settlementStatus\": null,\n        \"settlement\": null,\n        \"mobileMoneyDetails\": {\n            \"country\": \"zm\",\n            \"phone\": \"0977433571\",\n            \"operator\": \"airtel\",\n            \"accountName\": \"Haim Hasegawa\",\n            \"operatorTransactionId\": null\n        },\n        \"bankAccountDetails\": null,\n        \"cardDetails\": null\n    }\n}"
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
                          "example": "pay-offline"
                        },
                        "source": {
                          "type": "string",
                          "example": "api"
                        },
                        "reasonForFailure": {},
                        "settlementStatus": {},
                        "settlement": {},
                        "mobileMoneyDetails": {
                          "type": "object",
                          "properties": {
                            "country": {
                              "type": "string",
                              "example": "zm"
                            },
                            "phone": {
                              "type": "string",
                              "example": "0977433571"
                            },
                            "operator": {
                              "type": "string",
                              "example": "airtel"
                            },
                            "accountName": {
                              "type": "string",
                              "example": "Haim Hasegawa"
                            },
                            "operatorTransactionId": {}
                          }
                        },
                        "bankAccountDetails": {},
                        "cardDetails": {}
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
  "_id": "65f06b6583c5de0051b8aa08:65f19d00c6b26e001c6266d2"
}
```