<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code de verification</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f7fb;font-family:Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
                    <tr>
                        <td style="background:#0f766e;color:#ffffff;padding:18px 24px;font-size:20px;font-weight:700;">
                            Nutrisud Alfa
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px;">
                            <p style="margin:0 0 12px 0;font-size:16px;">Bonjour {{ $name }},</p>
                            <p style="margin:0 0 18px 0;line-height:1.5;">Utilisez ce code pour terminer votre connexion. Ce code expire dans <strong>10 minutes</strong>.</p>
                            <div style="margin:0 0 18px 0;padding:12px 16px;background:#ecfeff;border:1px solid #99f6e4;border-radius:8px;display:inline-block;">
                                <span style="font-size:32px;letter-spacing:6px;font-weight:700;color:#0f766e;">{{ $code }}</span>
                            </div>
                            <p style="margin:0;line-height:1.5;color:#374151;">Si vous n'avez pas demande cette connexion, ignorez cet email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
