<#macro layout>
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport"
              content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Poster Planer</title>
    </head>
    <body>
    <header>
        Poster Planer<br>

    </header>
    <hr>
    <main>
        <#nested>
    </main>
    <hr>
    <footer>
        <a href="/imprint.html">Imprint</a>
        <a href="/aboutUs.html">About us</a>
        <a href="/support.html">Support</a>

    </footer>
    </body>
    </html>
</#macro>
