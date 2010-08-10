[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
Terminal: ${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.groupby_label}${queryFormLabel.groupby}
${queryFormLabel.warehouse_label}${queryFormLabel.warehouse}

${head.title|center:42}
{for record in body.records}
------------------------------------------
{eval}
    numRecord = record.records.length;
{/eval}
${record.title }
{for product in record.records}
------------------------------------------
{if product.average_line == true}{eval}numRecord--;{/eval}
${product.barcode + ':'|left:16}${product.quantity|default:0|viviFormatPrices:true|right:26}
${product.created + ':'|left:16}${product.price|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Total' ) + ':'|left:16}${product.total|default:0|viviFormatPrices:true|right:26}
{else}
{if product.fieldForGroupby.length > 0}
${body.groupby + ':'|left:16}${product.fieldForGroupby|right:26}
{/if}
${_( '(rpt)Barcode' ) + ':'|left:16}${product.barcode|right:26}
${_( '(rpt)Quantity' ) + ':'|left:16}${product.quantity|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Purchase Time' ) + ':'|left:16}${product.created|unixTimeToString|right:26}
${_( '(rpt)Purchase Price' ) + ':'|left:16}${product.price|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Total' ) + ':'|left:16}${product.total|default:0|viviFormatPrices:true|right:26}
{/if}
{/for}
------------------------------------------
${_( '(rpt)Records Found' ) + ': '|left:16}${numRecord|format:0|right:26}
{/for}
------------------------------------------
{if rowLimitExcess}
${_( '(rpt)Row Limit Excess' )}
------------------------------------------
{/if}
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
