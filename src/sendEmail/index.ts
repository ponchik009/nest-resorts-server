'use strict';
const nodemailer = require('nodemailer');
require('dotenv').config();

export const sendEmail = async (
  reciever: string,
  subject: string,
  text: string,
) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.USER,
      pass: process.env.PASSWORD,
    },
  });

  await transporter.sendMail({
    from: '"HOTEL SUPPORT 👻" <lolikonru@mail.ru>', // sender address
    to: reciever, // list of receivers
    subject: subject, // Subject line
    html: text, // html body
  });
};
