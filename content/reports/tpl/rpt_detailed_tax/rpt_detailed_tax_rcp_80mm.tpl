[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:10}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}
${head.start_time} ~ ${head.end_time}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.terminal_no_label}${queryFormLabel.terminal_no}
${queryFormLabel.periodtype_label}${queryFormLabel.periodtype}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}
${queryFormLabel.database_label}${queryFormLabel.database}

${head.title|center:42}
{for item in body}
{eval}
  TrimPath.RoundingPrices = item.Order.rounding_prices;
  TrimPath.PrecisionPrices = item.Order.precision_prices;
  TrimPath.RoundingTaxes = item.Order.rounding_taxes;
  TrimPath.PrecisionTaxes = item.Order.precision_taxes;
{/eval}
------------------------------------------
${_( '(rpt)Terminal' ) + ':'|left:16}${item.Order.terminal_no|right:26}
${_( '(rpt)Sale Period' ) + ':'|left:16}${item.Order.sale_period|unixTimeToString:'saleperiod'|right:26}
${_( '(rpt)Shift' ) + ':'|left:16}${item.Order.shift_number|right:26}
${_( '(rpt)Time' ) + ':'|left:16}${item.Order.time|unixTimeToString|right:26}
${_( '(rpt)Sequence' ) + ':'|left:16}${item.Order.sequence|right:26}
${_( '(rpt)Invoice Number' ) + ':'|left:16}${item.Order.invoice_no|default:''|right:26}
${_( '(rpt)Total' ) + ':'|left:16}${item.Order.total|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Gross Sales' ) + ':'|left:16}${item.Order.item_subtotal|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Order Surcharge' ) + ':'|left:16}${item.surcharge_subtotal|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Order Discount' ) + ':'|left:16}${item.discount_subtotal|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Promotion' ) + ':'|left:16}${item.Order.promotion_subtotal|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Revalue' ) + ':'|left:16}${item.Order.revalue_subtotal|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Add-on Tax' ) + ':'|left:16}${item.Order.tax_subtotal|default:0|viviFormatTaxes:true|right:26}
${_( '(rpt)Included Tax' ) + ':'|left:16}${item.Order.included_tax_subtotal|default:0|viviFormatTaxes:true|right:26}
{for tax in taxList}
{eval}
if (foot.summary.taxes && tax.no in foot.summary.taxes) {
   item_subtotal = foot.summary.taxes[tax.no].item_subtotal;
   tax_subtotal = foot.summary.taxes[tax.no].tax_subtotal;
}
else {
   item_subtotal = 0;
   tax_subtotal = 0;
}
{/eval}
${tax.no + ' ' + _( '(rpt)Gross Sales') + ':'|left:16}${item_subtotal|viviFormatTaxes:true|right:26}
${tax.no + ':'|left:16}${tax_subtotal|viviFormatTaxes:true|right:26}
{/for}
{/for}
------------------------------------------
${_( '(rpt)Records Found' ) + ': '|left:30}${GeckoJS.BaseObject.getKeys(body).length|default:0|format:0|right:12}
${_( '(rpt)Records Displayed' ) + ': '|left:30}${foot.rowCount|default:0|format:0|right:12}
------------------------------------------
${_( '(rpt)Summary' )}
${_( '(rpt)Total' ) + ':'|left:16}${foot.summary.total|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Gross Sales' ) + ':'|left:16}${foot.summary.item_subtotal|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Order Surcharge' ) + ':'|left:16}${foot.summary.surcharge_subtotal|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Order Discount' ) + ':'|left:16}${foot.summary.discount_subtotal|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Promotion' ) + ':'|left:16}${foot.summary.promotion_subtotal|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Revalue' ) + ':'|left:16}${foot.summary.revalue_subtotal|default:0|viviFormatPrices:true|right:26}
${_( '(rpt)Add-on Tax' ) + ':'|left:16}${foot.summary.tax_subtotal|default:0|viviFormatTaxes:true|right:26}
${_( '(rpt)Included Tax' ) + ':'|left:16}${foot.summary.included_tax_subtotal|default:0|viviFormatTaxes:true|right:26}
{for tax in taxList}
{eval}
if (tax.no in foot.summary) {
   item_subtotal = foot.summary[tax.no].item_subtotal;
   tax_subtotal = foot.summary[tax.no].tax_subtotal;
}
else {
   item_subtotal = 0;
   tax_subtotal = 0;
}
{/eval}
${tax.no + ' ' + _( '(rpt)Gross Sales') + ':'|left:16}${item_subtotal|viviFormatTaxes:true|right:26}
${tax.no + ':'|left:16}${tax_subtotal|viviFormatTaxes:true|right:26}
{/for}
------------------------------------------
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
