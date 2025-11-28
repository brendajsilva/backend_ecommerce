const nodemailer = require('nodemailer');

// Configurar transporte de email
let transporterPromise;

function getTransporter() {
    if (!transporterPromise) {
        transporterPromise = (async () => {
            if (process.env.EMAIL_SERVICE === 'mailjet') {
                return nodemailer.createTransport({
                    host: 'in-v3.mailjet.com',
                    port: 587,
                    auth: {
                        user: process.env.MJ_APIKEY_PUBLIC,
                        pass: process.env.MJ_APIKEY_PRIVATE
                    }
                });
            } else if (process.env.EMAIL_SERVICE === 'gmail') {
                return nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });
            } else {
                // Usar Ethereal para desenvolvimento
                if (!process.env.ETHEREAL_USER || process.env.ETHEREAL_USER === 'your-ethereal-user') {
                    // Criar conta de teste automaticamente
                    const testAccount = await nodemailer.createTestAccount();
                    console.log('Ethereal credentials:', testAccount);
                    return nodemailer.createTransport({
                        host: 'smtp.ethereal.email',
                        port: 587,
                        auth: {
                            user: testAccount.user,
                            pass: testAccount.pass
                        }
                    });
                } else {
                    return nodemailer.createTransport({
                        host: 'smtp.ethereal.email',
                        port: 587,
                        auth: {
                            user: process.env.ETHEREAL_USER,
                            pass: process.env.ETHEREAL_PASS
                        }
                    });
                }
            }
        })();
    }
    return transporterPromise;
}

const enviarMensagemContato = async (req, res) => {
    try {
        const { nome, email, telefone, assunto, mensagem } = req.body;

        // Validações
        if (!nome || !email || !assunto || !mensagem) {
            return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
        }

        // Configurar email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'brendajulyadsouz28@gmail.com',
            subject: `Contato - ${assunto}`,
            html: `
                <h2>Nova mensagem de contato</h2>
                <p><strong>Nome:</strong> ${nome}</p>
                <p><strong>E-mail:</strong> ${email}</p>
                <p><strong>Telefone:</strong> ${telefone || 'Não informado'}</p>
                <p><strong>Assunto:</strong> ${assunto}</p>
                <p><strong>Mensagem:</strong></p>
                <p>${mensagem.replace(/\n/g, '<br>')}</p>
            `
        };

        // Enviar email
        const transporter = await getTransporter();
        await transporter.sendMail(mailOptions);

        res.json({ message: 'Mensagem enviada com sucesso!' });

    } catch (error) {
        console.error('Erro ao enviar email:', error);
        res.status(500).json({ error: 'Erro ao enviar mensagem' });
    }
};

module.exports = {
    enviarMensagemContato
};