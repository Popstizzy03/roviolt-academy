/transfers/lenco-merchant

# /transfers/lenco-merchant

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
            "type": "lenco-merchant",
            "accountName": string,
            "tillNumber": string
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
    "/transfers/lenco-merchant": {
      "post": {
        "summary": "/transfers/lenco-merchant",
        "description": "",
        "operationId": "initiate-transfer-to-lenco-merchant",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "accountId",
                  "amount",
                  "reference"
                ],
                "properties": {
                  "accountId": {
                    "type": "string",
                    "description": "Your 36-character account uuid to debit"
                  },
                  "amount": {
                    "type": "number",
                    "format": "double"
                  },
                  "narration": {
                    "type": "string",
                    "description": "Optional"
                  },
                  "reference": {
                    "type": "string",
                    "description": "Unique client reference. Only `-`, `.`, `_` and alphanumeric characters allowed"
                  },
                  "transferRecipientId": {
                    "type": "string",
                    "description": "Optional. 36-character transfer recipient uuid"
                  },
                  "tillNumber": {
                    "type": "string",
                    "description": "Optional. If you do not have the transferRecipientId, use this"
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
                    "value": "{\n    \"status\": true,\n    \"message\": \"\",\n    \"data\": {\n        \"id\": \"9525b4c6-502b-45be-90e1-81eb81a3f424\",\n        \"amount\": \"20.00\",\n        \"fee\": \"8.50\",\n        \"currency\": \"ZMW\",\n        \"narration\": \"Transfer\",\n        \"initiatedAt\": \"2024-01-01T00:00:00.447Z\",\n        \"completedAt\": \"2024-01-01T00:00:01.237Z\",\n        \"accountId\": \"b176cda5-7d97-4a3f-b4dd-ab0234e9e08c\",\n        \"creditAccount\": {\n            \"type\": \"lenco-merchant\",\n            \"accountName\": \"Account Name\",\n            \"tillNumber\": \"0000001\",\n        },\n        \"status\": \"successful\",\n        \"reasonForFailure\": null,\n        \"reference\": \"ref-3\",\n        \"lencoReference\": \"240010002\",\n        \"extraData\": {\n            \"nipSessionId\": null\n        },\n        \"source\": \"api\"\n    }\n}"
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
                    "value": "{\n    \"status\": false,\n    \"message\": \"Duplicate reference\",\n    \"data\": null\n}"
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
  "_id": "65f06b6583c5de0051b8aa08:65f19c1cdc532b000f6c8f0c"
}
```