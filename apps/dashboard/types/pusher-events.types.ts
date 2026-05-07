export interface NotificationCreatedEvent {
  eventType: string;
  timestamp: Date;
  notification: {
    id: string;
    type: "TICKET" | "PAYMENT" | "ACCOUNT" | "OTHER";
    action: "CREATE" | "UPDATE" | "DELETE";
    sender: {
      id: string;
      fullname: string;
      email: string;
      profilePhoto: string;
    };
  };
}
