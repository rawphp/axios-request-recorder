# Axios Request/Response Recorder

Records request and responses to a file. Pass a custom handler to handle custom persistance of the recorded mocks.

## Install

```shell
npm install axios-request-recorder
```

## Usage

### Basic Example

```javascript
import axios from 'axios';
import AxiosRecorder from 'axios-request-recorder';

const recorder = new AxiosRecorder();

const client = axios.create();

// register recorder with axios
recorder.register(axios);
```

### Full Example

```javascript
import axios from 'axios';
import AxiosRecorder from 'axios-request-recorder';

const options = {
  serverFile: 'server.json',
  prefix: '/example',
  enabled: true,
  persistHandler: async (mocks) => {
    // do something with the mocks here
    console.log(mocks);
  },
};

const recorder = new AxiosRecorder(options);

const client = axios.create();

// register recorder with axios
recorder.register(axios, );
```

## License

MIT

Copyright (c) 2017 Tom Kaczocha.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
