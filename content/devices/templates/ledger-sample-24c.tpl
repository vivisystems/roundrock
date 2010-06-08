{if typeof ledger != 'undefined'}
[&INIT]
[&QSON]${store.name|center:12}[&QSOFF][&CR]
[&DWON]${store.branch|center:12}[&DWOFF][&CR]
[&RESET]${store.telephone1|center:24}[&CR]
${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S')|center:24}[&CR]
${'Terminal:'|left:10} ${store.terminal_no|left:13}[&CR]
${'Clerk:'|left:10} ${display_name|left:13}[&CR]
------------------------[&CR]
${ledger.type|left:24}
{if ledger.mode == 'OUT'}
${0 - ledger.amount|right:24}
{else}
${ledger.amount|right:24}
{/if}
{if ledger.description}
${ledger.description|left:24}
{/if}
------------------------[&CR]
[&CR]
${'Thank you for shopping at'|center:24}[&CR]
[&QSON]${store.name|center:12}[&QSOFF][&CR]
[&RESET]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
[&CR]
[&CR]
[&CR]
{/if}