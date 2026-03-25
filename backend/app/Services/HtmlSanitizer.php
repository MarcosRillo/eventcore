<?php

namespace App\Services;

use Symfony\Component\HtmlSanitizer\HtmlSanitizer as SymfonyHtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;
use Symfony\Component\HtmlSanitizer\Visitor\AttributeSanitizer\AttributeSanitizerInterface;

class HtmlSanitizer
{
    public static function clean(string $input, string $profile = 'default'): string
    {
        if ($input === '') {
            return '';
        }

        $cacheKey = 'html_sanitizer.'.$profile.'.'.md5($input);

        return cache()->remember($cacheKey, now()->addHour(), function () use ($input) {
            $cssSanitizer = new class implements AttributeSanitizerInterface
            {
                private const ALLOWED_PROPERTIES = [
                    'font', 'font-size', 'font-weight', 'font-style', 'font-family',
                    'text-decoration', 'color', 'background-color', 'text-align',
                ];

                public function getSupportedElements(): ?array
                {
                    return null;
                }

                public function getSupportedAttributes(): ?array
                {
                    return ['style'];
                }

                public function sanitizeAttribute(
                    string $element,
                    string $attribute,
                    string $value,
                    HtmlSanitizerConfig $config,
                ): ?string {
                    $safe = [];

                    foreach (explode(';', $value) as $declaration) {
                        $declaration = trim($declaration);

                        if ($declaration === '') {
                            continue;
                        }

                        [$property] = explode(':', $declaration, 2) + ['', ''];

                        if (in_array(trim($property), self::ALLOWED_PROPERTIES, true)) {
                            $safe[] = $declaration;
                        }
                    }

                    return $safe ? implode('; ', $safe) : null;
                }
            };

            $config = (new HtmlSanitizerConfig)
                ->allowElement('p')
                ->allowElement('b')
                ->allowElement('i')
                ->allowElement('u')
                ->allowElement('strong')
                ->allowElement('em')
                ->allowElement('a', ['href', 'title'])
                ->allowElement('ul')
                ->allowElement('ol')
                ->allowElement('li')
                ->allowElement('br')
                ->allowElement('span', ['style'])
                ->allowElement('div', ['class'])
                ->allowElement('h2')
                ->allowElement('h3')
                ->allowElement('h4')
                ->withAttributeSanitizer($cssSanitizer);

            return (new SymfonyHtmlSanitizer($config))->sanitize($input);
        });
    }
}
