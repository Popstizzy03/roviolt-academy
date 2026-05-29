Encryption

# Encryption

The transport between client applications and Lenco is secured using TLS/SSL, which means data is encrypted by default when transmitted across networks.

In addition, certain endpoints of the Lenco API make use of JSON Web Encryption (JWE) to provide end-to-end payload encryption to secure sensitive data. For instance, the [Card Collection API](https://lenco-api.readme.io/v2.0/reference/initiate-collection-from-card) must comply with the Payment Card Industry Data Security Standard in dealing with cardholder Personally Identifying Information (PII).

JSON Web Encryption (JWE) represents encrypted content using JSON-based data structures and base64url encoding. Lenco uses JWE compact serialization for the encryption of sensitive data.

Lenco encryption uses AES in GCM (Galois/Counter Mode) mode with PKCS#7 padding and RSA with OAEP (Optimal Asymmetric Encryption Padding).

<br />

### The Encryption Keys

**RSA**\
Encryption involves a 2048-bit RSA public/private key pair. Data encrypted using a public key can only be decrypted using the corresponding private key.

The client application will get an RSA public key using the [Get Encryption Key](https://lenco-api.readme.io/v2.0/reference/get-encryption-key) endpoint, which allows to encrypt the request payload.

**AES**\
For performance reasons, RSA asymmetric encryption is combined with AES symmetric encryption. For that, a one-time usage 256-bit AES session key is generated and encrypted using the RSA public key. The encrypted (or wrapped) key is sent in the payload along with the encrypted data.

<br />

### The Encryption Process

Here are the steps for sending an encrypted payload:

1. An AES session key is generated along with some encryption parameters
2. Sensitive data are encrypted using the AES key
3. The AES key is encrypted using the RSA public key gotten from the [Get Encryption Key](https://lenco-api.readme.io/v2.0/reference/get-encryption-key) endpoint
4. The payload is sent with the encrypted session key and parameters

<br />

### How to Encrypt Payload

The encrypted payload is structured in JSON Web Encryption (JWE) format, the plain text JSON body is encrypted to form a JWE encrypted payload that is sent as the request body (replacing the plain text data).

**Step 1**: Construct the original JSON per the API specification.

**Step 2**: Get the RSA public key using from the [Get Encryption Key](https://lenco-api.readme.io/v2.0/reference/get-encryption-key) endpoint. Beware that this key might change anytime and therefore should not be stored and reused.

**Step 3**: Use JWE to encrypt the original request in compact serialized form using the below JOSE headers:

| JOSE Header | Value                                      | Description                                                                                   |
| :---------- | :----------------------------------------- | :-------------------------------------------------------------------------------------------- |
| enc         | A256GCM                                    | encryption algorithm                                                                          |
| alg         | RSA-OAEP-256                               | Key encryption algorithm                                                                      |
| cty         | application/json                           | content type of the encrypted payload                                                         |
| kid         | `kid` property of the RSA public key (JWK) | Public Fingerprint ID which is used to identify the private key needed to decrypt the message |

**Step 4**: Construct request payload as shown below:

```json
{
	"encryptedPayload": "JWE encrypted payload"
}
```

<br />

Examples:

```go
package main

import (
	"github.com/lestrrat-go/jwx/jwa"
	"github.com/lestrrat-go/jwx/jwe"
	"github.com/lestrrat-go/jwx/jwk"
)

func encrypt(payload []byte) (string, error) {
	jwkJSON := `{
		"kty": "RSA",
		"use": "enc",
		"n": "nApb8LyyFrZw4A(...)W1RpGR6Z7zcNikiZcQ",
		"e": "AQAB",
		"kid": "2bbb0d(...)2f68aa"
	}`

	rsaPublicKey, err := jwk.ParseKey([]byte(jwkJSON))
	if err != nil {
		return "", err
	}

	encrypted, err := jwe.Encrypt(payload, jwa.RSA_OAEP_256, rsaPublicKey, jwa.A256GCM, jwa.NoCompress)
	if err != nil {
		return "", err
	}

	return string(encrypted[:]), nil
}
```
```node
const jose = require("jose");

async function encrypt(payload) {
    const jwkData = {
        "kty": "RSA",
        "use": "enc",
        "n": "nApb8LyyFrZw4A(...)W1RpGR6Z7zcNikiZcQ",
        "e": "AQAB",
        "kid": "2bbb0d(...)2f68aa"
    };

    const rsaPublicKey = await jose.importJWK(jwkData);
    const text = JSON.stringify(payload);
    const jwe = await new jose.CompactEncrypt(new TextEncoder().encode(text))
        .setProtectedHeader({
            alg: 'RSA-OAEP-256',
            enc: 'A256GCM',
            cty: 'application/json',
            kid: jwkData.kid
        })
        .encrypt(rsaPublicKey);

    return jwe;
}
```

> 🚧 NB
>
> The examples above are just code samples to help get you started. Lenco does not in any way recommend the use of these libraries.\
> It is important that you scrutinise / audit any third party library or package before using it in production.