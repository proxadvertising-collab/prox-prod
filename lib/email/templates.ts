export function expiringSoonEmail(deal: any, businessEmail: string) {
  const postUrl = 'https://prox.app/business/post'
  return {
    to: businessEmail,
    subject: 'Your Prox deal expires in 2h - renew?',
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2563eb;">Your deal is expiring soon!</h2>
        <p>Your deal <strong>"${deal.title}"</strong> will expire in approximately 2 hours.</p>
        <p>Keep capturing nearby customers by renewing or posting a new live offer.</p>
        <a href="${postUrl}" style="display: inline-block; background: #2563eb; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-top: 15px;">Renew Deal</a>
      </div>
    `,
  }
}

export function noLiveAdEmail(businessEmail: string) {
  const postUrl = 'https://prox.app/business/post'
  return {
    to: businessEmail,
    subject: 'You have no live deal on Prox - customers nearby are looking',
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2563eb;">Customers nearby are looking!</h2>
        <p>You currently don't have any active live deals on Prox.</p>
        <p>Post a live deal now to attract customers walking right by your business.</p>
        <a href="${postUrl}" style="display: inline-block; background: #2563eb; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-top: 15px;">Post Live Deal</a>
      </div>
    `,
  }
}
