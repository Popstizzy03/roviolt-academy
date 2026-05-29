/accounts/:id

# /accounts/:id

Retrieve information about a specific bank account

Response schema:

```json
{
    "status": boolean,
    "message": string,
    "data": {
        "id": string,
        "details": {
            "type": string,
            "accountName": string,
            "tillNumber": string
        },
        "type": string,
        "status": string,
        "createdAt": date-time,
        "currency": string,
        "availableBalance": string | null,
        "ledgerBalance": string | null
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
    "/accounts/{id}": {
      "get": {
        "summary": "/accounts/:id",
        "description": "Retrieve information about a specific bank account",
        "operationId": "get-account-by-id",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "Your 36-character account uuid.",
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
                    "value": "{\n    \"status\": true,\n    \"message\": \"\",\n    \"data\": {\n        \"id\": \"b176cda5-7d97-4a3f-b4dd-ab0234e9e08c\",\n        \"details\": {\n            \"type\": \"lenco-merchant\",\n            \"accountName\": \"Account Name\",\n            \"tillNumber\": \"0000001\"\n        },\n        \"type\": \"Lenco Merchant\",\n        \"status\": \"active\",\n        \"createdAt\": \"2024-01-01T00:00:00.000Z\",\n        \"currency\": \"ZMW\",\n        \"availableBalance\": \"0.00\",\n        \"ledgerBalance\": \"0.00\"\n    }\n}"
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
                          "example": "b176cda5-7d97-4a3f-b4dd-ab0234e9e08c"
                        },
                        "details": {
                          "type": "object",
                          "properties": {
                            "type": {
                              "type": "string",
                              "example": "lenco-merchant"
                            },
                            "accountName": {
                              "type": "string",
                              "example": "Account Name"
                            },
                            "tillNumber": {
                              "type": "string",
                              "example": "0000001"
                            }
                          }
                        },
                        "type": {
                          "type": "string",
                          "example": "Lenco Merchant"
                        },
                        "status": {
                          "type": "string",
                          "example": "active"
                        },
                        "createdAt": {
                          "type": "string",
                          "example": "2024-01-01T00:00:00.000Z"
                        },
                        "currency": {
                          "type": "string",
                          "example": "ZMW"
                        },
                        "availableBalance": {
                          "type": "string",
                          "example": "0.00"
                        },
                        "ledgerBalance": {
                          "type": "string",
                          "example": "0.00"
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
                    "value": "{\n    \"status\": false,\n    \"message\": \"Account was not found or api key does not have access to the account\",\n    \"data\": []\n}"
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
                      "example": "Account was not found or api key does not have access to the account"
                    },
                    "data": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {}
                      }
                    }
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
  "_id": "65f06b6583c5de0051b8aa08:65f06b6583c5de0051b8aa0d"
}
```