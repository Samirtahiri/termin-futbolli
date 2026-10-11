"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import * as actions from "@/lib/actions";
import { deleteRemoteMatch, deleteRemotePerson } from "@/lib/remote";
import { emptyState, store } from "@/lib/store";
import type { AppState } from "@/lib/types";

const SERVER_STATE = emptyState();
const getServerState = () => SERVER_STATE;
const getClientHydrated = () => store.isHydrated();
const getServerHydrated = () => false;

export function useHydrated(): boolean {
  return useSyncExternalStore(
    store.subscribe,
    getClientHydrated,
    getServerHydrated,
  );
}

export function useAppState(): AppState {
  return useSyncExternalStore(store.subscribe, store.get, getServerState);
}

export function useStoreReady(): { state: AppState; ready: boolean } {
  const ready = useHydrated();
  const state = useAppState();
  useEffect(() => {
    if (!store.isHydrated()) store.hydrate();
  }, []);
  return { state: ready ? state : SERVER_STATE, ready };
}

type ActionName = keyof typeof actions;

type BoundActions = {
  [K in ActionName]: (
    ...args: Parameters<(typeof actions)[K]> extends [AppState, ...infer Rest]
      ? Rest
      : never
  ) => ReturnType<(typeof actions)[K]>;
};

export function useActions(): BoundActions {
  return useMemo(() => {
    const bound = {} as BoundActions;
    (Object.keys(actions) as ActionName[]).forEach((key) => {
      // @ts-expect-error generic bind
      bound[key] = (...args: unknown[]) => {
        let result: unknown;
        store.update((prev) => {
          // @ts-expect-error generic apply
          result = actions[key](prev, ...args);
          if (result && typeof result === "object" && "state" in result) {
            return (result as { state: AppState }).state;
          }
          return result as AppState;
        });
        if (key === "deleteMatch" && typeof args[0] === "string") {
          void deleteRemoteMatch(args[0]);
        }
        if (key === "removeRosterPlayer" && typeof args[0] === "string") {
          void deleteRemotePerson(args[0]);
        }
        return result;
      };
    });
    return bound;
  }, []);
}
