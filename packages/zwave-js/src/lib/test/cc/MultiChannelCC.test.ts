import { CommandClass } from "@zwave-js/cc";
import {
	BasicCCGet,
	BasicCCReport,
	BasicCCSet,
	BasicCommand,
	MultiChannelCC,
	MultiChannelCCAggregatedMembersGet,
	MultiChannelCCCapabilityGet,
	MultiChannelCCCommandEncapsulation,
	MultiChannelCCEndPointFind,
	MultiChannelCCEndPointGet,
	MultiChannelCCV1CommandEncapsulation,
	MultiChannelCommand,
	MultiCommandCC,
	isEncapsulatingCommandClass,
} from "@zwave-js/cc";
import { CommandClasses } from "@zwave-js/core";
import test from "ava";

function buildCCBuffer(payload: Buffer): Buffer {
	return Buffer.concat([
		Buffer.from([
			CommandClasses["Multi Channel"], // CC
		]),
		payload,
	]);
}

test("is an encapsulating CommandClass", (t) => {
	let cc: CommandClass = new BasicCCSet({
		nodeId: 1,
		targetValue: 50,
	});
	cc = MultiChannelCC.encapsulate(cc);
	t.true(isEncapsulatingCommandClass(cc));
});

test("the EndPointGet command should serialize correctly", (t) => {
	const cc = new MultiChannelCCEndPointGet({ nodeId: 1 });
	const expected = buildCCBuffer(
		Buffer.from([
			MultiChannelCommand.EndPointGet, // CC Command
		]),
	);
	t.deepEqual(cc.serialize({} as any), expected);
});

test("the CapabilityGet command should serialize correctly", (t) => {
	const cc = new MultiChannelCCCapabilityGet({
		nodeId: 2,
		requestedEndpoint: 7,
	});
	const expected = buildCCBuffer(
		Buffer.from([
			MultiChannelCommand.CapabilityGet, // CC Command
			7, // EndPoint
		]),
	);
	t.deepEqual(cc.serialize({} as any), expected);
});

test("the EndPointFind command should serialize correctly", (t) => {
	const cc = new MultiChannelCCEndPointFind({
		nodeId: 2,
		genericClass: 0x01,
		specificClass: 0x02,
	});
	const expected = buildCCBuffer(
		Buffer.from([
			MultiChannelCommand.EndPointFind, // CC Command
			0x01, // genericClass
			0x02, // specificClass
		]),
	);
	t.deepEqual(cc.serialize({} as any), expected);
});

test("the CommandEncapsulation command should serialize correctly", (t) => {
	let cc: CommandClass = new BasicCCSet({
		nodeId: 2,
		targetValue: 5,
		endpointIndex: 7,
	});
	cc = MultiChannelCC.encapsulate(cc);
	const expected = buildCCBuffer(
		Buffer.from([
			MultiChannelCommand.CommandEncapsulation, // CC Command
			0, // source EP
			7, // destination
			CommandClasses.Basic,
			BasicCommand.Set,
			5, // target value
		]),
	);
	t.deepEqual(cc.serialize({} as any), expected);
});

test("the AggregatedMembersGet command should serialize correctly", (t) => {
	const cc = new MultiChannelCCAggregatedMembersGet({
		nodeId: 2,
		requestedEndpoint: 6,
	});
	const expected = buildCCBuffer(
		Buffer.from([
			MultiChannelCommand.AggregatedMembersGet, // CC Command
			6, // EndPoint
		]),
	);
	t.deepEqual(cc.serialize({} as any), expected);
});

test("the CommandEncapsulation command should also accept V1CommandEncapsulation as a response", (t) => {
	// GH#938
	const sent = new MultiChannelCCCommandEncapsulation({
		nodeId: 2,
		destination: 2,
		encapsulated: new BasicCCGet({ nodeId: 2 }),
	});
	const received = new MultiChannelCCV1CommandEncapsulation({
		nodeId: 2,
		encapsulated: new BasicCCReport({
			nodeId: 2,
			currentValue: 50,
		}),
	});
	received.endpointIndex = sent.destination as any;
	t.true(sent.isExpectedCCResponse(received));
});

// test("the Report command (v2) should be deserialized correctly", (t) => {
// 	const ccData = buildCCBuffer(
// 		1,
// 		Buffer.from([
// 			MultiChannelCommand.Report, // CC Command
// 			55, // current value
// 			66, // target value
// 			1, // duration
// 		]),
// 	);
// 	const cc = new MultiChannelCCReport({ data: ccData });

// 	t.is(cc.currentValue, 55);
// 	t.is(cc.targetValue, 66);
// 	t.is(cc.duration!.unit, "seconds");
// 	t.is(cc.duration!.value, 1);
// });

test("deserializing an unsupported command should return an unspecified version of MultiChannelCC", (t) => {
	const serializedCC = buildCCBuffer(
		Buffer.from([255]), // not a valid command
	);
	const cc = CommandClass.parse(
		serializedCC,
		{ sourceNodeId: 1 } as any,
	) as MultiChannelCC;
	t.is(cc.constructor, MultiChannelCC);
});

// test("the CC values should have the correct metadata", (t) => {
// 	// Readonly, 0-99
// 	const currentValueMeta = getCCValueMetadata(
// 		CommandClasses.MultiChannel,
// 		"currentValue",
// 	);
// 	t.like(currentValueMeta, {
// 		readable: true,
// 		writeable: false,
// 		min: 0,
// 		max: 99,
// 	});

// 	// Writeable, 0-99
// 	const targetValueMeta = getCCValueMetadata(
// 		CommandClasses.MultiChannel,
// 		"targetValue",
// 	);
// 	t.like(targetValueMeta, {
// 		readable: true,
// 		writeable: true,
// 		min: 0,
// 		max: 99,
// 	});
// });

test("MultiChannelCC/BasicCCGet should expect a response", (t) => {
	const ccRequest = MultiChannelCC.encapsulate(
		new BasicCCGet({
			nodeId: 2,
			endpointIndex: 2,
		}),
	);
	t.true(ccRequest.expectsCCResponse());
});

test("MultiChannelCC/BasicCCGet (multicast) should expect NO response", (t) => {
	const ccRequest = MultiChannelCC.encapsulate(
		new BasicCCGet({
			nodeId: 2,
			endpointIndex: 2,
		}),
	);
	// A multicast request never expects a response
	ccRequest.destination = [1, 2, 3];
	t.false(ccRequest.expectsCCResponse());
});

test("MultiChannelCC/BasicCCSet should expect NO response", (t) => {
	const ccRequest = MultiChannelCC.encapsulate(
		new BasicCCSet({
			nodeId: 2,
			endpointIndex: 2,
			targetValue: 7,
		}),
	);
	t.false(ccRequest.expectsCCResponse());
});

test("MultiChannelCC/BasicCCGet => MultiChannelCC/BasicCCReport = expected", (t) => {
	const ccRequest = MultiChannelCC.encapsulate(
		new BasicCCGet({
			nodeId: 2,
			endpointIndex: 2,
		}),
	);
	const ccResponse = MultiChannelCC.encapsulate(
		new BasicCCReport({
			nodeId: ccRequest.nodeId,
			currentValue: 7,
		}),
	);
	ccResponse.endpointIndex = 2;

	t.true(ccRequest.isExpectedCCResponse(ccResponse));
});

test("MultiChannelCC/BasicCCGet => MultiChannelCC/BasicCCGet = unexpected", (t) => {
	const ccRequest = MultiChannelCC.encapsulate(
		new BasicCCGet({
			nodeId: 2,
			endpointIndex: 2,
		}),
	);
	const ccResponse = MultiChannelCC.encapsulate(
		new BasicCCGet({
			nodeId: ccRequest.nodeId,
			endpointIndex: 2,
		}),
	);
	ccResponse.endpointIndex = 2;

	t.false(ccRequest.isExpectedCCResponse(ccResponse));
});

test("MultiChannelCC/BasicCCGet => MultiCommandCC/BasicCCReport = unexpected", (t) => {
	const ccRequest = MultiChannelCC.encapsulate(
		new BasicCCGet({
			nodeId: 2,
			endpointIndex: 2,
		}),
	);
	const ccResponse = MultiCommandCC.encapsulate([
		new BasicCCReport({
			nodeId: ccRequest.nodeId,
			currentValue: 7,
		}),
	]);
	ccResponse.endpointIndex = 2;

	t.false(ccRequest.isExpectedCCResponse(ccResponse));
});
