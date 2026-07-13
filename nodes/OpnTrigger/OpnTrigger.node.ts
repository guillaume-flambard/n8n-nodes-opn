import type {
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';

const EVENT_OPTIONS = [
	{ name: 'All Events', value: '*' },
	{ name: 'Charge Complete', value: 'charge.complete' },
	{ name: 'Charge Create', value: 'charge.create' },
	{ name: 'Charge Update', value: 'charge.update' },
	{ name: 'Customer Create', value: 'customer.create' },
	{ name: 'Refund Create', value: 'refund.create' },
	{ name: 'Transfer Pay', value: 'transfer.pay' },
];

export class OpnTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Opn Trigger',
		name: 'opnTrigger',
		icon: 'file:opn.svg',
		group: ['trigger'],
		version: 1,
		description: 'Starts a workflow on Opn (Omise) webhook events',
		defaults: { name: 'Opn Trigger' },
		inputs: [],
		outputs: ['main'],
		credentials: [{ name: 'opnApi', required: true }],
		webhooks: [
			{ name: 'default', httpMethod: 'POST', responseMode: 'onReceived', path: 'webhook' },
		],
		properties: [
			{
				displayName:
					'Register this webhook URL in your Opn dashboard (Settings → Webhooks). Opn sends every event to it; this node filters and verifies.',
				name: 'setupNotice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				default: ['*'],
				options: EVENT_OPTIONS,
				description: 'Only emit for these event keys',
			},
			{
				displayName: 'Verify Event',
				name: 'verifyEvent',
				type: 'boolean',
				default: true,
				description:
					'Whether to re-fetch the event from the Opn API before emitting. Opn webhooks are unsigned; verification prevents spoofed payloads.',
			},
		],
	};

	webhookMethods = {
		default: {
			// Webhook endpoint is registered manually in the Opn dashboard — nothing to create or
			// delete on Opn's side, so activation just accepts the static URL.
			async checkExists(): Promise<boolean> {
				return true;
			},
			async create(): Promise<boolean> {
				return true;
			},
			async delete(): Promise<boolean> {
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData() as IDataObject;
		if (body?.object !== 'event' || typeof body.id !== 'string') {
			return {};
		}

		const events = this.getNodeParameter('events', ['*']) as string[];
		const key = body.key as string;
		if (!events.includes('*') && !events.includes(key)) {
			return {};
		}

		let payload: IDataObject = body;
		const verifyEvent = this.getNodeParameter('verifyEvent', true) as boolean;
		if (verifyEvent) {
			try {
				payload = (await this.helpers.httpRequestWithAuthentication.call(this, 'opnApi', {
					method: 'GET',
					url: `https://api.omise.co/events/${body.id}`,
					json: true,
				})) as IDataObject;
			} catch {
				// Unverifiable event (spoofed, deleted, or wrong account) — acknowledge and drop.
				return {};
			}
		}

		return {
			workflowData: [this.helpers.returnJsonArray(payload)],
		};
	}
}
