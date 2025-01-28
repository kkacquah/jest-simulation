import { resolve } from "path";
import { runSimulacraTest } from "../../../../runSimulacraTest";

describe("SimulationReporter", () => {
  const testFile = resolve(__dirname, "../fakeTests/expectEventually.test.ts");

  it("should format successful test output correctly", async () => {
    const result = await runSimulacraTest(testFile, {
      args: [
        "-t",
        "should eventually pass when condition becomes true on third turn",
      ],
    });

    expect(result.stdout).toMatchSnapshot();
  });

  it("should format failed test output correctly", async () => {
    const result = await runSimulacraTest(testFile, {
      args: ["-t", "should fail when condition never becomes true"],
    });

    expect(result.stdout).toMatchSnapshot();
  });
});
