<?php
/**
 * Lakbay build script
 * Assembles index.html from index.template.html and the module partials.
 *
 * Usage: php build.php
 */

$root = __DIR__;
$templatePath = $root . '/index.template.html';
$outputPath = $root . '/index.html';

if (!is_file($templatePath)) {
    fwrite(STDERR, "Missing index.template.html\n");
    exit(1);
}

$html = file_get_contents($templatePath);

$html = preg_replace_callback(
    '/<!--\s*@include\s+([^\s]+)\s*-->/i',
    function ($matches) use ($root) {
        $relative = str_replace('\\', '/', $matches[1]);
        $relative = ltrim(str_replace('..', '', $relative), '/');
        $file = $root . '/' . $relative;

        if (!is_file($file)) {
            fwrite(STDERR, "Missing include: {$matches[1]}\n");
            return $matches[0];
        }

        return file_get_contents($file);
    },
    $html
);

if (file_put_contents($outputPath, $html) === false) {
    fwrite(STDERR, "Could not write index.html\n");
    exit(1);
}

echo 'index.html built (' . strlen($html) . " bytes)\n";
