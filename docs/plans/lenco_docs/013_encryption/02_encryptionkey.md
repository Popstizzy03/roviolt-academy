/encryption-key

# /encryption-key

Get RSA public key to [encrypt a request payload](https://lenco-api.readme.io/v2.0/reference/encryption)

This endpoint returns the RSA public key in [JWK](https://datatracker.ietf.org/doc/html/rfc7517) format.

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
    "/encryption-key": {
      "get": {
        "summary": "/encryption-key",
        "description": "Get RSA public key to [encrypt a request payload](https://lenco-api.readme.io/v2.0/reference/encryption)",
        "operationId": "get-encryption-key",
        "responses": {
          "200": {
            "description": "200",
            "content": {
              "application/json": {
                "examples": {
                  "Result": {
                    "value": "{\n    \"status\": true,\n    \"message\": \"\",\n    \"data\": {\n        \"kty\": \"RSA\",\n        \"use\": \"enc\",\n        \"n\": \"nApb8LyyFrZw4A(...)W1RpGR6Z7zcNikiZcQ\",\n        \"e\": \"AQAB\",\n        \"kid\": \"2bbb0d(...)2f68aa\"\n    }\n}"
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
                        "kty": {
                          "type": "string",
                          "example": "RSA"
                        },
                        "use": {
                          "type": "string",
                          "example": "enc"
                        },
                        "n": {
                          "type": "string",
                          "example": "nApb8LyyFrZw4A(...)W1RpGR6Z7zcNikiZcQ"
                        },
                        "e": {
                          "type": "string",
                          "example": "AQAB"
                        },
                        "kid": {
                          "type": "string",
                          "example": "2bbb0d(...)2f68aa"
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
  "_id": "65f06b6583c5de0051b8aa08:6711299a85c2110012b959e6"
}
```