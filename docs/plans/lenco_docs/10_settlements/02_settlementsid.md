/settlements/:id

# /settlements/:id

Retrieve information about a specific settlement

Response Schema:

```json
{
    "status": boolean,
    "message": string,
    "data": {
	    "id": string,
	    "amountSettled": string,
	    "currency": string,
	    "createdAt": date-time,
	    "settledAt": date-time | null,
	    "status": "pending" | "settled",
	    "type": "instant" | "next-day",
	    "accountId": string,
	    "collection": {
	        "id": string,
	        "initiatedAt": date-time,
	        "completedAt": date-time | null,
	        "amount": string,
	        "fee": string | null,
	        "bearer": "merchant" | "customer",
	        "currency": string,
	        "reference": string | null,
	        "lencoReference": string,
	        "type": "card" | "mobile-money" |"bank-account",
	        "status": "pending" | "successful" | "failed" | "otp-required" | "pay-offline",
	        "source": "banking-app" | "api",
	        "reasonForFailure": string | null,
	        "settlementStatus": "pending" | "settled" | null,
	        "settlement": null,
	        "mobileMoneyDetails": {
	            "country": string,
	            "phone": string,
	            "operator": string,
	            "accountName": string | null,
	        } | null,
	        "bankAccountDetails": null,
	        "cardDetails": null,
	    };
	}
}
```

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
    "/settlements/{id}": {
      "get": {
        "summary": "/settlements/:id",
        "description": "Retrieve information about a specific settlement",
        "operationId": "get-settlement-by-id",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "Your 36-character settlement uuid",
            "schema": {
              "type": "string"
            },
            "required": true
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n    \"status\": true,\n    \"message\": \"\",\n    \"data\": {\n        \"id\": \"c04583d7-d026-4dfa-b8b5-e96f17f93bb8\",\n        \"amountSettled\": \"9.75\",\n        \"currency\": \"ZMW\",\n        \"createdAt\": \"2024-03-12T07:14:10.439Z\",\n        \"settledAt\": \"2024-03-12T07:14:10.496Z\",\n        \"status\": \"settled\",\n        \"type\": \"instant\",\n        \"accountId\": \"68f11209-451f-4a15-bfcd-d916eb8b09f4\",\n        \"collection\": {\n            \"id\": \"d7bd9ccb-0737-4e72-a387-d00454341f21\",\n            \"initiatedAt\": \"2024-03-12T07:06:11.562Z\",\n            \"completedAt\": \"2024-03-12T07:14:10.412Z\",\n            \"amount\": \"10.00\",\n            \"fee\": \"0.25\",\n            \"bearer\": \"merchant\",\n            \"currency\": \"ZMW\",\n            \"reference\": \"ref-1\",\n            \"lencoReference\": \"240010001\",\n            \"type\": \"mobile-money\",\n            \"status\": \"successful\",\n            \"source\": \"api\",\n            \"reasonForFailure\": null,\n            \"settlementStatus\": \"settled\",\n            \"settlement\": null,\n            \"mobileMoneyDetails\": {\n                \"country\": \"zm\",\n                \"phone\": \"0977433571\",\n                \"operator\": \"airtel\",\n                \"accountName\": \"Beata Jean\"\n            },\n            \"bankAccountDetails\": null,\n            \"cardDetails\": null\n        }\n    }\n}"
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
                          "example": "c04583d7-d026-4dfa-b8b5-e96f17f93bb8"
                        },
                        "amountSettled": {
                          "type": "string",
                          "example": "9.75"
                        },
                        "currency": {
                          "type": "string",
                          "example": "ZMW"
                        },
                        "createdAt": {
                          "type": "string",
                          "example": "2024-03-12T07:14:10.439Z"
                        },
                        "settledAt": {
                          "type": "string",
                          "example": "2024-03-12T07:14:10.496Z"
                        },
                        "status": {
                          "type": "string",
                          "example": "settled"
                        },
                        "type": {
                          "type": "string",
                          "example": "instant"
                        },
                        "accountId": {
                          "type": "string",
                          "example": "68f11209-451f-4a15-bfcd-d916eb8b09f4"
                        },
                        "collection": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "string",
                              "example": "d7bd9ccb-0737-4e72-a387-d00454341f21"
                            },
                            "initiatedAt": {
                              "type": "string",
                              "example": "2024-03-12T07:06:11.562Z"
                            },
                            "completedAt": {
                              "type": "string",
                              "example": "2024-03-12T07:14:10.412Z"
                            },
                            "amount": {
                              "type": "string",
                              "example": "10.00"
                            },
                            "fee": {
                              "type": "string",
                              "example": "0.25"
                            },
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
                              "example": "240010001"
                            },
                            "type": {
                              "type": "string",
                              "example": "mobile-money"
                            },
                            "status": {
                              "type": "string",
                              "example": "successful"
                            },
                            "source": {
                              "type": "string",
                              "example": "api"
                            },
                            "reasonForFailure": {},
                            "settlementStatus": {
                              "type": "string",
                              "example": "settled"
                            },
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
                                  "example": "Beata Jean"
                                }
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
              }
            }
          },
          "404": {
            "description": "404",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n    \"status\": false,\n    \"message\": \"Settlement was not found\",\n    \"data\": null\n}"
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
                      "example": "Settlement was not found"
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
  "_id": "65f06b6583c5de0051b8aa08:65f19c5e83c98d0074e0910b"
}
```