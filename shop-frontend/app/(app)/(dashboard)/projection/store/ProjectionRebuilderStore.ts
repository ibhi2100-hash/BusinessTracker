"use client";

import { create } from "zustand";

import type {
  RebuildProgressStatus,
} from "../components/RebuildProgress";

import type {
  RebuildLogEntry,
} from "../components/RebuildLog";

export interface ReplayEvent {
  id: string;
  type: string;
  position: number;
  status:
    | "PENDING"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED";
  consumer?: string;
  error?: string;
}

export interface ConsumerActivity {
  name: string;
  status:
    | "IDLE"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED";

  eventType?: string;
  processedEvents: number;
  lastDuration?: number;
  error?: string;
}

export interface ProjectionStatus {
  name: string;

  status:
    | "READY"
    | "REBUILDING"
    | "COMPLETED"
    | "FAILED";

  rows: number;

  lastEventPosition: number;

  error?: string;
}

interface RebuilderState {

  status: RebuildProgressStatus;

  totalEvents: number;

  processedEvents: number;

  currentEvent: ReplayEvent | null;

  currentConsumer: string | null;

  error: string | null;

  events: ReplayEvent[];

  consumers: ConsumerActivity[];

  projections: ProjectionStatus[];

  logs: RebuildLogEntry[];

  startedAt: number | null;

  completedAt: number | null;

  setStatus: (
    status: RebuildProgressStatus
  ) => void;

  setTotalEvents: (
    total: number
  ) => void;

  setCurrentEvent: (
    event: ReplayEvent | null
  ) => void;

  setCurrentConsumer: (
    consumer: string | null
  ) => void;

  setError: (
    error: string | null
  ) => void;

  setEvents: (
    events: ReplayEvent[]
  ) => void;

  updateEvent: (
    id: string,
    update: Partial<ReplayEvent>
  ) => void;

  updateConsumer: (
    name: string,
    update: Partial<ConsumerActivity>
  ) => void;

  setProjections: (
    projections: ProjectionStatus[]
  ) => void;

  updateProjection: (
    name: string,
    update: Partial<ProjectionStatus>
  ) => void;

  addLog: (
    entry: RebuildLogEntry
  ) => void;

  clearLogs: () => void;

  start: () => void;

  complete: () => void;

  reset: () => void;
}

export const useRebuilderStore =
  create<RebuilderState>((set) => ({

    status: "IDLE",

    totalEvents: 0,

    processedEvents: 0,

    currentEvent: null,

    currentConsumer: null,

    error: null,

    events: [],

    consumers: [],

    projections: [],

    logs: [],

    startedAt: null,

    completedAt: null,

    setStatus: status =>
      set({
        status,
      }),

    setTotalEvents: totalEvents =>
      set({
        totalEvents,
      }),

    setCurrentEvent: currentEvent =>
      set({
        currentEvent,
      }),

    setCurrentConsumer: currentConsumer =>
      set({
        currentConsumer,
      }),

    setError: error =>
      set({
        error,
      }),

    setEvents: events =>
      set({
        events,
        totalEvents: events.length,
      }),

    updateEvent: (id, update) =>
      set(state => ({
        events: state.events.map(event =>
          event.id === id
            ? {
                ...event,
                ...update,
              }
            : event
        ),
      })),

    updateConsumer: (name, update) =>
      set(state => ({
        consumers: state.consumers.map(
          consumer =>
            consumer.name === name
              ? {
                  ...consumer,
                  ...update,
                }
              : consumer
        ),
      })),

    setProjections: projections =>
      set({
        projections,
      }),

    updateProjection: (name, update) =>
      set(state => ({
        projections:
          state.projections.map(
            projection =>
              projection.name === name
                ? {
                    ...projection,
                    ...update,
                  }
                : projection
          ),
      })),

    addLog: entry =>
      set(state => ({
        logs: [
          ...state.logs,
          entry,
        ],
      })),

    clearLogs: () =>
      set({
        logs: [],
      }),

    start: () =>
      set({
        status: "RESETTING",
        processedEvents: 0,
        currentEvent: null,
        currentConsumer: null,
        error: null,
        startedAt: Date.now(),
        completedAt: null,
        logs: [],
      }),

    complete: () =>
      set({
        status: "COMPLETED",
        completedAt: Date.now(),
        currentConsumer: null,
      }),

    reset: () =>
      set({
        status: "IDLE",
        totalEvents: 0,
        processedEvents: 0,
        currentEvent: null,
        currentConsumer: null,
        error: null,
        events: [],
        consumers: [],
        projections: [],
        logs: [],
        startedAt: null,
        completedAt: null,
      }),

  }));