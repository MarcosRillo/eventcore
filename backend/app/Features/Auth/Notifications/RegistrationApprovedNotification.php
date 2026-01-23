<?php

namespace App\Features\Auth\Notifications;

use App\Models\RegistrationRequest;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RegistrationApprovedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private RegistrationRequest $request,
        private User $user,
        private string $temporaryPassword,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        $loginUrl = "{$frontendUrl}/login";

        return (new MailMessage)
            ->subject('¡Solicitud Aprobada! - Plataforma Calendario')
            ->greeting("¡Felicitaciones {$this->request->first_name}!")
            ->line('Tu solicitud de registro ha sido aprobada.')
            ->line('Ya puedes acceder a la plataforma con las siguientes credenciales:')
            ->line("**Email:** {$this->user->email}")
            ->line("**Contraseña temporal:** {$this->temporaryPassword}")
            ->action('Iniciar Sesión', $loginUrl)
            ->line('Te recomendamos cambiar tu contraseña después de iniciar sesión.')
            ->line('¡Bienvenido a Plataforma Calendario!')
            ->salutation('Saludos, Plataforma Calendario');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'request_id' => $this->request->id,
            'user_id' => $this->user->id,
            'email' => $this->user->email,
        ];
    }
}
