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
        private string $resetToken,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        $resetUrl = "{$frontendUrl}/reset-password?token={$this->resetToken}&email=".urlencode($this->user->email);

        return (new MailMessage)
            ->subject('¡Solicitud Aprobada! - Plataforma Calendario')
            ->greeting("¡Felicitaciones {$this->request->first_name}!")
            ->line('Tu solicitud de registro ha sido aprobada.')
            ->line('Para comenzar, crea tu contraseña haciendo clic en el siguiente botón:')
            ->action('Crear mi Contraseña', $resetUrl)
            ->line('Este enlace expira en 60 minutos.')
            ->line('Si no solicitaste esto, puedes ignorar este mensaje.')
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
