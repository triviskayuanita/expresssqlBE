const sgMail = require('@sendgrid/mail')
const sgAPIKey = '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'

sgMail.setApiKey(sgAPIKey)

const sendVerify = (username, name, email) => {
    sgMail.send({
        to: email,
        from: 'triviskayuanita@gmail.com',
        subject: "Verifikasi Email",
        html: `<h1><a href='http://localhost:2010/verify?username=${username}'>Klik untuk verifikasi</a></h1>`
    })
}

module.exports = {
    sendVerify
}




