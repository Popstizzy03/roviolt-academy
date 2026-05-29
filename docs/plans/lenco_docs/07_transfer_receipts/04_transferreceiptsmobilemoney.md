/transfer-recipients/mobile-money

# /transfer-recipients/mobile-money

Create transfer recipient as a mobile money

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
		    "type": "mobile-money",
		    "accountName": string,
		    "phone": string,
		    "operator": string
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
    "/transfer-recipients/mobile-money": {
      "post": {
        "summary": "/transfer-recipients/mobile-money",
        "description": "Create transfer recipient as a mobile money",
        "operationId": "create-transfer-recipient-as-mobile-money",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "phone",
                  "operator"
                ],
                "properties": {
                  "phone": {
                    "type": "string"
                  },
                  "operator": {
                    "type": "string",
                    "description": "either `airtel`, `mtn`, or `zamtel`",
                    "enum": [
                      "airtel",
                      "mtn",
                      "zamtel"
                    ]
                  },
                  "country": {
                    "type": "string",
                    "description": "Optional. Currently supporting only `zm`",
                    "enum": [
                      "zm"
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
                    "value": "{\n    \"status\": true,\n    \"message\": \"\",\n    \"data\": {\n        \"id\": \"d6b6e00e-bdb6-43a6-a561-85b61496198e\",\n        \"details\": {\n            \"type\": \"mobile-money\",\n            \"accountName\": \"Beata Jean\",\n            \"phone\": \"0750000000\",\n            \"operator\": \"zamtel\"\n        },\n        \"currency\": \"ZMW\",\n        \"type\": \"mobile-money\",\n        \"country\": \"zm\"\n    }\n}"
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
                          "example": "d6b6e00e-bdb6-43a6-a561-85b61496198e"
                        },
                        "details": {
                          "type": "object",
                          "properties": {
                            "type": {
                              "type": "string",
                              "example": "mobile-money"
                            },
                            "accountName": {
                              "type": "string",
                              "example": "Beata Jean"
                            },
                            "phone": {
                              "type": "string",
                              "example": "0750000000"
                            },
                            "operator": {
                              "type": "string",
                              "example": "zamtel"
                            }
                          }
                        },
                        "currency": {
                          "type": "string",
                          "example": "ZMW"
                        },
                        "type": {
                          "type": "string",
                          "example": "mobile-money"
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
  "_id": "65f06b6583c5de0051b8aa08:65f17924e7695d001ef86449"
}
```