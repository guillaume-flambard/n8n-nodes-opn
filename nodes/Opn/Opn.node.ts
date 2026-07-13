import type { INodeType, INodeTypeDescription } from 'n8n-workflow';
import { chargeFields, chargeOperations } from './descriptions/ChargeDescription';

export class Opn implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Opn',
		name: 'opn',
		icon: 'file:opn.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Opn Payments (formerly Omise) API',
		defaults: { name: 'Opn' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'opnApi', required: true }],
		requestDefaults: {
			baseURL: 'https://api.omise.co',
			headers: { Accept: 'application/json' },
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				default: 'charge',
				options: [
					{ name: 'Charge', value: 'charge' },
					{ name: 'Customer', value: 'customer' },
					{ name: 'Refund', value: 'refund' },
				],
			},
			...chargeOperations,
			...chargeFields,
		],
	};
}
