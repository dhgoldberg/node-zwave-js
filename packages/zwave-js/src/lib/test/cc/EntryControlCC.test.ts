import {
	CommandClass,
	EntryControlCCConfigurationGet,
	EntryControlCCConfigurationReport,
	EntryControlCCConfigurationSet,
	EntryControlCCEventSupportedGet,
	EntryControlCCEventSupportedReport,
	EntryControlCCKeySupportedGet,
	EntryControlCCKeySupportedReport,
	EntryControlCCNotification,
	EntryControlCommand,
	EntryControlDataTypes,
	EntryControlEventTypes,
} from "@zwave-js/cc";
import { CommandClasses } from "@zwave-js/core";
import test from "ava";

function buildCCBuffer(payload: Buffer): Buffer {
	return Buffer.concat([
		Buffer.from([
			CommandClasses["Entry Control"], // CC
		]),
		payload,
	]);
}

test("the Notification command should deserialize correctly", (t) => {
	const data = buildCCBuffer(
		Buffer.concat([
			Buffer.from([
				EntryControlCommand.Notification, // CC Command
				0x1,
				0x2,
				0x3,
				16,
				49,
				50,
				51,
				52,
			]),
			// Required padding for ASCII
			Buffer.alloc(12, 0xff),
		]),
	);

	const cc = CommandClass.parse(
		data,
		{ sourceNodeId: 1 } as any,
	) as EntryControlCCNotification;
	t.is(cc.constructor, EntryControlCCNotification);

	t.deepEqual(cc.sequenceNumber, 1);
	t.deepEqual(cc.dataType, EntryControlDataTypes.ASCII);
	t.deepEqual(cc.eventType, EntryControlEventTypes.DisarmAll);
	t.deepEqual(cc.eventData, "1234");
});

test("the ConfigurationGet command should serialize correctly", (t) => {
	const cc = new EntryControlCCConfigurationGet({
		nodeId: 1,
	});
	const expected = buildCCBuffer(
		Buffer.from([
			EntryControlCommand.ConfigurationGet, // CC Command
		]),
	);
	t.deepEqual(cc.serialize({} as any), expected);
});

test("the ConfigurationSet command should serialize correctly", (t) => {
	const cc = new EntryControlCCConfigurationSet({
		nodeId: 1,
		keyCacheSize: 1,
		keyCacheTimeout: 2,
	});
	const expected = buildCCBuffer(
		Buffer.from([
			EntryControlCommand.ConfigurationSet, // CC Command
			0x1,
			0x2,
		]),
	);
	t.deepEqual(cc.serialize({} as any), expected);
});

test("the ConfigurationReport command should be deserialize correctly", (t) => {
	const data = buildCCBuffer(
		Buffer.from([
			EntryControlCommand.ConfigurationReport, // CC Command
			0x1,
			0x2,
		]),
	);

	const cc = CommandClass.parse(
		data,
		{ sourceNodeId: 1 } as any,
	) as EntryControlCCConfigurationReport;
	t.is(cc.constructor, EntryControlCCConfigurationReport);

	t.deepEqual(cc.keyCacheSize, 1);
	t.deepEqual(cc.keyCacheTimeout, 2);
});

test("the EventSupportedGet command should serialize correctly", (t) => {
	const cc = new EntryControlCCEventSupportedGet({
		nodeId: 1,
	});
	const expected = buildCCBuffer(
		Buffer.from([
			EntryControlCommand.EventSupportedGet, // CC Command
		]),
	);
	t.deepEqual(cc.serialize({} as any), expected);
});

test("the EventSupportedReport command should be deserialize correctly", (t) => {
	const data = buildCCBuffer(
		Buffer.from([
			EntryControlCommand.EventSupportedReport, // CC Command
			1,
			0b00000100,
			4,
			0b01101000,
			0b00000000,
			0b00000000,
			0b00000010,
			1,
			20,
			2,
			9,
		]),
	);

	const cc = CommandClass.parse(
		data,
		{ sourceNodeId: 1 } as any,
	) as EntryControlCCEventSupportedReport;
	t.is(cc.constructor, EntryControlCCEventSupportedReport);

	t.deepEqual(cc.supportedDataTypes, [EntryControlDataTypes.ASCII]);
	t.deepEqual(cc.supportedEventTypes, [
		EntryControlEventTypes.DisarmAll,
		EntryControlEventTypes.ArmAway,
		EntryControlEventTypes.ArmHome,
		EntryControlEventTypes.Cancel,
	]);
	t.deepEqual(cc.minKeyCacheSize, 1);
	t.deepEqual(cc.maxKeyCacheSize, 20);
	t.deepEqual(cc.minKeyCacheTimeout, 2);
	t.deepEqual(cc.maxKeyCacheTimeout, 9);
});

test("the KeySupportedGet command should serialize correctly", (t) => {
	const cc = new EntryControlCCKeySupportedGet({ nodeId: 1 });
	const expected = buildCCBuffer(
		Buffer.from([
			EntryControlCommand.KeySupportedGet, // CC Command
		]),
	);
	t.deepEqual(cc.serialize({} as any), expected);
});

test("the KeySupportedReport command should be deserialize correctly", (t) => {
	const data = buildCCBuffer(
		Buffer.from([
			EntryControlCommand.KeySupportedReport, // CC Command
			1,
			0b01011010,
		]),
	);

	const cc = CommandClass.parse(
		data,
		{ sourceNodeId: 1 } as any,
	) as EntryControlCCKeySupportedReport;
	t.is(cc.constructor, EntryControlCCKeySupportedReport);

	t.deepEqual(cc.supportedKeys, [1, 3, 4, 6]);
});
