import { OpnApi } from '../credentials/OpnApi.credentials';

describe('OpnApi credential', () => {
	const cred = new OpnApi();

	test('exposes correct machine name and masked secret field', () => {
		expect(cred.name).toBe('opnApi');
		const secret = cred.properties.find((p) => p.name === 'secretKey');
		expect(secret?.typeOptions?.password).toBe(true);
	});

	test('authenticates via basic auth with key as username', () => {
		expect(cred.authenticate).toEqual({
			type: 'generic',
			properties: { auth: { username: '={{$credentials.secretKey}}', password: '' } },
		});
	});

	test('credential test hits GET /account', () => {
		expect(cred.test.request.baseURL).toBe('https://api.omise.co');
		expect(cred.test.request.url).toBe('/account');
	});
});
