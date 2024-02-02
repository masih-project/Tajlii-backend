export const ActionTypeItems = ['Manage', 'Create', 'Read', 'Update', 'Delete', 'Report'];
export type ActionType = 'Manage' | 'Create' | 'Read' | 'Update' | 'Delete' | 'Report';

export const SubjectTypeItems = [
  'Address',
  'Order',
  'Cart',
  'Brand',
  'Category',
  'Echantillon',
  'Comment',
  'Coupon',
  'Layout',
  'Role',
  'Department',
  'Depot',
  'Network',
  'Payment',
  'Period',
  'Product',
  'Province',
  'Rank',
  'Reward',
  'Ticket',
  'Transaction',
  'User',
  'Setting',
  'Admin',
  'Campaign',
  'Blog',
  'CategoryBlog',
];
export type SubjectType = (typeof SubjectTypeItems)[number];

export type PermissionType = `${ActionType}.${SubjectType}`;

export const PermissionTypeItems = SubjectTypeItems.flatMap((s) => ActionTypeItems.map((a) => `${a}.${s}`));
export const PermissionTypeGroups = SubjectTypeItems.map((s) => ActionTypeItems.map((a) => `${a}.${s}`));
