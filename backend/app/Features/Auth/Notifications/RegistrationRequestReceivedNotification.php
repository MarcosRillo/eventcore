<?php

namespace App\Features\Auth\Notifications;

use App\Models\RegistrationRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RegistrationRequestReceivedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private RegistrationRequest $request,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Solicitud de Registro Recibida - Plataforma Calendario')
            ->greeting("¡Hola {$this->request->first_name}!")
            ->line('Hemos recibido tu solicitud de registro como organizador de eventos.')
            ->line("Organización: {$this->request->organization_name}")
            ->line('Tu solicitud está siendo revisada por nuestro equipo.')
            ->line('Te notificaremos por email cuando tengamos una respuesta.')
            ->line('Gracias por tu interés en formar parte de nuestra plataforma.')
            ->salutation('Saludos, Plataforma Calendario');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'request_id' => $this->request->id,
            'email' => $this->request->email,
            'organization_name' => $this->request->organization_name,
        ];
    }
}
