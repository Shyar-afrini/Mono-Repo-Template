"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import Pusher from "pusher-js";
import { createPusherInstance } from "@/config/pusher.config";
import type { PusherConnectionState } from "@/types/pusher.types";

/**
 * Pusher Context Value
 * Provides Pusher instance and connection management
 */
interface PusherContextValue {
  /**
   * Pusher instance (null if not initialized or failed)
   */
  pusher: Pusher | null;
  /**
   * Whether Pusher is currently connected
   */
  isConnected: boolean;
  /**
   * Current connection state
   */
  connectionState: PusherConnectionState;
  /**
   * Subscribe to a channel and listen for events
   * @param channelName - Name of the channel to subscribe to
   * @param eventName - Name of the event to listen for
   * @param callback - Callback function to handle the event
   * @returns Unsubscribe function
   */
  subscribe: (
    channelName: string,
    eventName: string,
    callback: (data: unknown) => void
  ) => () => void;
  /**
   * Unsubscribe from a channel or specific event
   * @param channelName - Name of the channel to unsubscribe from
   * @param eventName - Optional event name to unsubscribe from (unsubscribes from all events if not provided)
   */
  unsubscribe: (channelName: string, eventName?: string) => void;
  /**
   * Error object if connection failed
   */
  error: Error | null;
}

const PusherContext = createContext<PusherContextValue | undefined>(undefined);

/**
 * Pusher Provider Component
 * Manages Pusher connection lifecycle and provides Pusher instance to children
 */
export const PusherProvider = ({ children }: { children: React.ReactNode }) => {
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] =
    useState<PusherConnectionState>("initializing");
  const [error, setError] = useState<Error | null>(null);

  // Track subscriptions to clean up properly
  const subscriptionsRef = useRef<
    Map<string, Map<string, (data: unknown) => void>>
  >(new Map());

  // Initialize Pusher instance
  useEffect(() => {
    const pusherInstance = createPusherInstance();

    if (!pusherInstance) {
      setConnectionState("error");
      setError(
        new Error("Failed to initialize Pusher. Check environment variables.")
      );
      return;
    }

    setPusher(pusherInstance);
    setConnectionState("connecting");

    // Connection event handlers
    const handleConnectionStateChange = (states: {
      previous: string;
      current: string;
    }) => {
      const { current } = states;

      switch (current) {
        case "connected":
          setConnectionState("connected");
          setIsConnected(true);
          setError(null);
          break;
        case "disconnected":
          setConnectionState("disconnected");
          setIsConnected(false);
          break;
        case "failed":
          setConnectionState("failed");
          setIsConnected(false);
          setError(new Error("Pusher connection failed"));
          break;
        case "connecting":
          setConnectionState("connecting");
          setIsConnected(false);
          break;
        default:
          setConnectionState(current as PusherConnectionState);
      }
    };

    const handleError = (err: { type: string; error: Error }) => {
      console.error("[Pusher] Connection error:", err);
      setConnectionState("error");
      setError(err.error);
      setIsConnected(false);
    };

    // Bind event handlers
    pusherInstance.connection.bind("state_change", handleConnectionStateChange);
    pusherInstance.connection.bind("error", handleError);

    // Set initial state
    const currentState = pusherInstance.connection.state;
    handleConnectionStateChange({
      previous: "initializing",
      current: currentState,
    });

    // Cleanup function
    return () => {
      // Unbind event handlers
      pusherInstance.connection.unbind(
        "state_change",
        handleConnectionStateChange
      );
      pusherInstance.connection.unbind("error", handleError);

      // Copy subscriptions ref to avoid stale closure
      const subscriptions = subscriptionsRef.current;

      // Unsubscribe from all channels
      subscriptions.forEach((events, channelName) => {
        const channel = pusherInstance.channel(channelName);
        if (channel) {
          events.forEach((callback, eventName) => {
            channel.unbind(eventName, callback);
          });
          pusherInstance.unsubscribe(channelName);
        }
      });

      // Disconnect Pusher
      pusherInstance.disconnect();

      // Clear state
      setPusher(null);
      setIsConnected(false);
      setConnectionState("disconnected");
      subscriptions.clear();
    };
  }, []);

  /**
   * Unsubscribe from a channel or specific event
   */
  const unsubscribe = useCallback(
    (channelName: string, eventName?: string) => {
      if (!pusher) {
        console.warn(
          "[Pusher] Cannot unsubscribe: Pusher instance not available"
        );
        return;
      }

      const channelEvents = subscriptionsRef.current.get(channelName);
      if (!channelEvents) {
        console.warn(
          `[Pusher] No subscriptions found for channel: ${channelName}`
        );
        return;
      }

      const channel = pusher.channel(channelName);
      if (!channel) {
        subscriptionsRef.current.delete(channelName);
        return;
      }

      if (eventName) {
        // Unsubscribe from specific event
        const callback = channelEvents.get(eventName);
        if (callback) {
          channel.unbind(eventName, callback);
          channelEvents.delete(eventName);
        }

        // If no more events, unsubscribe from channel
        if (channelEvents.size === 0) {
          pusher.unsubscribe(channelName);
          subscriptionsRef.current.delete(channelName);
        }
      } else {
        // Unsubscribe from all events on channel
        channelEvents.forEach((callback, evtName) => {
          channel.unbind(evtName, callback);
        });
        pusher.unsubscribe(channelName);
        subscriptionsRef.current.delete(channelName);
      }
    },
    [pusher]
  );

  /**
   * Subscribe to a channel and listen for events
   */
  const subscribe = useCallback(
    (
      channelName: string,
      eventName: string,
      callback: (data: unknown) => void
    ) => {
      if (!pusher) {
        return () => {}; // Return no-op unsubscribe function
      }

      // Get or create channel subscription tracking
      if (!subscriptionsRef.current.has(channelName)) {
        subscriptionsRef.current.set(channelName, new Map());
      }

      const channelEvents = subscriptionsRef.current.get(channelName)!;

      // Check if already subscribed to this event
      if (channelEvents.has(eventName)) {
        console.warn(
          `[Pusher] Already subscribed to ${channelName}:${eventName}`
        );
        return () => unsubscribe(channelName, eventName);
      }

      // Subscribe to channel if not already subscribed
      let channel = pusher.channel(channelName);
      if (!channel) {
        channel = pusher.subscribe(channelName);
      }

      // Helper function to bind the event
      const bindEventHandler = () => {
        channel.bind(eventName, callback);
        channelEvents.set(eventName, callback);
      };

      // If channel is already subscribed, bind immediately
      if (channel.subscribed) {
        bindEventHandler();
      } else {
        // Wait for subscription to succeed
        const subscriptionHandler = () => {
          bindEventHandler();
          channel.unbind("pusher:subscription_succeeded", subscriptionHandler);
        };

        channel.bind("pusher:subscription_succeeded", subscriptionHandler);

        // Listen for subscription errors
        channel.bind("pusher:subscription_error", (error: unknown) => {
          console.error("[Pusher] Channel subscription error:", error);
        });
      }

      // Return unsubscribe function
      return () => {
        unsubscribe(channelName, eventName);
      };
    },
    [pusher, unsubscribe]
  );

  const contextValue = useMemo<PusherContextValue>(
    () => ({
      pusher,
      isConnected,
      connectionState,
      subscribe,
      unsubscribe,
      error,
    }),
    [pusher, isConnected, connectionState, subscribe, unsubscribe, error]
  );

  return (
    <PusherContext.Provider value={contextValue}>
      {children}
    </PusherContext.Provider>
  );
};

/**
 * Hook to access Pusher context
 * @throws Error if used outside PusherProvider
 */
export const usePusher = () => {
  const context = useContext(PusherContext);
  if (context === undefined) {
    throw new Error("usePusher must be used within a PusherProvider");
  }
  return context;
};
