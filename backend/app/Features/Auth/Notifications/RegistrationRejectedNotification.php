<?php

namespace App\Features\Auth\Notifications;

use App\Models\RegistrationRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RegistrationRejectedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private RegistrationRequest $request
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Solicitud de Registro - Plataforma Calendario')
            ->greeting("Hola {$this->request->first_name},")
            ->line('Lamentamos informarte que tu solicitud de registro no ha sido aprobada.')
            ->line("**Motivo:** {$this->request->rejection_reason}")
            ->line('Si tienes alguna consulta, puedes contactarnos para más información.')
            ->line('Gracias por tu interés en nuestra plataforma.')
            ->salutation('Saludos, Plataforma Calendario');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'request_id' => $this->request->id,
            'email' => $this->request->email,
            'rejection_reason' => $this->request->rejection_reason,
        ];
    }
}
