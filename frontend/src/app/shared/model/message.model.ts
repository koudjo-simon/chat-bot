import { MessagePart } from './message-part.model';

export interface Message {
  id: string;
  content: MessagePart[];
  createdAt: Date;
  sender: string;
}
