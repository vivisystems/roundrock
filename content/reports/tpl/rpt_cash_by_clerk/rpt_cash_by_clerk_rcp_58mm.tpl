[&INIT]
[&QSON]${head.store.name|center:12}[&QSOFF]
[&DWON]${head.store.branch|center:12}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}
${head.start_time} ~
${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.shift_no_label}${queryFormLabel.shift_no}

${head.title|center:24}
{for master in body}
========================
${_( '(rpt)Terminal' ) + ':'|left:12}${master.terminal_no|right:12}
${_( '(rpt)Start Time' ) + ':'|left:12}
${master.starttime|right:24}
${_( '(rpt)End Time' ) + ':'|left:12}
${master.endtime|right:24}
${_( '(rpt)Sale Period' ) + ':'|left:12}
${master.sale_period|unixTimeToString:'yyyy-MM-dd'|right:24}
${_( '(rpt)Shift' ) + ':'|left:12}${master.shift_number|right:12}
${_( '(rpt)Balance' ) + ':'|left:12}${master.balance|default:0|viviFormatPrices|right:12}
${_( '(rpt)Cash' ) + ':'|left:12}${master.cash|default:0|viviFormatPrices|right:12}
${_( '(rpt)Declared Cash' ) + ':'|left:12}${master.reported_cash|default:0|viviFormatPrices|right:12}
${_( '(rpt)Total' ) + ':'|left:12}${master.sales|default:0|viviFormatPrices|right:12}
${_( '(rpt)Giftcard Excess' ) + ':'|left:12}${master.excess|default:0|viviFormatPrices|right:12}
${_( '(rpt)Deposit' ) + ':'|left:12}${master.deposit|default:0|viviFormatPrices|right:12}
${_( '(rpt)Refund' ) + ':'|left:12}${master.refund|default:0|viviFormatPrices|right:12}
${_( '(rpt)Credit' ) + ':'|left:12}${master.credit|default:0|viviFormatPrices|right:12}
${_( '(rpt)Ledger In' ) + ':'|left:12}${master.ledger_in|default:0|viviFormatPrices|right:12}
${_( '(rpt)Ledger Out' ) + ':'|left:12}${master.ledger_out|default:0|viviFormatPrices|right:12}
------------------------
{eval}
  destDetails = [];
{/eval}
{for detail in master.ShiftChangeDetail}
{if detail.type == 'destination'}
{eval}
  destDetails.push(detail);
{/eval}
{else}
{if detail.count < 0}
* {if detail.name.length > 0}${detail.name + ':'|left:22}
{else}
${_('(rpt)' + detail.type) + ':'|left:22}
{/if}
 X${0 - detail.count|format:0|left:10}${detail.amount|default:0|viviFormatPrices|right:12}
{else}
{if detail.name.length > 0}${detail.name + ':'|left:12}{else}${_('(rpt)' + detail.type) + ':'|left:12}{/if}
${detail.amount|default:0|viviFormatPrices|right:12}
{if detail.type == 'cash' && detail.excess_amount > 0}
${'(' + detail.excess_amount + ')'|right:24}
{/if}
${'  ' + _( '(rpt)Payment Count' ) + ':'|left:12}${detail.count|format:0|right:12}
{/if}
{/if}
{/for}
{if destDetails.length > 0}
------------------------
{for dest in destDetails}
${dest.name + ':'|left:12}${dest.amount|default:0|viviFormatPrices|right:12}
${'  ' + _( '(rpt)Destination Count' ) + ':'|left:12}${dest.count|default:0|right:12}
{/for}
{/if}
{/for}
========================
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
