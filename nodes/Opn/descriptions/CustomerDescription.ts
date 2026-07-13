import type { INodeProperties } from 'n8n-workflow';

export const customerOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['customer'] } },
		default: 'create',
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a customer',
				routing: { request: { method: 'POST', url: '/customers' } },
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a customer',
				routing: { request: { method: 'GET', url: '=/customers/{{$parameter.customerId}}' } },
			},
		],
	},
];

export const customerFields: INodeProperties[] = [
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		default: '',
		displayOptions: { show: { resource: ['customer'], operation: ['create'] } },
		routing: { send: { type: 'body', property: 'email' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'customerAdditionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['customer'], operation: ['create'] } },
		options: [
			{
				displayName: 'Card Token',
				name: 'card',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'card' } },
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				routing: { send: { type: 'body', property: 'description' } },
			},
		],
	},
	{
		displayName: 'Customer ID',
		name: 'customerId',
		type: 'string',
		required: true,
		default: '',
		description: 'Customer ID (cust_…)',
		displayOptions: { show: { resource: ['customer'], operation: ['get'] } },
	},
];
