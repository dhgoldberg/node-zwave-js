import {
	NotificationCCReport,
	NotificationCCValues,
} from "@zwave-js/cc/NotificationCC";
import { ValueMetadata } from "@zwave-js/core";
import { createMockZWaveRequestFrame } from "@zwave-js/testing";
import path from "node:path";
import { setTimeout as wait } from "node:timers/promises";
import { integrationTest } from "../integrationTestSuite";

integrationTest(
	"When receiving an NotificationCC::Report with known typa but an unknown event, the resulting value metadata should contain the ccSpecific field",
	{
		// debug: true,
		provisioningDirectory: path.join(
			__dirname,
			"fixtures/notificationCC",
		),

		testBody: async (t, driver, node, mockController, mockNode) => {
			const cc = new NotificationCCReport({
				nodeId: mockController.ownNodeId,
				notificationType: 0x06, // Access Control,
				notificationEvent: 0xfd, // Manual Lock Operation
			});
			await mockNode.sendToController(
				createMockZWaveRequestFrame(cc, {
					ackRequested: false,
				}),
			);
			// wait a bit for the value to be updated
			await wait(100);

			t.like(
				node.getValueMetadata(
					NotificationCCValues.unknownNotificationVariable(
						0x06,
						"Access Control",
					).id,
				),
				{
					...ValueMetadata.ReadOnlyUInt8,
					label: "Access Control: Unknown value",
					ccSpecific: {
						notificationType: 0x06,
					},
				},
			);
		},
	},
);
