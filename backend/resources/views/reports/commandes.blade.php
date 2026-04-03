<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; }
        h1   { color: #2c3e50; font-size: 16px; text-align: center; }
        table{ width: 100%; border-collapse: collapse; margin-top: 15px; }
        th   { background: #2c3e50; color: #fff; padding: 6px 8px; text-align: left; }
        td   { padding: 5px 8px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) td { background: #f5f5f5; }
        .statut-confirmee { color: #27ae60; font-weight: bold; }
        .statut-refusee   { color: #e74c3c; font-weight: bold; }
        .statut-en_cours  { color: #f39c12; font-weight: bold; }
    </style>
</head>
<body>
    <h1>Rapport Commandes – Nutrisud Alfa</h1>
    <p style="text-align:center; color:#888;">Généré le {{ date('d/m/Y H:i') }}</p>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Centre</th>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Usine</th>
                <th>Livraison</th>
            </tr>
        </thead>
        <tbody>
            @foreach($commandes as $c)
            <tr>
                <td>{{ $c->id }}</td>
                <td>{{ $c->centreElevage->nom ?? '-' }}</td>
                <td>{{ $c->produit->nom ?? '-' }}</td>
                <td>{{ $c->quantite }} {{ $c->unite }}</td>
                <td class="statut-{{ $c->statut }}">{{ $c->statut }}</td>
                <td>{{ $c->date_commande?->format('d/m/Y') }}</td>
                <td>{{ $c->societeAliment->nom ?? 'Non assignée' }}</td>
                <td>{{ $c->livraison->statut ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
