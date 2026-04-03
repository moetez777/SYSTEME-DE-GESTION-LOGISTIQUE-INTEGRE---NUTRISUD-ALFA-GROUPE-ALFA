<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class RapportExport implements FromCollection, WithHeadings, WithStyles
{
    protected Collection $commandes;

    public function __construct(Collection $commandes)
    {
        $this->commandes = $commandes;
    }

    public function collection()
    {
        return $this->commandes->map(function ($c) {
            return [
                'ID'              => $c->id,
                'Centre'          => $c->centreElevage->nom ?? '-',
                'Produit'         => $c->produit->nom ?? '-',
                'Quantité'        => $c->quantite . ' ' . $c->unite,
                'Statut'          => $c->statut,
                'Date commande'   => $c->date_commande?->format('d/m/Y H:i'),
                'Usine'           => $c->societeAliment->nom ?? 'Non assignée',
                'Livraison statut'=> $c->livraison->statut ?? '-',
                'Date livraison'  => $c->livraison?->date_arrivee_reel?->format('d/m/Y') ?? '-',
            ];
        });
    }

    public function headings(): array
    {
        return ['ID', 'Centre', 'Produit', 'Quantité', 'Statut', 'Date commande', 'Usine', 'Statut livraison', 'Date livraison'];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
