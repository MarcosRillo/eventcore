# TASK 5: Configurar MailHog para Testing de Emails

**Prioridad:** MEDIA (Infraestructura)  
**Tiempo estimado:** 1 hora  
**Contexto:** Preparar sistema de testing de emails para futuras notificaciones

---

## OBJETIVO

Configurar MailHog como servidor SMTP de desarrollo para:
- Capturar emails enviados sin enviarlos realmente
- Visualizar emails en interfaz web
- Testear templates y contenido de emails
- Evitar envíos accidentales a usuarios reales en desarrollo

---

## ¿QUÉ ES MAILHOG?

MailHog es un servidor SMTP falso que:
- Captura todos los emails enviados
- Proporciona Web UI para ver emails (http://localhost:8025)
- No envía emails reales a internet
- Perfecto para desarrollo y testing

---

## PASOS DE EJECUCIÓN

### 1. Agregar MailHog a docker-compose.yml

**Ubicación:** `docker-compose.yml` (raíz del proyecto)

**Agregar este servicio:**

```yaml
services:
  # ... servicios existentes (db, backend, frontend)

  mailhog:
    image: mailhog/mailhog:latest
    container_name: plataforma-calendario-mailhog
    ports:
      - "1025:1025"  # SMTP port
      - "8025:8025"  # Web UI port
    networks:
      - plataforma-net
    restart: unless-stopped
```

**Nota sobre puertos:**
- **1025:** Puerto SMTP (Laravel se conecta aquí para enviar emails)
- **8025:** Puerto Web UI (tú te conectas aquí para ver emails)

### 2. Configurar Laravel para Usar MailHog

**Ubicación:** `backend/.env`

**Modificar estas variables:**

```env
MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=noreply@plataforma-calendario.com
MAIL_FROM_NAME="${APP_NAME}"
```

**Explicación:**
- `MAIL_HOST=mailhog` → Nombre del servicio en docker-compose
- `MAIL_PORT=1025` → Puerto SMTP de MailHog
- `MAIL_ENCRYPTION=null` → MailHog no usa encryption en desarrollo
- `MAIL_FROM_ADDRESS` → Email remitente que aparecerá en emails

### 3. Reiniciar Containers Docker

```bash
# Detener containers actuales
docker-compose down

# Iniciar containers con MailHog nuevo
docker-compose up -d

# Verificar que todos los containers están corriendo
docker-compose ps
```

**Resultado esperado:**
```
NAME                           STATUS
plataforma-calendario-backend  Up
plataforma-calendario-db       Up
plataforma-calendario-mailhog  Up
```

### 4. Verificar MailHog Funciona

**Verificar container:**
```bash
docker ps | grep mailhog
```

**Resultado esperado:**
```
CONTAINER ID   IMAGE                    PORTS                              NAMES
abc123def456   mailhog/mailhog:latest   0.0.0.0:1025->1025/tcp, 0.0.0.0:8025->8025/tcp   plataforma-calendario-mailhog
```

**Acceder a Web UI:**
```bash
# macOS
open http://localhost:8025

# Linux
xdg-open http://localhost:8025

# O abrir manualmente en navegador
```

Deberías ver la interfaz de MailHog (inbox vacío inicialmente).

### 5. Test de Envío de Email

**Opción A: Usando Tinker (recomendado)**

```bash
docker exec plataforma-calendario-backend php artisan tinker --execute="
use Illuminate\Support\Facades\Mail;

Mail::raw('Este es un email de prueba desde MailHog.', function(\$message) {
    \$message->to('test@example.com')
            ->subject('Test Email - Plataforma Calendario');
});

echo 'Email enviado. Revisa http://localhost:8025';
"
```

**Opción B: Usando comando artisan**

Crear comando de prueba (opcional):

```bash
# Crear comando
docker exec plataforma-calendario-backend php artisan make:command TestEmail

# Implementar en app/Console/Commands/TestEmail.php:
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmail extends Command
{
    protected $signature = 'email:test {email=test@example.com}';
    protected $description = 'Send test email to MailHog';

    public function handle()
    {
        Mail::raw('Test email from Laravel', function ($message) {
            $message->to($this->argument('email'))
                    ->subject('Test Email - Plataforma Calendario');
        });

        $this->info('Email sent to MailHog. Check http://localhost:8025');
    }
}

# Ejecutar:
docker exec plataforma-calendario-backend php artisan email:test
```

### 6. Verificar Email en MailHog Web UI

**Pasos:**
1. Abrir http://localhost:8025
2. Deberías ver 1 email en el inbox
3. Hacer clic en el email para ver contenido completo
4. Verificar:
   - **From:** noreply@plataforma-calendario.com
   - **To:** test@example.com
   - **Subject:** Test Email - Plataforma Calendario
   - **Body:** Mensaje de prueba

**Si ves el email → MailHog funciona correctamente! ✅**

---

## TESTING AVANZADO

### Test con Mailable Class

Crear una clase Mailable de prueba:

```bash
docker exec plataforma-calendario-backend php artisan make:mail TestMail
```

Implementar en `app/Mail/TestMail.php`:

```php
<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function build()
    {
        return $this->subject('Test Mailable - Plataforma Calendario')
                    ->view('emails.test');
    }
}
```

Crear vista `resources/views/emails/test.blade.php`:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Test Email</title>
</head>
<body>
    <h1>Test Email from Plataforma Calendario</h1>
    <p>Este es un email de prueba usando Mailable class.</p>
    <p>Si ves esto, el sistema de emails funciona correctamente.</p>
</body>
</html>
```

Enviar:

```bash
docker exec plataforma-calendario-backend php artisan tinker --execute="
use App\Mail\TestMail;
use Illuminate\Support\Facades\Mail;

Mail::to('test@example.com')->send(new TestMail());
echo 'Mailable enviado a MailHog';
"
```

### Test con Queue (Opcional)

Si usas queues para emails:

```bash
# Configurar .env
QUEUE_CONNECTION=database

# Crear tabla jobs
docker exec plataforma-calendario-backend php artisan queue:table
docker exec plataforma-calendario-backend php artisan migrate

# Enviar con queue
docker exec plataforma-calendario-backend php artisan tinker --execute="
use App\Mail\TestMail;
use Illuminate\Support\Facades\Mail;

Mail::to('test@example.com')->queue(new TestMail());
echo 'Email en queue';
"

# Procesar queue
docker exec plataforma-calendario-backend php artisan queue:work --once
```

---

## CONFIGURACIÓN PARA PRODUCCIÓN

**IMPORTANTE:** MailHog es SOLO para desarrollo.

En producción, cambiar `.env` a servicio real:

```env
# Producción - Ejemplo con Gmail
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@tudominio.com
MAIL_FROM_NAME="${APP_NAME}"

# O servicio profesional como SendGrid, Mailgun, SES
```

**MailHog NO debe usarse en producción** - emails no se enviarán realmente.

---

## USO DIARIO DE MAILHOG

### Casos de Uso Comunes

**1. Probar email de reset password:**
```bash
# En la app
# Ir a /forgot-password
# Ingresar email
# Revisar MailHog para ver email con link
```

**2. Probar notificaciones de eventos:**
```bash
# Cuando implementes notificaciones
# Crear/aprobar evento
# Revisar MailHog para ver notificación al organizador
```

**3. Probar templates de email:**
```bash
# Editar blade template
# Enviar test email
# Revisar en MailHog cómo se ve
# Iterar hasta que se vea bien
```

### Limpiar Inbox de MailHog

**Opción A: Desde Web UI**
- Abrir http://localhost:8025
- Click en "Clear" arriba a la derecha

**Opción B: Reiniciar container**
```bash
docker restart plataforma-calendario-mailhog
```

---

## TROUBLESHOOTING

### Problema 1: MailHog Web UI No Carga

**Síntoma:** http://localhost:8025 no responde

**Solución:**
```bash
# Verificar que container está corriendo
docker ps | grep mailhog

# Si no está corriendo, iniciarlo
docker-compose up -d mailhog

# Ver logs
docker logs plataforma-calendario-mailhog
```

### Problema 2: Laravel No Puede Conectarse a MailHog

**Síntoma:** Error al enviar email: "Connection refused"

**Causas posibles:**
- MailHog no está corriendo
- Backend no está en la misma red Docker
- MAIL_HOST en .env incorrecto

**Solución:**
```bash
# Verificar red Docker
docker network inspect plataforma-net

# Backend y MailHog deben estar en la misma red

# Verificar .env
docker exec plataforma-calendario-backend cat .env | grep MAIL_

# Debe decir MAIL_HOST=mailhog (NO localhost)
```

### Problema 3: Emails No Aparecen en MailHog

**Síntoma:** Tinker dice "email enviado" pero no aparece en MailHog

**Solución:**
```bash
# Ver logs de Laravel
docker logs plataforma-calendario-backend | tail -50

# Ver logs de MailHog
docker logs plataforma-calendario-mailhog | tail -50

# Verificar configuración mail
docker exec plataforma-calendario-backend php artisan tinker --execute="
echo 'Mail Config:';
print_r(config('mail'));
"
```

### Problema 4: Puerto 8025 Ya en Uso

**Síntoma:** Error al iniciar: "port is already allocated"

**Solución:**
```bash
# Ver qué está usando el puerto
lsof -i :8025

# Opción A: Matar proceso
kill -9 [PID]

# Opción B: Cambiar puerto en docker-compose.yml
# Cambiar "8025:8025" por "8026:8025"
# Luego acceder a http://localhost:8026
```

---

## CRITERIOS DE ÉXITO

- [ ] MailHog container corriendo (`docker ps`)
- [ ] Web UI accesible en http://localhost:8025
- [ ] Test email enviado desde Tinker
- [ ] Email visible en MailHog inbox
- [ ] Email muestra contenido correcto (From, To, Subject, Body)
- [ ] Laravel logs no muestran errores de email
- [ ] `.env` configurado correctamente

---

## ROLLBACK (Si Algo Sale Mal)

```bash
# Detener y remover MailHog
docker-compose down mailhog

# Revertir cambios en .env
git checkout -- backend/.env

# Opcional: Remover servicio de docker-compose.yml
git checkout -- docker-compose.yml

# Reiniciar sin MailHog
docker-compose up -d
```

---

## PRÓXIMO PASO

Después de completar esta tarea, **MailHog está listo para:**
- Implementar notificaciones de eventos
- Emails de bienvenida a usuarios
- Emails de reset password
- Cualquier otra funcionalidad de email

**Continuar con:**
- TASK 6: Fix errores TypeScript en tests (opcional)
- O comenzar Panel Organizador Frontend

---

**Tiempo real esperado:** 45-60 minutos  
**Bloqueantes:** Ninguno  
**Dependencias:** Docker y docker-compose funcionando