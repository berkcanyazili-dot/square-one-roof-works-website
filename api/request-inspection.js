import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function badRequest(message, statusCode = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return badRequest('Method not allowed', 405)
  }

  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_TO_EMAIL) {
    return badRequest('Server email configuration is missing.', 500)
  }

  try {
    const payload = await request.json()
    const {
      name = '',
      phone = '',
      email = '',
      propertyAddress = '',
      serviceNeeded = '',
      description = '',
      company = '',
    } = payload ?? {}

    if (company) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!name || !phone || !email || !propertyAddress || !serviceNeeded || !description) {
      return badRequest('Please complete all required fields.')
    }

    const fromEmail = process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev'

    await resend.emails.send({
      from: `Square One Roof Works <${fromEmail}>`,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `Free Roof Inspection Request - ${name}`,
      text: [
        'New free roof inspection request',
        '',
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Email: ${email}`,
        `Property Address: ${propertyAddress}`,
        `Service Needed: ${serviceNeeded}`,
        '',
        'Project Details:',
        description,
      ].join('\n'),
    })

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : 'Unable to send inspection request right now.',
      500,
    )
  }
}
