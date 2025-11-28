<?php

namespace App\Features\Auth\Notifications;

use App\Models\Invitation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvitationNotification extends Notification
{
    use Queueable;

    /**
     * @param string $plainToken The plain token (selector + validator) for the invitation URL
     */
    public function __construct(
        private string $plainToken
    ) {}

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        $acceptUrl = "{$frontendUrl}/accept-invitation?token={$this->plainToken}";

        // $notifiable is the Invitation model (has Notifiable trait)
        $invitation = $notifiable;

        return (new MailMessage)
            ->subject('Has sido invitado a Plataforma Calendario')
            ->greeting('¡Hola!')
            ->line("{$invitation->inviter->name} te ha invitado a unirte a Plataforma Calendario.")
            ->line("Rol asignado: {$invitation->role->role_name}")
            ->action('Aceptar Invitación', $acceptUrl)
            ->line("Esta invitación expira en 24 horas ({$invitation->expires_at->format('d/m/Y H:i')}).")
            ->line('Si no esperabas esta invitación, puedes ignorar este correo.')
            ->salutation('Saludos, Plataforma Calendario');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        $invitation = $notifiable;

        return [
            'invitation_id' => $invitation->id,
            'email' => $invitation->email,
            'role' => $invitation->role->role_name,
            'invited_by' => $invitation->inviter->name,
            'expires_at' => $invitation->expires_at->toIso8601String(),
        ];
    }
}
