import {
	CommandClass,
	SceneActivationCC,
	SceneActivationCCSet,
	SceneActivationCommand,
} from "@zwave-js/cc";
import { CommandClasses, Duration } from "@zwave-js/core";
import test from "ava";

function buildCCBuffer(payload: Buffer): Buffer {
	return Buffer.concat([
		Buffer.from([
			CommandClasses["Scene Activation"], // CC
		]),
		payload,
	]);
}

test("the Set command (without Duration) should serialize correctly", (t) => {
	const cc = new SceneActivationCCSet({
		nodeId: 2,
		sceneId: 55,
	});
	const expected = buildCCBuffer(
		Buffer.from([
			SceneActivationCommand.Set, // CC Command
			55, // id
			0xff, // default duration
		]),
	);
	t.deepEqual(cc.serialize({} as any), expected);
});

test("the Set command (with Duration) should serialize correctly", (t) => {
	const cc = new SceneActivationCCSet({
		nodeId: 2,
		sceneId: 56,
		dimmingDuration: new Duration(1, "minutes"),
	});
	const expected = buildCCBuffer(
		Buffer.from([
			SceneActivationCommand.Set, // CC Command
			56, // id
			0x80, // 1 minute
		]),
	);
	t.deepEqual(cc.serialize({} as any), expected);
});

test("the Set command should be deserialized correctly", (t) => {
	const ccData = buildCCBuffer(
		Buffer.from([
			SceneActivationCommand.Set, // CC Command
			15, // id
			0x00, // 0 seconds
		]),
	);
	const cc = CommandClass.parse(
		ccData,
		{ sourceNodeId: 2 } as any,
	) as SceneActivationCCSet;
	t.is(cc.constructor, SceneActivationCCSet);

	t.is(cc.sceneId, 15);
	t.deepEqual(cc.dimmingDuration, new Duration(0, "seconds"));
});

test("deserializing an unsupported command should return an unspecified version of SceneActivationCC", (t) => {
	const serializedCC = buildCCBuffer(
		Buffer.from([255]), // not a valid command
	);
	const cc = CommandClass.parse(
		serializedCC,
		{ sourceNodeId: 2 } as any,
	) as SceneActivationCC;
	t.is(cc.constructor, SceneActivationCC);
});

// test("the CC values should have the correct metadata", (t) => {
// 	// Readonly, 0-99
// 	const currentValueMeta = getCCValueMetadata(
// 		CommandClasses["Scene Activation"],
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
// 		CommandClasses["Scene Activation"],
// 		"targetValue",
// 	);
// 	t.like(targetValueMeta, {
// 		readable: true,
// 		writeable: true,
// 		min: 0,
// 		max: 99,
// 	});
// });
