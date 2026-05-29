/transfers/status/:reference

# /transfers/status/:reference

Retrieve information about a specific transfer using the reference you used when initiating the transfer

Response Schema:

```json
{
    "status": boolean,
    "message": string,
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
        "source": string
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
    "/transfers/status/{reference}": {
      "get": {
        "summary": "/transfers/status/:reference",
        "description": "Retrieve information about a specific transfer using the reference you used when initiating the transfer",
        "operationId": "get-transfer-by-reference",
        "parameters": [
          {
            "name": "reference",
            "in": "path",
            "description": "The reference used when initiating the transfer",
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
                    "value": "{\n    \"status\": true,\n    \"message\": \"\",\n    \"data\": {\n        \"id\": \"9525b4c6-502b-45be-90e1-81eb81a3f424\",\n        \"amount\": \"20.00\",\n        \"fee\": \"8.50\",\n        \"currency\": \"ZMW\",\n        \"narration\": \"Transfer\",\n        \"initiatedAt\": \"2024-01-01T00:00:00.447Z\",\n        \"completedAt\": \"2024-01-01T00:00:01.237Z\",\n        \"accountId\": \"b176cda5-7d97-4a3f-b4dd-ab0234e9e08c\",\n        \"creditAccount\": {\n            \"type\": \"bank-account\",\n            \"accountName\": \"Beata Jean\",\n            \"accountNumber\": \"9130000000000\",\n            \"bank\": {\n                \"id\": \"002\",\n                \"name\": \"Absa Bank\",\n                \"country\": \"zm\"\n            }\n        },\n        \"status\": \"successful\",\n        \"reasonForFailure\": null,\n        \"reference\": \"ref-3\",\n        \"lencoReference\": \"240010002\",\n        \"extraData\": {\n            \"nipSessionId\": null\n        },\n        \"source\": \"api\"\n    }\n}"
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
                          "example": "9525b4c6-502b-45be-90e1-81eb81a3f424"
                        },
                        "amount": {
                          "type": "string",
                          "example": "20.00"
                        },
                        "fee": {
                          "type": "string",
                          "example": "8.50"
                        },
                        "currency": {
                          "type": "string",
                          "example": "ZMW"
                        },
                        "narration": {
                          "type": "string",
                          "example": "Transfer"
                        },
                        "initiatedAt": {
                          "type": "string",
                          "example": "2024-01-01T00:00:00.447Z"
                        },
                        "completedAt": {
                          "type": "string",
                          "example": "2024-01-01T00:00:01.237Z"
                        },
                        "accountId": {
                          "type": "string",
                          "example": "b176cda5-7d97-4a3f-b4dd-ab0234e9e08c"
                        },
                        "creditAccount": {
                          "type": "object",
                          "properties": {
                            "type": {
                              "type": "string",
                              "example": "bank-account"
                            },
                            "accountName": {
                              "type": "string",
                              "example": "Beata Jean"
                            },
                            "accountNumber": {
                              "type": "string",
                              "example": "9130000000000"
                            },
                            "bank": {
                              "type": "object",
                              "properties": {
                                "id": {
                                  "type": "string",
                                  "example": "002"
                                },
                                "name": {
                                  "type": "string",
                                  "example": "Absa Bank"
                                },
                                "country": {
                                  "type": "string",
                                  "example": "zm"
                                }
                              }
                            }
                          }
                        },
                        "status": {
                          "type": "string",
                          "example": "successful"
                        },
                        "reasonForFailure": {},
                        "reference": {
                          "type": "string",
                          "example": "ref-3"
                        },
                        "lencoReference": {
                          "type": "string",
                          "example": "240010002"
                        },
                        "extraData": {
                          "type": "object",
                          "properties": {
                            "nipSessionId": {}
                          }
                        },
                        "source": {
                          "type": "string",
                          "example": "api"
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
                    "value": "{\n    \"status\": false,\n    \"message\": \"Transfer was not found\",\n    \"data\": null\n}"
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
                      "example": "Transfer was not found"
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
  "_id": "65f06b6583c5de0051b8aa08:65f19bc16f0ae20079796bbc"
}
```