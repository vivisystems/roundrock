<!---->
<div id="printhead">
	<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">
	<p class="heading_store">${head.store.name} - ${head.store.branch}</p>
	<p class="heading_store">${head.store.telephone1}</p>

	<div style="float: left;">
		<p class="heading_p">${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}</p>
		<p class="heading_p">${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}</p>
		<p class="caption">${head.title}</p>
	</div>

	<div style="float: right;">
		<p class="heading_p">&nbsp;</p>
		<p class="heading_p" style="text-align: right;">${_( '(rpt)Printed Time' ) + ': '}${foot.gen_time}</p>
		<p class="caption" style="text-align: right;">${head.start_time} - ${head.end_time}</p>
	</div>
       <table id="condition-table">
           <tr>
                <td class="condition-title"><span class="caption">${queryFormLabel.database_label|escape}</span></td>
                <td align="left" >

                       <span class="heading_p">${queryFormLabel.database|escape}</span>
                </td>
            </tr>
            <tr>
                <td class="condition-title"><span class="caption">${_('(rpt)Condition') + ' - '}</span></td>
                <td align="left" >
                       <span class="caption">${queryFormLabel.terminal_no_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.terminal_no|escape}</span>
                       <span class="caption">${queryFormLabel.periodtype_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.periodtype|escape}</span>
                       <span class="caption">${queryFormLabel.sortby_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.sortby|escape}</span>
                </td>
           </tr>
       </table>
    <table id="body-table">
        <!--caption>${head.title}</caption-->
        <thead>
            <tr>
                <th style="text-align: center;">${_( '(rpt)Terminal' )}</th>
                <th style="text-align: center;">${_( '(rpt)Sale Period' )}</th>
                <th style="text-align: center;">${_( '(rpt)Shift' )}</th>
                <th style="text-align: center;">${_( '(rpt)Time' )}</th>
                <th style="text-align: center;">${_( '(rpt)Sequence' )}</th>
                <th style="text-align: center;">${_( '(rpt)Invoice Number' )}</th>
                <th style="text-align: center;">${_( '(rpt)Total' )}</th>
                <th style="text-align: center;">${_( '(rpt)Gross Sales' )}</th>
                <th style="text-align: center;">${_( '(rpt)Order Surcharge' )}</th>
                <th style="text-align: center;">${_( '(rpt)Order Discount' )}</th>
                <th style="text-align: center;">${_( '(rpt)Promotion' )}</th>
                <th style="text-align: center;">${_( '(rpt)Revalue' )}</th>
                <th style="text-align: center;">${_( '(rpt)Add-on Tax' )}</th>
                <th style="text-align: center;">${_( '(rpt)Included Tax' )}</th>
{for tax in taxList}
                <th style="text-align: center;">${tax.no} ${ _('(rpt)Gross Sales') }</th>
                <th style="text-align: center;">${tax.no}</th>
{/for}
            </tr>
        </thead>
        <tbody>
{for item in body}
{eval}
  TrimPath.RoundingPrices = item.Order.rounding_prices;
  TrimPath.PrecisionPrices = item.Order.precision_prices;
  TrimPath.RoundingTaxes = item.Order.rounding_taxes;
  TrimPath.PrecisionTaxes = item.Order.precision_taxes;
{/eval}
            <tr id="${item.id}">
                <td style="text-align: left;">${item.Order.terminal_no}</td>
                <td style="text-align: left;">${item.Order.sale_period|unixTimeToString:'saleperiod'}</td>
                <td style="text-align: left;">${item.Order.shift_number}</td>
                <td style="text-align: left;">${item.Order.time|unixTimeToString}</td>
                <td style="text-align: left;" class="hyperlink">${item.Order.sequence}</td>
                <td style="text-align: left;">${item.Order.invoice_no|default:''}</td>
                <td style="text-align: right;">${item.Order.total|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${item.Order.item_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${item.trans_surcharge_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${item.trans_discount_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${item.Order.promotion_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${item.Order.revalue_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${item.Order.tax_subtotal|default:0|viviFormatTaxes:true}</td>
                <td style="text-align: right;">${item.Order.included_tax_subtotal|default:0|viviFormatTaxes:true}</td>
{for tax in taxList}
{eval}
if (item.taxes && (tax.no in item.taxes)) {
   item_subtotal = item.taxes[tax.no].item_subtotal;
   tax_subtotal = item.taxes[tax.no].tax_subtotal;
}
else {
   item_subtotal = 0;
   tax_subtotal = 0;
}
{/eval}
                <td style="text-align: right;">${item_subtotal|viviFormatTaxes:true}</td>
                <td style="text-align: right;">${tax_subtotal|viviFormatTaxes:true}</td>
{/for}
            </tr>
{/for}
        </tbody>
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
        <tfoot>
            <tr>
                <td colspan="2" style="text-align: left;">${_( '(rpt)Records Found' )}: ${foot.rowCount|default:0|format:0} <br/>${_( '(rpt)Records Displayed' )}: ${GeckoJS.BaseObject.getKeys(body).length|format:0}</td>
                <td colspan="4" style="text-align: right;">${_( '(rpt)Summary' ) + ':'}</td>
                <td style="text-align: right;">${foot.summary.total|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${foot.summary.item_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${foot.summary.trans_surcharge_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${foot.summary.trans_discount_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${foot.summary.promotion_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${foot.summary.revalue_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${foot.summary.tax_subtotal|default:0|viviFormatTaxes:true}</td>
                <td style="text-align: right;">${foot.summary.included_tax_subtotal|default:0|viviFormatTaxes:true}</td>
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
                <td style="text-align: right;">${item_subtotal|viviFormatTaxes:true}</td>
                <td style="text-align: right;">${tax_subtotal|viviFormatTaxes:true}</td>
{/for}
            </tr>
        </tfoot>
    </table>
    <br />
</div>
<br />
