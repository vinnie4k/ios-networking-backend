// Firebase Admin SDK
const serviceAccount = "./service_account_key.json";
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ios-networking-lec-default-rtdb.firebaseio.com",
});

const { getDatabase } = require("firebase-admin/database");
const { onRequest } = require("firebase-functions/v2/https");

// Express
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors({ origin: true }));
app.use(express.json());

/**
 * Fetch all members
 */
app.get("/", async (req, res) => {
  try {
    const snapshot = await getDatabase().ref("/").once("value");
    return res.status(200).send(snapshot.val());
  } catch (error) {
    return res.status(400).send("Unable to fetch all members");
  }
});

/**
 * Add a member to the roster
 *
 * Request body contains:
 * - name (String)
 * - position (String)
 * - subteam (String)
 */
app.post("/", async (req, res) => {
  const name = req.body.name;
  const position = req.body.position;
  const subteam = req.body.subteam;

  if (name == null || position == null || subteam == null) {
    return res.status(400).send("Invalid request body");
  }

  try {
    const snapshot = await getDatabase().ref("/").once("value");
    const members = snapshot.val();

    const newMember = {
      name: name,
      position: position,
      subteam: subteam,
    };

    members.push(newMember);

    await getDatabase().ref("/").set(members);
    return res.status(200).send(newMember);
  } catch (error) {
    return res.status(400).send("Unable to add a member");
  }
});

/**
 * Delete all members in the roster
 */
app.delete("/delete/", async (req, res) => {
  try {
    await getDatabase().ref("/").remove();
    return res.status(200).send("Successfully deleted all members from roster");
  } catch (error) {
    return res.status(400).send(error);
  }
});

exports.iosCourse = onRequest({ region: "us-east1" }, app);
