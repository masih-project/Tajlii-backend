export interface Notification {
  _id: string;
  message: string;
  is_view: boolean;
  receivers: string[];
}
