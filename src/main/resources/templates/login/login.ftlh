<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Login</title>
</head>
<body>
<h2>Login</h2>
<form action="/login" method="post">
    <div>
        <label for="username">E-Mail:</label>
        <input type="text" id="username" name="username"/>
    </div>
    <div>
        <label for="password">Passwort:</label>
        <input type="password" id="password" name="password"/>
    </div>
    <div>
        <button type="submit">Einloggen</button>
    </div>
    <#if error??>
    <p style="color:red;">${error}</p>
</#if>
</form>
<div>
    <p>Dont have an Account <a href="/register">Register here</a></p>
</div>
</body>
</html>