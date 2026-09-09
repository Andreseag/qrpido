export interface Member {
  user_id: string;
  role: string;
  full_name: string;
}

export type MessageType = "success" | "error";

export interface FeedbackMessage {
  type: MessageType;
  text: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  full_name: string;
  role: string;
}
