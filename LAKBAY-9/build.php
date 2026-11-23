<?php
/**
 * Lakbay build script
 * -------------------
 * Assembles index.html from index.template.html by replacing every line like
 *     <!-- @include partials/home.html -->
 * with the contents of that file.
 *
 * Run it after you edit anything inside /partials or index.template.html:
 *     php build.php
 * (XAMPP: C:\xampp\php\php.exe build.php)
 *
 * index.html is generated output, so edit the partials, not index.html.
 */
$root = __DIR__;
$template = file_get_contents($root . '/index.template.html');
if ($template === false) { fwrite(STDERR, "Cannot read index.template.html\n"); exit(1); }

$out = preg_replace_callback(
    '/^[ \t]*<!-- @include (\S+) -->[ \t]*\r?$/m',
    function ($m) use ($root) {
        $file = $root . '/' . $m[1];
        if (!is_file($file)) { fwrite(STDERR, "Missing partial: {$m[1]}\n"); exit(1); }
        return rtrim(file_get_contents($file), "\r\n");
    },
    $template
);

file_put_contents($root . '/index.html', $out);
echo "index.html built (" . strlen($out) . " bytes)\n";
