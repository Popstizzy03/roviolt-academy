# LENCO CONNECTIONS
## SHELL
```shell
	Credentials
	Header: xo+CAiijrIy9XvZCYyhjrv0fpSAL6CfU8CgA+up1NXqK
	# Log in to use your API keys
--> cURL Request: 
		curl --request GET \
     --url 'https://api.lenco.co/access/v2/accounts?page=1' \
     --header 'Authorization: Bearer xo+CAiijrIy9XvZCYyhjrv0fpSAL6CfU8CgA+up1NXqK' \
     --header 'accept: application/json'

--> HTTPie 
		http GET 'https://api.lenco.co/access/v2/accounts?page=1' \
  Authorization:'Bearer xo+CAiijrIy9XvZCYyhjrv0fpSAL6CfU8CgA+up1NXqK' \
  accept:application/json
```
## NODE JS
### API Request
```ts
	// install: npx api install "@lenco-api/v2.0#fdgtgltokrj06"
	import lencoApi from '@api/lenco-api';

lencoApi.auth('Bearer xo+CAiijrIy9XvZCYyhjrv0fpSAL6CfU8CgA+up1NXqK');
lencoApi.getAccounts({page: '1'})
  .then(({ data }) => console.log(data))
  .catch(err => console.error(err));
```

### AXIOS Request
```ts
	// install: npm install axios --save
	import axios from 'axios';

const options = {
  method: 'GET',
  url: 'https://api.lenco.co/access/v2/accounts?page=1',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer xo+CAiijrIy9XvZCYyhjrv0fpSAL6CfU8CgA+up1NXqK'
  }
};

axios
  .request(options)
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
```

### Fetch Request
```ts
	const url = 'https://api.lenco.co/access/v2/accounts?page=1';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer xo+CAiijrIy9XvZCYyhjrv0fpSAL6CfU8CgA+up1NXqK'
  }
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error(err));
```

### HTTP Request
```ts
	const http = require('https');

const options = {
  method: 'GET',
  hostname: 'api.lenco.co',
  port: null,
  path: '/access/v2/accounts?page=1',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer xo+CAiijrIy9XvZCYyhjrv0fpSAL6CfU8CgA+up1NXqK'
  }
};

const req = http.request(options, function (res) {
  const chunks = [];

  res.on('data', function (chunk) {
    chunks.push(chunk);
  });

  res.on('end', function () {
    const body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

req.end();
```

### HMLHTTP Request
```ts
	const data = null;

const xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener('readystatechange', function () {
  if (this.readyState === this.DONE) {
    console.log(this.responseText);
  }
});

xhr.open('GET', 'https://api.lenco.co/access/v2/accounts?page=1');
xhr.setRequestHeader('accept', 'application/json');
xhr.setRequestHeader('Authorization', 'Bearer xo+CAiijrIy9XvZCYyhjrv0fpSAL6CfU8CgA+up1NXqK');

xhr.send(data);
```