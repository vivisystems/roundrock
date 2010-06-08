{if typeof ledger != 'undefined'}
[&INIT]
[&QSON]${store.name|center:16}[&QSOFF][&CR]
[&DWON]${store.branch|center:16}[&DWOFF][&CR]
[&RESET]${store.telephone1|center:31}[&CR]
${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S')|center:31}[&CR]
${'Terminal:'|left:9}${store.terminal_no|left:22}[&CR]
${'Clerk:'|left:6}${display_name|left:25}[&CR]
------------------------[&CR]
${ledger.type|left:31}
{if ledger.mode == 'OUT'}
${0 - ledger.amount|right:31}
{else}
${ledger.amount|right:31}
{/if}
{if ledger.description}
${ledger.description|left:31}
{/if}
------------------------[&CR]
[&CR]
${'Thank you for shopping at'|center:31}[&CR]
[&QSON]${store.name|center:16}[&QSOFF][&CR]
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
