import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// ── Mocks (must be declared before imports that use them) ─────────────────────

jest.mock("@/lib/firebase", () => ({ auth: {} }));

jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// ── Imports that depend on the mocks ─────────────────────────────────────────

import LoginPage from "./page";
import { signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "sonner";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fillAndSubmit = (email: string, password: string) => {
  render(<LoginPage />);
  fireEvent.change(screen.getByPlaceholderText("Email address"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByPlaceholderText("Password"), {
    target: { value: password },
  });
  fireEvent.click(screen.getByText("Login with Email"));
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("LoginPage – email login error handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  it('shows "User not found" for auth/user-not-found', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
      code: "auth/user-not-found",
    });

    fillAndSubmit("nobody@example.com", "password123");

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("User not found");
    });
  });

  it('shows "wrong password" for auth/wrong-password', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
      code: "auth/wrong-password",
    });

    fillAndSubmit("user@example.com", "badpass");

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("wrong password");
    });
  });

  it('shows "invalid email format" for auth/invalid-email', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
      code: "auth/invalid-email",
    });

    fillAndSubmit("not-an-email", "password123");

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("invalid email format");
    });
  });

  it('shows "Login failed" for any unrecognised error', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
      code: "auth/some-unknown-error",
    });

    fillAndSubmit("user@example.com", "password123");

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Login failed");
    });
  });
});
