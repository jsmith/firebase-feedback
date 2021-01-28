import * as functions from "firebase-functions";
import sgMail from "@sendgrid/mail";
import admin from "firebase-admin";
import path from "path";

const config = functions.config();
const sengridApiKey = config.env.sendgrid_api_key;
const notificationEmail = config.env.notification_email;
const senderEmail = config.env.sender_email;

if (!notificationEmail || !sengridApiKey || !senderEmail) {
  throw Error("Functions config not set properly.");
}

sgMail.setApiKey(sengridApiKey);

export const onFeedbackGiven = functions.firestore
  .document("user_data/{userId}/feedback/{feedbackId}")
  .onCreate(async (object) => {
    const { feedback, type } = object.data();
    const id = object.id;
    const userId = object.ref.parent.parent!.id;

    const bucket = admin.storage().bucket();
    const [files] = await bucket.getFiles({
      prefix: `${userId}/feedback/${id}/`,
    });

    const responses = await Promise.all(
      files.map((file) =>
        file.getSignedUrl({
          action: "read",
          // The maximum is 7 days
          // This makes the download links valid for 5 days
          expires: Date.now() + 1000 * 60 * 60 * 24 * 5,
        })
      )
    );

    const links = responses.map(([response]) => response);
    const htmlLinks = links.map(
      (link, i) =>
        `<a style="display: block" href="${link}">${path.basename(
          files[i].name
        )}</a>`
    );

    const user = await admin.auth().getUser(userId);
    await sgMail.send({
      from: senderEmail,
      to: notificationEmail,
      subject: `Feedback From ${user.email} [${type}]`,
      html: `
        <div>
          <div style="">
          ${feedback}
          </div>
          <div style="margin-top: 1rem">
          Feedback ID: ${id}
          </div>
          <div>
          Attachments
          </div>
          
          ${htmlLinks ? htmlLinks.join("\n") : "None"}
        </div>
        `,
      });
    }); 
