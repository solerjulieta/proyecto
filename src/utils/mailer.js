import nodemailer from 'nodemailer'
import { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM } from '../config/env.js' 

const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: MAIL_PORT,
    auth: {
        user: MAIL_USER,
        pass: MAIL_PASS
    }
})

export const sendReservationConfirmation = async({ to, firstName, eventTitle, eventDate, eventLocation, reservationCode }) => {
    await transporter.sendMail({
        from: MAIL_FROM,
        to,
        subject: `Confirmación de reserva - ${eventTitle}`,
        html: `
            <h2>¡Reserva confirmada!</h2>
            <p>Hola ${firstName},</p>
            <p>Tu reserva para <strong>${eventTitle}</strong> fue confirmada.</p>
            <ul>
                <li><strong>Código de reserva</strong> ${reservationCode}</li>
                <li><strong>Fecha:</strong> ${new Date(eventDate).toLocaleString('es-AR')} </li>
                <li><strong>Lugar:</strong> ${eventLocation} </li>
            </ul>
            <p>¡Te esperamos!</p>
        `
    })
}