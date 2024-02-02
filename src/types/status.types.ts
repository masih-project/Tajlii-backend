export enum statusUser {
  PENDING = 0,
  CONFIRMED = 1,
  CANCELED = 2,
  TEST = 3,
  CANCELED_BY_MARKETER = 4,
}
export enum statusAdmin {
  CONFIRMED = 0,
  CANCELED = 1,
}
export enum statusInventory {
  CONFIRMED = 0,
  CANCELED = 1,
}
export enum statusComment {
  PENDING = 0,
  CONFIRMED = 1,
  CANCELED = 2,
}
export enum statusOrder {
  WAITING_COMPLETION_INFORMATION = 0,
  WAITING_PAYMENT = 1,
  WAITING_CONFIRMED = 2,
  CONFIRMED = 3,
  CANCELED = 4,
  RETURNED = 5,
  DELETED = 6,
}
export enum statusShipping {
  WAITING_CONFIRMED = 0,
  PREPARING = 1,
  POSTED = 2,
  DELIVERDD = 3,
}
export enum statusCopun {}
export enum statusTransaction {
  AWAITING_PAYMENT = 0,
  SUCCESS = 1,
  FAILED = 2,
}
export enum statusReceiverDepartment {
  TECHNICAL = 'TECHNICAL',
  FINANCIAL = 'FINANCIAL',
  SALE = 'SALE',
}
export enum statusTicket {
  OPEN = 0,
  ANSWERED_USER = 1,
  ANSWERED_ADMIN = 2,
  INPROGRESS = 3,
  CLOSED = 4,
}
export enum statusPeriod {
  AWAITING_PAYMENT = 0,
  SUCCESSFUL_PAYMENT = 1,
  FAILED_PAYMENT = 2,
}

export enum statusProduct {
  CONFIRMED = 0,
  CANCELED = 1,
}
export enum statusBlog {
  DRAFT = 0,
  PUBLISHED = 1,
}
export enum statusBlogComment {
  PENDING = 0,
  CONFIRMED = 1,
  CANCELED = 2,
}

export function getEnumKeys(enumObj: any) {
  return Object.keys(enumObj).filter((x) => isNaN(parseInt(x)));
}
