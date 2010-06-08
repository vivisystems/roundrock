{if typeof ledger != 'undefined'}
[&INIT]
[&QSON]${store.name|center:24}[&QSOFF][&CR]
[&DWON]${store.branch|center:24}[&DWOFF][&CR]
[&RESET]${store.telephone1|center:42}[&CR]
${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S')|center:24}[&CR]
${_('Terminal') + ':'|left:10}${store.terminal_no|left:10} ${_('Clerk') + ':'|left:8}${display_name|left:13}[&CR]
------------------------------------------[&CR]
${ledger.type|left:30} {if ledger.mode == 'OUT'}
${0 - ledger.amount|right:42}
{else}
${ledger.amount|right:42}
{/if}
{if ledger.description}
${ledger.description|left:42}
{/if}
------------------------------------------[&CR]
[&CR]
${'Thank you for shopping at'|center:42}[&CR]
[&QSON]${store.name|center:24}[&QSOFF][&CR]
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