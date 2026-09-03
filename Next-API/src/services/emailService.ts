import { BrevoClient } from "@getbrevo/brevo";

const apiKey = process.env.BREVO_API_KEY;

if (!apiKey) {
  throw new Error("BREVO_API_KEY não configurada.");
}

const brevo = new BrevoClient({
  apiKey,
});

type SendPasswordResetEmailData = {
  email: string;
  token: string;
};

export async function sendPasswordResetEmail(data: SendPasswordResetEmailData) {
  const resetUrl = `http://localhost:8081/reset-password?token=${encodeURIComponent(data.token)}`;

  await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: "Vehicle Control",
      email: "fellipebordin@gmail",
    },

    to: [
      {
        email: data.email,
      },
    ],

    subject: "Recuperação de senha - Vehicle Control",

    htmlContent: `
      <html>
        <body>
          <h2>Recuperação de senha</h2>

          <p>
            Recebemos uma solicitação para redefinir sua senha.
          </p>

          <p>
            <a href="${resetUrl}">
              Redefinir minha senha
            </a>
          </p>

          <p>Este link expira em 30 minutos.</p>

          <p>
            Se você não solicitou essa alteração,
            ignore este e-mail.
          </p>
        </body>
      </html>
    `,
  });
}
