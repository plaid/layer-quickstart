import { useState, useRef, useEffect } from "react";
import { usePlaidLink, PlaidLinkOptions } from "react-plaid-link";
import Header from "../components/Header";
import { callMyServer } from "../lib/utils";
import PhoneInputStep from "../components/PhoneInputStep";
import BirthdayInputStep from "../components/BirthdayInputStep";
import DefaultSignUpForm from "../components/DefaultSignUpForm";
import SuccessDisplay from "../components/SuccessDisplay";
import DebugCard from "../components/DebugCard";
import { AccountSessionInfo } from "../lib/types";
import { v4 as uuidv4 } from "uuid";

enum FlowState {
  WELCOME = "WELCOME",
  PHONE_INPUT = "PHONE_INPUT",
  BIRTHDAY_INPUT = "BIRTHDAY_INPUT",
  MANUAL_FORM = "MANUAL_FORM",
  SUCCESS = "SUCCESS",
}

const Home: React.FC = () => {
  const [clientUserId] = useState<string>(() => uuidv4());
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [flowState, setFlowState] = useState<FlowState>(FlowState.WELCOME);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [accountInfo, setAccountInfo] = useState<AccountSessionInfo | null>(
    null
  );
  const [debugInfo, setDebugInfo] = useState<string>(
    "Debug info will appear here..."
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const linkOpenRef = useRef<Function | null>(null);
  // Honestly, we're just using this for smarter debug messages
  const usingEARef = useRef<boolean>(false);

  // We fetch the session token (and therefore initialize link) as soon as
  // possible.
  useEffect(() => {
    // Fetch session token when component mounts
    const fetchSessionToken = async () => {
      try {
        const response = await callMyServer<{ linkToken: string }>(
          "/server/tokens/create_session_token",
          true,
          { clientUserId },
          setDebugInfo
        );
        setLinkToken(response.linkToken);
      } catch (error) {
        console.error("Error fetching session token:", error);
      }
    };
    fetchSessionToken();
  }, [clientUserId]);

  const config: PlaidLinkOptions = {
    onSuccess: (public_token, metadata) => {
      console.log(`Link's onSuccess callback was triggered!`);
      console.log({ public_token, metadata });
      callMyServer(
        "/server/tokens/fetch_account_session_info",
        true,
        {
          publicToken: public_token,
        },
        setDebugInfo
      ).then((data: AccountSessionInfo) => {
        console.log(data);
        setAccountInfo(data);
        setFlowState(FlowState.SUCCESS);
      });
    },
    onExit: (err, metadata) => {
      console.log(`Link's onExit callback was triggered!`);
      console.log({ err, metadata });
      setFlowState(FlowState.MANUAL_FORM);
    },
    onEvent: (eventName, metadata) => {
      console.log(
        `Event ${eventName} was sent with metadata: ${JSON.stringify(metadata)}`
      );
      if (eventName === "LAYER_READY") {
        if (linkOpenRef.current) {
          linkOpenRef.current();
          setDebugInfo(
            `Layer's Eligibility API has determined this user is eligible for ${
              usingEARef.current ? "Extended Autofill" : "Layer"
            }, so Link is displaying the Layer UI. Make sure to enter 123456 for the SMS code!\n\nOpen your JavaScript console to see other Link events that are getting triggered.`
          );
        }
      } else if (eventName === "VERIFY_PHONE") {
        setDebugInfo(
          `Our app is not set up to receive webhooks, but if it were, we would be receiving a LAYER_AUTHENTICATION_PASSED webhook right about now because the user has verified their phone number.`
        );
      } else if (eventName === "LAYER_NOT_AVAILABLE") {
        usingEARef.current = true;
        setFlowState(FlowState.BIRTHDAY_INPUT);
      } else if (eventName === "LAYER_AUTOFILL_NOT_AVAILABLE") {
        setFlowState(FlowState.MANUAL_FORM);
      }
    },
    token: linkToken,
  };

  const { open: linkOpen, submit: linkSubmit } = usePlaidLink(config);

  useEffect(() => {
    linkOpenRef.current = linkOpen;
  }, [linkOpen]);

  const handleCreateAccountButtonClicked = () => {
    setFlowState(FlowState.PHONE_INPUT);
  };

  const handlePhoneSubmit = () => {
    linkSubmit({ phone_number: phoneNumber });
  };

  const handleBirthdaySubmit = () => {
    linkSubmit({ date_of_birth: dateOfBirth });
  };

  useEffect(() => {
    switch (flowState) {
      case FlowState.WELCOME:
        if (linkToken) {
          setDebugInfo(
            `Because we might be creating a new account, we've already generated a link token (${linkToken}) and initialized Link. This helps to minimize latency for the user.`
          );
        } else {
          setDebugInfo("Creating a new link token...");
        }
        break;
      case FlowState.PHONE_INPUT:
        setDebugInfo(
          "Enter 415-555-0011 to simulate a phone number that is already in Plaid's system (and eligible for Layer), or 415-555-0000 for a phone number that isn't."
        );
        break;
      case FlowState.BIRTHDAY_INPUT:
        setDebugInfo(
          "Layer's Eligibility API has determined this user is not eligible for Layer, but if you'd like, you can ask the user for their date of birth to see if they're eligible for Extended Autofill. Enter 01/18/1975 to simulate a birthday that is eligible for Extended Autofill, and any other date otherwise."
        );
        break;
      case FlowState.MANUAL_FORM:
        setDebugInfo(
          "Looks like our user is not eligible for Layer or Extended Autofill (or they failed the Layer attempt), so we can fallback to using a traditional sign-up form. Your user can continue the sign-up process like before, and in most cases, they will never know Plaid was involved."
        );
        break;
      case FlowState.SUCCESS:
        setDebugInfo(
          "Our user has successfully completed Layer! We can send the public token we received from Link down to our server and fetch the user's identity information as well as an access token for any connected banks. Normally, you'd save this information in a database somewhere."
        );
        break;
    }
  }, [flowState, linkToken]);

  // Render based on current flow state
  const renderContent = () => {
    switch (flowState) {
      case FlowState.WELCOME:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Welcome to Gopher Brokerage!
            </h2>
            <button
              onClick={handleCreateAccountButtonClicked}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 mb-4 text-lg"
            >
              Create a new account
            </button>
            <div className="text-center text-sm text-gray-600">
              <a href="#" className="hover:text-blue-500">
                Already have an account? Sign in here
              </a>
            </div>
          </div>
        );

      case FlowState.PHONE_INPUT:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Create Your Account
            </h2>
            <PhoneInputStep
              phoneNumber={phoneNumber}
              onPhoneNumberChange={setPhoneNumber}
              onSubmit={handlePhoneSubmit}
            />
          </div>
        );

      case FlowState.BIRTHDAY_INPUT:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Create Your Account
            </h2>
            <BirthdayInputStep
              phoneNumber={phoneNumber}
              dateOfBirth={dateOfBirth}
              onDateOfBirthChange={setDateOfBirth}
              onSubmit={handleBirthdaySubmit}
            />
          </div>
        );

      case FlowState.MANUAL_FORM:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Create Your Account
            </h2>
            <DefaultSignUpForm />
          </div>
        );

      case FlowState.SUCCESS:
        return accountInfo ? (
          <SuccessDisplay
            identity={accountInfo.identity}
            bankName={accountInfo.bankName}
            accountObjects={accountInfo.accountObjects}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex items-center justify-center pt-8 pb-8 flex-grow">
        {renderContent()}
      </div>
      <div className="max-w-4xl mx-auto w-full px-4 pb-4">
        <DebugCard debugInfo={debugInfo} />
      </div>
    </div>
  );
};

export default Home;
