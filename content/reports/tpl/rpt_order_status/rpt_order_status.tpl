<!-- div class="paper" style="overflow:auto;" -->
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
                <td class="condition-title"><span class="caption">${_('(rpt)Condition') + ' - '}</span></td>
                <td align="left" >
                       <span class="caption">${queryFormLabel.terminal_no_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.terminal_no|escape}</span>
                       <span class="caption">${queryFormLabel.shift_no_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.shift_no|escape}</span>
                       <span class="caption">${queryFormLabel.period_type_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.period_type|escape}</span>
                       <span class="caption">${queryFormLabel.orderstatus_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.orderstatus|escape}</span>
                       <span class="caption">${queryFormLabel.sortby_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.sortby|escape}</span>
                </td>
           </tr>
       </table>
        <table id="body-table">
            <thead>
                <tr>
                    <th style="text-align: center;">${_( '(rpt)Terminal' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Clerk' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Sale Period' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Shift' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Time' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Sequence' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Status' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Void Clerk' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Void Sale Period' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Void Shift' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Void Time' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Invoice Number' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Invoice Count' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Gross Sales' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Surcharge' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Discount' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Promotion' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Revalue' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Add-on Tax' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Total' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Payment' )}</th>
                </tr>
            </thead>
            <tbody>
{for detail in body}
{eval}
  TrimPath.RoundingPrices = detail.rounding_prices;
  TrimPath.PrecisionPrices = detail.precision_prices;
  TrimPath.RoundingTaxes = detail.rounding_taxes;
  TrimPath.PrecisionTaxes = detail.precision_taxes;
{/eval}
                <tr id="${detail.id}">
                    <td style="text-align: center;">${detail.terminal_no}</td>
                    <td style="text-align: center;">${detail.service_clerk_displayname|default:''}/${detail.proceeds_clerk_displayname|default:''}</td>
                    <td style="text-align: center;">${detail.sale_period|unixTimeToString:'saleperiod'}</td>
                    <td style="text-align: center;">${detail.shift_number|default:''}</td>
                    <td style="text-align: center;">${detail.time|unixTimeToString}</td>
                    <td style="text-align: center;" class="hyperlink">${detail.sequence}</td>
                    <td style="text-align: center;">${detail.status_str}</td>
                {if detail.status == -2}
                    <td style="text-align: center;">${detail.void_clerk_displayname|default:''}</td>
                    <td style="text-align: center;">${detail.void_sale_period|unixTimeToString:'saleperiod'}</td>
                    <td style="text-align: center;">${detail.void_shift_number|default:''}</td>
                    <td style="text-align: center;">${detail.transaction_voided|unixTimeToString}</td>
                {else}
                    <td colspan="4"/>
                {/if}
                    <td style="text-align: center;">${detail.invoice_no|default:''}</td>
                    <td style="text-align: center;">${detail.invoice_count|default:''}</td>
                    <td style="text-align: right;">${detail.item_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.discount_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.promotion_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.revalue_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.tax_subtotal|viviFormatTaxes:true}</td>
                    <td style="text-align: right;">${detail.total|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.payment|viviFormatPrices:true}</td>
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
                    <td colspan="2" style="text-align: left;">${_( '(rpt)Records Found' )}: ${foot.foot_datas.rowCount|format:0} <br/>${_( '(rpt)Records Displayed' ) }: ${body.length|format:0}</td>
                    <td colspan="11" style="text-align: right;">${_( '(rpt)Summary' ) + ':'}</td>
                    <td style="text-align: right;">${foot.foot_datas.item_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.discount_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.promotion_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.revalue_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.tax_subtotal|viviFormatTaxes:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.total|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.payment_subtotal|viviFormatPrices:true}</td>
                </tr>
            </tfoot>
        </table>
        </br>

</div>
<!--/div -->
