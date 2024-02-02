export const PersonTypeItems = ['LEGAL', 'NATURAl'] as const;
export type PersonType = (typeof PersonTypeItems)[number];

export const ContractStatusItems = <const>['Submited', 'Accepted', 'Rejected', 'Verified', 'VerificationFailed'];
export type ContractStatus = (typeof ContractStatusItems)[number];
