import {
	CommandClass,
	TimeCC,
	TimeCCDateGet,
	TimeCCDateReport,
	TimeCCTimeGet,
	TimeCCTimeReport,
	TimeCommand,
} from "@zwave-js/cc";
import { CommandClasses } from "@zwave-js/core";
import test from "ava";

function buildCCBuffer(payload: Buffer): Buffer {
	return Buffer.concat([
		Buffer.from([
			CommandClasses.Time, // CC
		]),
		payload,
	]);
}

test("the TimeGet command should serialize correctly", (t) => {
	const cc = new TimeCCTimeGet({ nodeId: 1 });
	const expected = buildCCBuffer(
		Buffer.from([
			TimeCommand.TimeGet, // CC Command
		]),
	);
	t.deepEqual(cc.serialize({} as any), expected);
});

test("the TimeReport command should be deserialized correctly", (t) => {
	const ccData = buildCCBuffer(
		Buffer.from([
			TimeCommand.TimeReport, // CC Command
			14,
			23,
			59,
		]),
	);
	const cc = CommandClass.parse(
		ccData,
		{ sourceNodeId: 8 } as any,
	) as TimeCCTimeReport;
	t.is(cc.constructor, TimeCCTimeReport);

	t.is(cc.hour, 14);
	t.is(cc.minute, 23);
	t.is(cc.second, 59);
});

test("the DateGet command should serialize correctly", (t) => {
	const cc = new TimeCCDateGet({ nodeId: 1 });
	const expected = buildCCBuffer(
		Buffer.from([
			TimeCommand.DateGet, // CC Command
		]),
	);
	t.deepEqual(cc.serialize({} as any), expected);
});

test("the DateReport command should be deserialized correctly", (t) => {
	const ccData = buildCCBuffer(
		Buffer.from([
			TimeCommand.DateReport, // CC Command
			0x07,
			0xc5,
			10,
			17,
		]),
	);
	const cc = CommandClass.parse(
		ccData,
		{ sourceNodeId: 8 } as any,
	) as TimeCCDateReport;
	t.is(cc.constructor, TimeCCDateReport);

	t.is(cc.year, 1989);
	t.is(cc.month, 10);
	t.is(cc.day, 17);
});

test("deserializing an unsupported command should return an unspecified version of TimeCC", (t) => {
	const serializedCC = buildCCBuffer(
		Buffer.from([255]), // not a valid command
	);
	const cc = CommandClass.parse(
		serializedCC,
		{ sourceNodeId: 8 } as any,
	) as TimeCC;
	t.is(cc.constructor, TimeCC);
});

// test("the CC values should have the correct metadata", (t) => {
// 	// Readonly, 0-99
// 	const currentValueMeta = getCCValueMetadata(
// 		CommandClasses.Time,
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
// 		CommandClasses.Time,
// 		"targetValue",
// 	);
// 	t.like(targetValueMeta, {
// 		readable: true,
// 		writeable: true,
// 		min: 0,
// 		max: 99,
// 	});
// });
