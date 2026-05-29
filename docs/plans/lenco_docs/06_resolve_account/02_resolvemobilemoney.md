/resolve/mobile-money

# /resolve/mobile-money

Response Schema:

```json
{
    "status": boolean,
    "message": string,
    "data": {
	    "type": "mobile-money",
	    "accountName": string,
	    "phone": string,
	    "operator": string,
	    "country": string
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
    "/resolve/mobile-money": {
      "post": {
        "summary": "/resolve/mobile-money",
        "description": "",
        "operationId": "resolve-mobile-money-account",
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
                    "description": "either `mtn`, `airtel`, or `zamtel`",
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
              },
              "examples": {
                "Request Example": {
                  "value": {
                    "phone": "0961111111",
                    "operator": "mtn",
                    "country": "zm"
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
                    "value": "{\n    \"status\": true,\n    \"message\": \"\",\n    \"data\": {\n        \"type\": \"mobile-money\",\n        \"accountName\": \"Beata Jean\",\n        \"phone\": \"0750000000\",\n        \"operator\": \"zamtel\",\n        \"country\": \"zm\"\n    }\n}"
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
                    "value": "{\n    \"status\": false,\n    \"message\": \"Account details was not found\",\n    \"data\": null\n}"
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
                      "example": "Account details was not found"
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
  "_id": "65f06b6583c5de0051b8aa08:65f19d984120a1001d1d60f4"
}
```