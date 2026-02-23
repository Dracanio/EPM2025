<#import "../layout.ftlh" as base>
<@base.layout>
    <h1>Willkommen, ${user.firstName} ${user.lastName}!</h1>

    <div class="role">Rolle: ${user.role}</div>
    <#if false>
        Deine Projekte:
    <#else>
        <p>Keine Projekte gefunden.</p>
    </#if>

</@base.layout>