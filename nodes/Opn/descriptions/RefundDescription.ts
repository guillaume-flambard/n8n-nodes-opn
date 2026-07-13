import type { INodeProperties } from 'n8n-workflow';

export const refundOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['refund'] } },
		default: 'create',
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Refund a charge',
				routing: { request: { method: 'POST', url: '=/charges/{{$parameter.chargeId}}/refunds' } },
			},
		],
	},
];

export const refundFields: INodeProperties[] = [
	{
		displayName: 'Charge ID',
		name: 'chargeId',
		type: 'string',
		required: true,
		default: '',
		description: 'Charge to refund (chrg_…)',
		displayOptions: { show: { resource: ['refund'], operation: ['create'] } },
	},
	{
		displayName: 'Amount',
		name: 'refundAmount',
		type: 'number',
		required: true,
		default: 0,
		description:
			'Refund amount in subunits (smallest unit of the charge currency). 10000 = 100.00 THB. No conversion is applied.',
		displayOptions: { show: { resource: ['refund'], operation: ['create'] } },
		routing: { send: { type: 'body', property: 'amount' } },
	},
];
