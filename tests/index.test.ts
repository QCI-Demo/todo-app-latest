const mockListen = jest.fn((_port: number, cb?: () => void) => {
  cb?.();
});

jest.mock("../src/app", () => ({
  createApp: jest.fn(() => ({
    listen: mockListen,
  })),
}));

import { startServer } from "../src/index";

describe("startServer", () => {
  beforeEach(() => {
    mockListen.mockClear();
  });

  it("listens on the default port", () => {
    startServer();
    expect(mockListen).toHaveBeenCalledWith(3000, expect.any(Function));
  });
});
