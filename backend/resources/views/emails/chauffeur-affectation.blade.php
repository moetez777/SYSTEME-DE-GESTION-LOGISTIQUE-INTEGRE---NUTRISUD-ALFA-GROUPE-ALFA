<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle livraison affectee</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f7fb;font-family:Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
                    <tr>
                        <td style="background:#0f766e;color:#ffffff;padding:18px 24px;font-size:20px;font-weight:700;">
                            Nutrisud Alfa
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:24px;">
                            <p style="margin:0 0 12px 0;font-size:16px;">Bonjour {{ $livraison->chauffeur?->prenom ?? 'chauffeur' }},</p>
                            <p style="margin:0 0 18px 0;line-height:1.5;">Une nouvelle livraison vient d'etre affectee a votre compte. Connectez-vous sur la plateforme pour consulter tous les details et suivre votre mission.</p>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 20px 0;">
                                <tr>
                                    <td style="padding:10px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:700;width:38%;">Reference commande</td>
                                    <td style="padding:10px 12px;border:1px solid #e5e7eb;">{{ $livraison->commande?->reference ?? ('CMD-' . $livraison->commande_id) }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:700;">Produit</td>
                                    <td style="padding:10px 12px;border:1px solid #e5e7eb;">{{ $livraison->commande?->produit?->nom ?? '—' }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:700;">Quantite</td>
                                    <td style="padding:10px 12px;border:1px solid #e5e7eb;">{{ $livraison->quantite_livree ?? $livraison->commande?->quantite ?? '—' }} {{ $livraison->commande?->unite ?? $livraison->commande?->produit?->unite ?? '' }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:700;">Destination</td>
                                    <td style="padding:10px 12px;border:1px solid #e5e7eb;">{{ $livraison->destination ?? '—' }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:700;">Camion</td>
                                    <td style="padding:10px 12px;border:1px solid #e5e7eb;">{{ $livraison->camion?->immatriculation ?? '—' }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:700;">Depart prevu</td>
                                    <td style="padding:10px 12px;border:1px solid #e5e7eb;">{{ $livraison->date_depart_prevue?->format('d/m/Y H:i') ?? '—' }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:700;">Arrivee prevue</td>
                                    <td style="padding:10px 12px;border:1px solid #e5e7eb;">{{ $livraison->date_arrivee_prevue?->format('d/m/Y H:i') ?? '—' }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:10px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:700;">Societe transport</td>
                                    <td style="padding:10px 12px;border:1px solid #e5e7eb;">{{ $livraison->societeTransport?->nom ?? '—' }}</td>
                                </tr>
                            </table>

                            @if(!empty($livraison->notes))
                                <div style="margin:0 0 20px 0;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
                                    <strong style="display:block;margin:0 0 6px 0;">Notes</strong>
                                    <span style="line-height:1.5;color:#374151;">{{ $livraison->notes }}</span>
                                </div>
                            @endif

                            <p style="margin:0 0 18px 0;line-height:1.5;">Ouvrez votre espace chauffeur pour verifier votre affectation et suivre l'etat de la livraison.</p>

                            <a href="{{ $siteUrl }}" style="display:inline-block;padding:12px 18px;background:#0f766e;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:700;">Ouvrir mon espace chauffeur</a>

                            <p style="margin:18px 0 0 0;line-height:1.5;color:#6b7280;">Si vous n'etes pas concerne par cette livraison, ignorez simplement ce message.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>