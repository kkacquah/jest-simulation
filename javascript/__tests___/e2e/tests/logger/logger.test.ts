import { resolve } from "path";
import { runSimulacraTest } from "../../../../runSimulacraTest";

describe("logger", () => {
  const testFile = resolve(__dirname, "../fakeTests/expectEventually.test.ts");

  it("should format debug output with colors", async () => {
    const result = await runSimulacraTest(testFile, {
      args: ["-t", 'should format successful test output correctly (with debug logger)'],
      debug: true,
    });

    expect(result.stdout).toMatchSnapshot();
  });
});
