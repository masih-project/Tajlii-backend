export interface Comment {
  readonly _id: string;
  readonly comment: string;
  readonly parent: string;
  readonly product: string;
}
