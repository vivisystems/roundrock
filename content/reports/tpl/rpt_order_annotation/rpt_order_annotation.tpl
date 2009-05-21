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
		<p class="heading_p" align="right">${_( '(rpt)Printed Time' ) + ': '}${foot.gen_time}</p>
		<p class="caption">${head.start_time} - ${head.end_time}</p>
	</div>
	
{for types in body}
        <table id="body-table">
            <!--caption>${head.title}</caption-->
            <thead>
            	<tr>
		        	<td colspan="15" class="subtitle">${types_index}</td>
		        </tr>
                <tr class="fields">
                    <th style="text-align: left;">${_( '(rpt)Terminal' )}</th>
                    <th style="text-align: left;">${_( '(rpt)Clerk' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Sale Period' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Shift' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Time' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Sequence' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Status' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Gross' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Surcharge' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Discount' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Promotion' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Revalue' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Add-on Tax' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Net Sales' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Payment' )}</th>
                </tr>
            </thead>
            <tbody>
{for order in types.orders}
{eval}
  TrimPath.RoundingPrices = order.rounding_prices;
  TrimPath.PrecisionPrices = order.precision_prices;
  TrimPath.RoundingTaxes = order.rounding_taxes;
  TrimPath.PrecisionTaxes = order.precision_taxes;
{/eval}
                <tr id="${order.id}">
                    <td style="text-align: left;">${order.terminal_no}</td>
                    <td style="text-align: left;">${order.service_clerk_displayname|default:''}/${order.proceeds_clerk_displayname|default:''}</td>
                    <td style="text-align: center;">${order.sale_period|unixTimeToString:'saleperiod'}</td>
                    <td style="text-align: center;">${order.shift_number}</td>
                    <td style="text-align: center;">${order.time|unixTimeToString}</td>
                    <td style="text-align: center;">${order.sequence}</td>
                    <td style="text-align: center;">${order.status}</td>
                    <td style="text-align: right;">${order.item_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.discount_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.promotion_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.revalue_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.tax_subtotal|viviFormatTaxes:true}</td>
                    <td style="text-align: right;">${order.total|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.payment|viviFormatPrices:true}</td>
                </tr>
                <tr>
                    <td/>
                    <td colspan="14" style="text-align: left;">${order.text|default:''}</td>
                </tr>
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2" style="text-align: left;">${_( '(rpt)Records Found' )}: ${types.orders.length|format:0}</td>
                    <td colspan="5" style="text-align: right;">${_( '(rpt)Summary' ) + ':'}</td>
                    <td style="text-align: right;">${types.summary.item_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${types.summary.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${types.summary.discount_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${types.summary.promotion_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${types.summary.revalue_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${types.summary.tax_subtotal|viviFormatTaxes:true}</td>
                    <td style="text-align: right;">${types.summary.total|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${types.summary.payment|viviFormatPrices:true}</td>
                </tr>
            </tfoot>
        </table>
        </br>
{/for}
</div>
<!--/div -->
