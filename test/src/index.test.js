import { expect } from 'chai';
import axios from 'axios';
import fsp from 'fs-promise';
import AxioxRecorder from './../../src';

describe('AxiosRecorder', () => {
  let recorder;

  beforeEach(() => {
    recorder = new AxioxRecorder();
  });

  afterEach(async () => {
    recorder = undefined;

    await fsp.remove('server.json');
  });

  it('register axios successfully', () => {
    const client = axios.create();

    expect(client.interceptors.request.handlers.length).to.equal(0);
    expect(client.interceptors.response.handlers.length).to.equal(0);

    recorder.register(client, { prefix: '/carrier-integration-australia-post' });

    expect(client.interceptors.request.handlers.length).to.equal(0);
    expect(client.interceptors.response.handlers.length).to.equal(1);
  });

  it('records GET requests successfully', async () => {
    const client = axios.create();

    recorder.register(client, { prefix: '/test-prefix' });

    await client.get('https://jsonplaceholder.typicode.com/posts/1');
    await client.get('https://jsonplaceholder.typicode.com/posts/1/comments');

    expect(recorder.mocks.length).to.equal(2);
  });

  it('records POST requests successfully', async () => {
    const client = axios.create();

    recorder.register(client, { prefix: '/test-prefix' });

    await client.post('https://jsonplaceholder.typicode.com/posts', [{ body: 'test 1' }, { body: 'test 2' }]);
    await client.post('https://jsonplaceholder.typicode.com/posts/1/comments', { message: 'New comment' });

    const mocks = recorder.mocks;

    expect(mocks.length).to.equal(2);
    expect(typeof mocks[0].request.body).to.not.equal('undefined');
  }).timeout(5000);

  it('it calls custom persist handler', async () => {
    const client = axios.create();
    let customCalled = false;

    const customRecorder = new AxioxRecorder({
      persistHandler: async () => {
        customCalled = true;
      },
    });

    customRecorder.register(client);

    await client.post('https://jsonplaceholder.typicode.com/posts', [{ body: 'test 1' }, { body: 'test 2' }]);

    expect(customCalled).to.equal(true);
  });
});
