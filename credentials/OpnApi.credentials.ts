import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class OpnApi implements ICredentialType {
	name = 'opnApi';

	displayName = 'Opn API';

	documentationUrl = 'https://docs.opn.ooo/';

	properties: INodeProperties[] = [
		{
			displayName: 'Secret Key',
			name: 'secretKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'Opn secret key. Keys starting with skey_test_ run in test mode; skey_ keys are live.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
				username: '={{$credentials.secretKey}}',
				password: '',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.omise.co',
			url: '/account',
		},
	};
}
