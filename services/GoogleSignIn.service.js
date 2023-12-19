const { OAuth2Client } = require("google-auth-library");
let GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var client = new OAuth2Client(GOOGLE_CLIENT_ID, "", "");

async function getGoogleUser(idToken) {
  const data = await client.verifyIdToken({
    idToken: idToken,
    audience: GOOGLE_CLIENT_ID,
  });

  return data.getPayload();
}

module.exports = {
  getGoogleUser,
};
