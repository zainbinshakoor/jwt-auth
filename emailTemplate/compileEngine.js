const handlebars = require('handlebars')
const fs = require('fs')
const emailTemplateDirectory = `${__dirname}/template`
const templatePath = (templateName) =>
    fs.readFileSync(`${emailTemplateDirectory}/${templateName}.hbs`, 'utf8')



// Fetch .hbs templates
const EmailTemplate = templatePath('email')



// Compile .hbs templates
const compiledEmail = handlebars.compile(EmailTemplate)


// Exporting compiled templates
module.exports.emailTemplate = {
    compiledEmail
}
