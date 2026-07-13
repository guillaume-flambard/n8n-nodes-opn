import { Opn } from '../nodes/Opn/Opn.node';
import type { INodeProperties } from 'n8n-workflow';

const node = new Opn();
const props = node.description.properties;

function operationOptions(resource: string): INodeProperties {
	const op = props.find(
		(p) =>
			p.name === 'operation' &&
			(p.displayOptions?.show?.resource as string[])?.includes(resource),
	);
	if (!op) throw new Error(`no operation selector for ${resource}`);
	return op;
}

function routingOf(resource: string, operation: string) {
	const op = operationOptions(resource);
	const choice = (op.options as Array<{ value: string; routing?: unknown }>).find(
		(o) => o.value === operation,
	);
	if (!choice) throw new Error(`${resource}.${operation} not found`);
	return (choice as { routing: { request: { method: string; url: string } } }).routing.request;
}

describe('Opn node description', () => {
	test('declarative base', () => {
		expect(node.description.name).toBe('opn');
		expect(node.description.requestDefaults?.baseURL).toBe('https://api.omise.co');
		expect(node.description.credentials).toEqual([{ name: 'opnApi', required: true }]);
	});

	test('charge operations route to Omise endpoints', () => {
		expect(routingOf('charge', 'create')).toEqual({ method: 'POST', url: '/charges' });
		expect(routingOf('charge', 'get')).toEqual({
			method: 'GET',
			url: '=/charges/{{$parameter.chargeId}}',
		});
		expect(routingOf('charge', 'getAll')).toEqual({ method: 'GET', url: '/charges' });
		expect(routingOf('charge', 'capture')).toEqual({
			method: 'POST',
			url: '=/charges/{{$parameter.chargeId}}/capture',
		});
	});

	test('charge create sends amount and currency in the body', () => {
		const amount = props.find((p) => p.name === 'amount' && p.displayOptions?.show?.resource?.includes('charge'));
		expect(amount?.routing?.send).toEqual({ type: 'body', property: 'amount' });
		expect(amount?.description).toContain('subunits');
		const currency = props.find((p) => p.name === 'currency');
		expect(currency?.routing?.send).toEqual({ type: 'body', property: 'currency' });
	});

	test('refund create routes to nested charges endpoint', () => {
		expect(routingOf('refund', 'create')).toEqual({
			method: 'POST',
			url: '=/charges/{{$parameter.chargeId}}/refunds',
		});
	});

	test('customer operations route correctly', () => {
		expect(routingOf('customer', 'create')).toEqual({ method: 'POST', url: '/customers' });
		expect(routingOf('customer', 'get')).toEqual({
			method: 'GET',
			url: '=/customers/{{$parameter.customerId}}',
		});
	});

	test('refund amount is required and body-routed', () => {
		const amount = props.find(
			(p) => p.name === 'refundAmount' && p.displayOptions?.show?.resource?.includes('refund'),
		);
		expect(amount?.required).toBe(true);
		expect(amount?.routing?.send).toEqual({ type: 'body', property: 'amount' });
	});
});
