// Require:
const postmark = require("postmark");

// Send an email:
const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

const sendWelcomeEmail = (name,email) => {
    client.sendEmail({
        "From": "f20190142@goa.bits-pilani.ac.in",
        "To": email,
        "Subject": "Welcome to Task Manager API",
        "TextBody": "Welcome to the app, " + name + " .Let us know, how you get along with the app."
      });
}

const sendCancellationEmail = (name,email) => {
    client.sendEmail({
        "From": "f20190142@goa.bits-pilani.ac.in",
        "To": email,
        "Subject": "We are sad, you are going.",
        "TextBody": "Tussi ja rahe ho, na jao."
      });
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}