import { tryFallback } from ".";

describe("tryFallback", () => {
  it("responds with the first successful implementation", async () => {
    expect.assertions(3);
    const first = jest.fn(async i => i);
    const second = jest.fn(async i => i + 1);
    await expect(
      tryFallback([
        ["first", first],
        ["second", second]
      ])(1)
    ).resolves.toEqual(["first", 1]);
    expect(first).toHaveBeenCalledWith(1);
    expect(second).not.toHaveBeenCalled();
  });

  it("falls back when an implementation throws", async () => {
    expect.assertions(3);
    const first = jest.fn(async () => {
      throw new Error("whoops!");
    });
    const second = jest.fn(async i => i + 1);
    await expect(
      tryFallback([
        ["first", first],
        ["second", second]
      ])(1)
    ).resolves.toEqual(["second", 2]);
    expect(first).toHaveBeenCalledWith(1);
    expect(second).toHaveBeenCalledWith(1);
  });

  it("throws when all implementations throw", async () => {
    expect.assertions(3);
    const first = jest.fn(async () => {
      throw new Error("whoops!");
    });
    const second = jest.fn(async () => {
      throw new Error("whoops again!");
    });
    await expect(
      tryFallback([
        ["first", first],
        ["second", second]
      ])(1)
    ).rejects.toThrow("Fallback functions exhausted");
    expect(first).toHaveBeenCalledWith(1);
    expect(second).toHaveBeenCalledWith(1);
  });

  it("invokes the error handler when an implementation throws", async () => {
    expect.assertions(2);
    const errorHandler = jest.fn();
    const error = new Error("whoops!");
    const first = jest.fn(async () => {
      throw error;
    });
    const second = jest.fn(async i => i + 1);
    await expect(
      tryFallback(
        [
          ["first", first],
          ["second", second]
        ],
        errorHandler
      )(1)
    ).resolves.toEqual(["second", 2]);
    expect(errorHandler).toHaveBeenCalledWith("first", error);
  });
});
