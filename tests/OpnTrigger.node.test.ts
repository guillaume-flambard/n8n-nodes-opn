import { OpnTrigger } from '../nodes/OpnTrigger/OpnTrigger.node';
import type { IWebhookFunctions } from 'n8n-workflow';

const trigger = new OpnTrigger();

function ctx(body: unknown, params: Record<string, unknown>, refetched?: unknown) {
	const httpRequestWithAuthentication = jest.fn().mockImplementation(async () => {
		if (refetched === undefined) throw new Error('404');
		return refetched;
	});
	return {
		mock: httpRequestWithAuthentication,
		fns: {
			getBodyData: () => body,
			getNodeParameter: (name: string) => params[name],
			helpers: {
				httpRequestWithAuthentication,
				returnJsonArray: (d: unknown) => [{ json: d }],
			},
		} as unknown as IWebhookFunctions,
	};
}

const event = { object: 'event', id: 'evnt_test_1', key: 'charge.complete', data: { id: 'chrg_1' } };

describe('OpnTrigger webhook', () => {
	test('ignores non-event bodies', async () => {
		const { fns } = ctx({ hello: 'world' }, { events: ['*'], verifyEvent: false });
		expect(await trigger.webhook.call(fns)).toEqual({});
	});

	test('filters out non-selected event keys', async () => {
		const { fns } = ctx(event, { events: ['refund.create'], verifyEvent: false });
		expect(await trigger.webhook.call(fns)).toEqual({});
	});

	test('emits raw event when verify is off', async () => {
		const { fns, mock } = ctx(event, { events: ['charge.complete'], verifyEvent: false });
		const out = await trigger.webhook.call(fns);
		expect(mock).not.toHaveBeenCalled();
		expect(out.workflowData?.[0]?.[0]?.json).toEqual(event);
	});

	test('verify on: emits the REFETCHED event, not the received body', async () => {
		const refetched = { ...event, data: { id: 'chrg_1', status: 'successful' } };
		const { fns, mock } = ctx(event, { events: ['*'], verifyEvent: true }, refetched);
		const out = await trigger.webhook.call(fns);
		expect(mock).toHaveBeenCalledWith('opnApi', expect.objectContaining({ url: 'https://api.omise.co/events/evnt_test_1' }));
		expect(out.workflowData?.[0]?.[0]?.json).toEqual(refetched);
	});

	test('verify on: drops event when refetch fails', async () => {
		const { fns } = ctx(event, { events: ['*'], verifyEvent: true });
		expect(await trigger.webhook.call(fns)).toEqual({});
	});
});
