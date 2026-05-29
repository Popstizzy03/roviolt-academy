/transactions/:id

# /transactions/:id

Retrieve information about a specific transaction

Response Schema:

```json
{
	"status": boolean,
	"message": string,
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
    "/transactions/{id}": {
      "get": {
        "summary": "/transactions/:id",
        "description": "Retrieve information about a specific transaction",
        "operationId": "get-transaction-by-id",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "description": "Your 36-character transaction uuid",
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
                    "value": "{\n    \"status\": true,\n    \"message\": \"\",\n    \"data\": {\n        \"id\": \"d6730fe6-77a0-4432-a283-832eaef31786\",\n        \"amount\": \"13.00\",\n        \"currency\": \"ZMW\",\n        \"narration\": \"Transfer / 240730006\",\n        \"type\": \"debit\",\n        \"datetime\": \"2024-01-10T14:24:31.931Z\",\n        \"accountId\": \"b176cda5-7d97-4a3f-b4dd-ab0234e9e08c\",\n        \"balance\": \"997559.00\"\n      }\n}"
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
                          "example": "d6730fe6-77a0-4432-a283-832eaef31786"
                        },
                        "amount": {
                          "type": "string",
                          "example": "13.00"
                        },
                        "currency": {
                          "type": "string",
                          "example": "ZMW"
                        },
                        "narration": {
                          "type": "string",
                          "example": "Transfer / 240730006"
                        },
                        "type": {
                          "type": "string",
                          "example": "debit"
                        },
                        "datetime": {
                          "type": "string",
                          "example": "2024-01-10T14:24:31.931Z"
                        },
                        "accountId": {
                          "type": "string",
                          "example": "b176cda5-7d97-4a3f-b4dd-ab0234e9e08c"
                        },
                        "balance": {
                          "type": "string",
                          "example": "997559.00"
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
                    "value": "{\n    \"status\": false,\n    \"message\": \"Transaction was not found\",\n    \"data\": null\n}"
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
                      "example": "Transaction was not found"
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
  "_id": "65f06b6583c5de0051b8aa08:65f06b6583c5de0051b8aa19"
}
```