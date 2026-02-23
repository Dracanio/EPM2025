<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Registrieren</title>
</head>
<body>
<h2>Registrieren</h2>
<form action="/users" method="post">
    <input type="text" placeholder="First name" name="firstName">
    <#if errors?? && errors.getFieldError("firstName")??>
        ${errors.getFieldError("firstName")["defaultMessage"]}
    </#if><br>
    <input type="text" placeholder="Last name" name="lastName">
    <#if errors?? && errors.getFieldError("lastName")??>
        ${errors.getFieldError("lastName")["defaultMessage"]}
    </#if><br>
    <input type="email" placeholder="max.mustermann@example.com" name="email">
    <#if errors?? && errors.getFieldError("email")??>
        ${errors.getFieldError("email")["defaultMessage"]}
    </#if><br>
    <label for="password">Passwort:</label>
    <input type="password" id="password" name="passwordHash"/>
    <select name="role" id="role" >
        <option value="">Select your Role</option>
        <option value="ADMIN">Admin</option>
        <option value="LECTURER">Lecturer</option>
        <option value="STUDENT">Student</option>
        <option value="MODERATOR">Moderator</option>
    </select>
    <button>Create user</button>
</form>
<div>
    <p>Already go an Account? <a href="/login">Back to Login</a></p>
</div>
</body>
</html>