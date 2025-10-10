// Allowing "any" here for cases where we might be receiving large JSON objects
// reflecting responses from the Plaid API (which is useful for a sample app, but
// in production you probably want to leave most of that data on the server).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const callMyServer = async function <T = any>(
  endpoint: string,
  isPost: boolean = false,
  postData: unknown = null,
  onError?: (errorMsg: string) => void
): Promise<T> {
  const optionsObj: RequestInit = isPost ? { method: "POST" } : {};
  if (isPost && postData !== null) {
    optionsObj.headers = { "Content-type": "application/json" };
    optionsObj.body = JSON.stringify(postData);
  }
  const response = await fetch(endpoint, optionsObj);
  if (response.status === 500 || response.status === 400) {
    await handleServerError(response, onError);
    return null as unknown as T;
  }
  const data = await response.json();
  console.log(`Result from calling ${endpoint}: ${JSON.stringify(data)}`);
  return data as T;
};

const handleServerError = async function (
  responseObject: Response,
  onError?: (errorMsg: string) => void
): Promise<void> {
  const error = await responseObject.json();
  console.error("I received an error ", error);

  if (onError) {
    const errorMsg = `❌ Server Error: ${error.error || JSON.stringify(error)}`;
    onError(errorMsg);
  }
};

export const showAsCurrency = function (amount: number): string {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
};
