const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'wdit@ahmcho.com',
        subject: 'WhereDidITravel - Thanks for joining!',
        text: `Welcome to the app, ${name}.`
    })
}

const sendCancellationEmail = (email,name) => {
    sgMail.send({
        to: email,
        from: 'wdit@ahmcho.com',
        subject: 'WhereDidITravel - We\'re sorry you\'re leaving us :(',
        text: `Hey,${name}, it sucks that we have to split our paths. Let us know which feature is missing.`
    })
}

const sendResetPasswordEmail = (email, host, token) => {
    sgMail.send({
        to: email,
        from: 'wdit@ahmcho.com',
        subject: 'WhereDidITravel - Forgot password / Reset',
        text: `You are receiving this because you (or someone else)
		  have requested the reset of the password for your account.
			Please click on the following link, or copy and paste it
			into your browser to complete the process:
			${host}/reset/${token}
			If you did not request this, please ignore this email and
			your password will remain unchanged.`.replace(/		  /g, ''),
    })
}

const sendPasswordChangedEmail = (email) => {
    sgMail.send({
        to: email,
        from: 'wdit@ahmcho.com',
        subject: 'WhereDidITravel - Password Changed',
        text: `Hello,
		  This email is to confirm that the password for your account has just been changed.
		  If you did not make this change, please hit reply and notify us at once.`.replace(/		  /g, '')
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail,
    sendResetPasswordEmail,
    sendPasswordChangedEmail
}