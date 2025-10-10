import express from "express";
import plaidClient from "../plaid.js";

const router = express.Router();

const LAYER_TEMPLATE_ID = process.env.LAYER_TEMPLATE_ID ?? "";

/**
 * Endpoint for creating a session token for the Layer flow.
 */
router.post("/create_session_token", async (req, res, next) => {
  try {
    const { clientUserId } = req.body;

    const response = await plaidClient.sessionTokenCreate({
      template_id: LAYER_TEMPLATE_ID,
      user: { client_user_id: clientUserId },
    });

    console.log("Session token response:", response.data);
    const linkToken = response.data.link.link_token;
    res.json({ linkToken });
  } catch (error) {
    console.warn("Error creating session token:", error);
    next(error);
  }
});

/**
 * Endpoint for fetching account session information, including identity and bank information.
 */
router.post("/fetch_account_session_info", async (req, res, next) => {
  try {
    const { publicToken } = req.body;
    const userAccountResponse = await plaidClient.userAccountSessionGet({
      public_token: publicToken,
    });
    console.log("Account session token response:", userAccountResponse.data);
    const accessToken = userAccountResponse.data.items[0]?.access_token;
    let bankName = "";
    let accountObjects = [];
    if (accessToken) {
      ({ bankName, accountObjects } = await fetchBanksAndAccounts(accessToken));
    }
    res.json({
      identity: userAccountResponse.data.identity,
      bankName,
      accountObjects,
    });
  } catch (error) {
    console.warn("Error getting account session token:", error);
    next(error);
  }
});

const fetchBanksAndAccounts = async function (accessToken) {
  const accountsResponse = await plaidClient.accountsGet({
    access_token: accessToken,
  });
  const bankName = accountsResponse.data.item.institution_name;

  // Look at all the accounts that might be associated with the item
  const accounts = accountsResponse.data.accounts;
  const accountObjects = accounts.map((account) => {
    return {
      acctName: account.name,
      balance: account.balances.current,
      acctType: account.type,
      acctSubtype: account.subtype,
      acctMask: account.mask,
    };
  });

  return { bankName, accountObjects };
};
export default router;
