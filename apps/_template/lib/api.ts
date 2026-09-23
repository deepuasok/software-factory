"use client";

import { useCallback, useState } from "react";

/**
 * The client's way of talking to its own routes.
 *
 * Four verbs, one error shape, JSON in and JSON out. Use these instead of a
 * bare `fetch` so that every screen fails the same way and nobody has to
 * remember the headers.
 */

/** What a route sends back when it refuses. Show `message`, log the rest. */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function request<T>(method: string, path: string, body?: unknown, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...init,
  });

  const text = await response.text();
  const parsed: unknown = text ? safeParse(text) : null;

  if (!response.ok) {
    const message =
      (typeof parsed === "object" && parsed !== null && "message" in parsed
        ? String((parsed as { message: unknown }).message)
        : "") || `The request failed (${response.status}).`;
    throw new ApiError(response.status, message, parsed);
  }

  return parsed as T;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function get<T>(path: string, init?: RequestInit) {
  return request<T>("GET", path, undefined, init);
}

export function post<T>(path: string, body?: unknown, init?: RequestInit) {
  return request<T>("POST", path, body, init);
}

export function put<T>(path: string, body?: unknown, init?: RequestInit) {
  return request<T>("PUT", path, body, init);
}

export function del<T>(path: string, init?: RequestInit) {
  return request<T>("DELETE", path, undefined, init);
}

/**
 * Show the change straight away, put it back if the save fails.
 *
 * Use it wherever people nudge a figure and expect the screen to react — rule
 * 3 of the principles. Do not use it for creating a record: a new row that
 * vanishes again is worse than a short wait.
 */
export function useOptimistic<T>(initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback(
    async (next: T, save: (next: T) => Promise<unknown>) => {
      const previous = value;
      setValue(next);
      setSaving(true);
      setError(null);
      try {
        await save(next);
      } catch (cause) {
        setValue(previous);
        setError(cause instanceof Error ? cause.message : "The change could not be saved.");
      } finally {
        setSaving(false);
      }
    },
    [value],
  );

  return { value, setValue, apply, saving, error };
}
