<?php

namespace App\Mail;

use App\Models\Livraison;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ChauffeurAffectationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Livraison $livraison,
        public string $siteUrl,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nouvelle livraison affectee - Nutrisud Alfa',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.chauffeur-affectation',
        );
    }
}