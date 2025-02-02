import { type MockControllerBehavior } from "@zwave-js/testing";
import { setTimeout as wait } from "node:timers/promises";
import { integrationTest } from "../integrationTestSuite";

integrationTest(
	"The bootloader is detected when received in smaller chunks",
	{
		// Reproduction for issue #7316
		// debug: true,

		additionalDriverOptions: {
			allowBootloaderOnly: true,
		},

		async customSetup(driver, mockController, mockNode) {
			const sendBootloaderMessageInChunks: MockControllerBehavior = {
				async onHostData(self, ctrl) {
					// if (
					// 	ctrl.length === 1
					// 	&& (ctrl[0] === MessageHeaders.NAK || ctrl[0] === 0x32)
					// ) {
					// I've seen logs with as few as 5 bytes in the first chunk
					self.serial.emitData(
						Buffer.from("\0\r\nGeck", "ascii"),
					);
					await wait(20);
					self.serial.emitData(Buffer.from(
						`o Bootloader v2.05.01
1. upload gbl
2. run
3. ebl info
BL >\0`,
						"ascii",
					));
					return true;
					// }
				},
			};
			mockController.defineBehavior(sendBootloaderMessageInChunks);
		},

		testBody: async (t, driver, node, mockController, mockNode) => {
			t.true(driver.isInBootloader());
		},
	},
);
