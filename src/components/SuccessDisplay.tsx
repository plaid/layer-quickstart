import { AccountSessionInfo } from "../lib/types";
import { showAsCurrency } from "../lib/utils";

const SuccessDisplay: React.FC<AccountSessionInfo> = ({
  identity,
  bankName,
  accountObjects,
}) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-2/3 max-w-3xl">
      <h2 className="text-2xl font-semibold mb-6 text-center text-green-600">
        Account Created Successfully! 🎉
      </h2>
      <div className="text-center mb-6">
        <p>Here's some information we collected on the server.</p>
        <p className="text-sm text-gray-500">
          (Which you'd normally want to save in a database somewhere.)
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          Personal Information
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <p>
            <span className="font-medium">Name:</span>{" "}
            {identity.name?.first_name} {identity.name?.last_name}
          </p>
          <p>
            <span className="font-medium">Date of Birth:</span>{" "}
            {identity.date_of_birth}
          </p>
          <p>
            <span className="font-medium">Phone:</span> {identity.phone_number}
          </p>
          {identity.email && (
            <p>
              <span className="font-medium">Email:</span> {identity.email}
            </p>
          )}
          {identity.ssn_last_4 && (
            <p>
              <span className="font-medium">SSN:</span> ***-**-
              {identity.ssn_last_4}
            </p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Address</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p>{identity.address?.street}</p>
          {identity.address?.street2 && <p>{identity.address.street2}</p>}
          <p>
            {identity.address?.city}, {identity.address?.region}{" "}
            {identity.address?.postal_code}
          </p>
          <p>{identity.address?.country}</p>
        </div>
      </div>

      {bankName && accountObjects.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Connected Bank: {bankName}
          </h3>
          <div className="space-y-3">
            {accountObjects.map((account, index) => (
              <div
                key={index}
                className="bg-blue-50 p-4 rounded-lg border border-blue-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{account.acctName}</p>
                    <p className="text-sm text-gray-600">
                      {account.acctType} • {account.acctSubtype} • ****
                      {account.acctMask}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-semibold text-green-600">
                      {showAsCurrency(account.balance)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Reload the page to create another account!
        </h2>
      </div>
    </div>
  );
};

export default SuccessDisplay;
