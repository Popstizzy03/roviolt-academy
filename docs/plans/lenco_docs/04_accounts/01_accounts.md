/accounts

# /accounts

Retrieve information about your bank accounts

Response schema:

```json
{
    "status": boolean,
    "message": string,
    "data": [
    	{
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
    ],
    "meta": {
        "total": number,
        "pageCount": number,
        "perPage": number,
        "currentPage": number
    }
}
```

> 📘 date-time
>
> All date-time fields are expressed in ISO8601 UTC times.

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
    "/accounts": {
      "get": {
        "summary": "/accounts",
        "description": "Retrieve information about your bank accounts",
        "operationId": "get-accounts",
        "parameters": [
          {
            "name": "page",
            "in": "query",
            "description": "If not specified, it defaults to 1",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n    \"status\": true,\n    \"message\": \"\",\n    \"data\": [\n        {\n            \"id\": \"b176cda5-7d97-4a3f-b4dd-ab0234e9e08c\",\n            \"details\": {\n                \"type\": \"lenco-merchant\",\n                \"accountName\": \"Account Name\",\n                \"tillNumber\": \"0000001\"\n            },\n            \"type\": \"Lenco Merchant\",\n            \"status\": \"active\",\n            \"createdAt\": \"2024-01-01T00:00:00.000Z\",\n            \"currency\": \"ZMW\",\n            \"availableBalance\": \"0.00\",\n            \"ledgerBalance\": \"0.00\"\n        }\n    ],\n    \"meta\": {\n        \"total\": 1,\n        \"pageCount\": 1,\n        \"perPage\": 100,\n        \"currentPage\": 1\n    }\n}"
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
                      "type": "array",
                      "items": {
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
                    },
                    "meta": {
                      "type": "object",
                      "properties": {
                        "total": {
                          "type": "integer",
                          "example": 1,
                          "default": 0
                        },
                        "pageCount": {
                          "type": "integer",
                          "example": 1,
                          "default": 0
                        },
                        "perPage": {
                          "type": "integer",
                          "example": 100,
                          "default": 0
                        },
                        "currentPage": {
                          "type": "integer",
                          "example": 1,
                          "default": 0
                        }
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
  "_id": "65f06b6583c5de0051b8aa08:65f06b6583c5de0051b8aa0c"
}
```