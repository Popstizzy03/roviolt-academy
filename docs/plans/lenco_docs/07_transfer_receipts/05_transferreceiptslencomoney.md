/transfer-recipients/lenco-money

# /transfer-recipients/lenco-money

Create transfer recipient as a bank account

Response schema:

```json
{
    "status": boolean,
    "message": string,
    "data": {
	    "id": string,
	    "currency": string,
	    "type": "string",
	    "country": string,
	    "details": {
		    "type": "lenco-money",
		    "accountName": string,
		    "walletNumber": string
		}
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
    "/transfer-recipients/lenco-money": {
      "post": {
        "summary": "/transfer-recipients/lenco-money",
        "description": "Create transfer recipient as a bank account",
        "operationId": "create-transfer-recipient-as-lenco-money",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "walletNumber"
                ],
                "properties": {
                  "walletNumber": {
                    "type": "string"
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
                    "value": "{\n    \"status\": true,\n    \"message\": \"\",\n    \"data\": {\n        \"id\": \"d4f71d4a-eda4-4237-9976-5cbdc8a54cf3\",\n        \"details\": {\n            \"type\": \"lenco-money\",\n            \"accountName\": \"Beata Jean\",\n            \"walletNumber\": \"0000001\",\n        },\n        \"currency\": \"ZMW\",\n        \"type\": \"lenco-money\",\n        \"country\": \"zm\"\n    }\n}"
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
                    "value": "{\n    \"status\": false,\n    \"message\": \"Account Details could not be verified\",\n    \"data\": null\n}"
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
                      "example": "Account Details could not be verified"
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
  "_id": "65f06b6583c5de0051b8aa08:65f17927342f24003acc1fbb"
}
```