// You could probably make some of these types not optional, depending on your
// eligibility requirements.
export interface AccountSessionInfo {
  identity: {
    name?: { first_name: string; last_name: string };
    address?: {
      street?: string;
      street2?: string;
      city?: string;
      region?: string;
      postal_code?: string;
      country?: string;
    };
    date_of_birth?: string;
    email?: string;
    phone_number: string;
    ssn_last_4?: string;
  };
  bankName: string;
  accountObjects: Array<{
    acctName: string;
    balance: number;
    acctType: string;
    acctSubtype: string;
    acctMask: string;
  }>;
}
