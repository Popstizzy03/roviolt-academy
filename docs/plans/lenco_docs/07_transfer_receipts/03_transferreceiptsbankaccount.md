/transfer-recipients/bank-account

# /transfer-recipients/bank-account

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
		    "type": "bank-account",
		    "accountName": string,
		    "accountNumber": string,
		    "bank": {
		        "id": string,
		        "name": string,
		        "country": string
		    }
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
    "/transfer-recipients/bank-account": {
      "post": {
        "summary": "/transfer-recipients/bank-account",
        "description": "Create transfer recipient as a bank account",
        "operationId": "create-transfer-recipient-as-bank-account",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "accountNumber",
                  "bankId"
                ],
                "properties": {
                  "accountNumber": {
                    "type": "string"
                  },
                  "bankId": {
                    "type": "string"
                  },
                  "country": {
                    "type": "string",
                    "description": "Optional"
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
                    "value": "{\n    \"status\": true,\n    \"message\": \"\",\n    \"data\": {\n        \"id\": \"d4f71d4a-eda4-4237-9976-5cbdc8a54cf3\",\n        \"details\": {\n            \"type\": \"bank-account\",\n            \"accountName\": \"Beata Jean\",\n            \"accountNumber\": \"9130000000000\",\n            \"bank\": {\n                \"id\": \"002\",\n                \"name\": \"Absa Bank\",\n                \"country\": \"zm\"\n            }\n        },\n        \"currency\": \"ZMW\",\n        \"type\": \"bank-account\",\n        \"country\": \"zm\"\n    }\n}"
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
                          "example": "d4f71d4a-eda4-4237-9976-5cbdc8a54cf3"
                        },
                        "details": {
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
                        "currency": {
                          "type": "string",
                          "example": "ZMW"
                        },
                        "type": {
                          "type": "string",
                          "example": "bank-account"
                        },
                        "country": {
                          "type": "string",
                          "example": "zm"
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
  "_id": "65f06b6583c5de0051b8aa08:65f06b6583c5de0051b8aa12"
}
```