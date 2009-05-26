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
{for detail in body}
        <table id="body-table">
            <!--caption>${head.title}</caption-->
            <thead>
            	<tr>
		        	<td colspan="22" class="subtitle">${detail.customer_id} - ${detail.name}</td>
		        </tr>
                <tr class="fields">
                    <th style="text-align: center;">${_( '(rpt)Terminal' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Clerk' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Sale Period' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Shift' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Time' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Sequence' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Invoice Number' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Number of Guests' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Number of Items' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Gross Sales' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Add-on Tax' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Surcharge' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Discount' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Promotion' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Revalue' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Net Sales' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Payment' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Cash' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Check' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Credit Card' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Coupon' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Gift Card' )}</th>
                </tr>
            </thead>
            <tbody>
{eval}
  TrimPath.RoundingPrices = detail.rounding_prices;
  TrimPath.PrecisionPrices = detail.precision_prices;
  TrimPath.RoundingTaxes = detail.rounding_taxes;
  TrimPath.PrecisionTaxes = detail.precision_taxes;
{/eval}
{for order in detail.orders}
                <tr id="${order.id}">
                    <td style="text-align: left;">${order.terminal_no}</td>
                    <td style="text-align: left;">${order.service_clerk_displayname|default:''}/ ${order.proceeds_clerk_displayname|default:''}</td>
                    <td style="text-align: left;">${order.sale_period|unixTimeToString:'saleperiod'}</td>
                    <td style="text-align: left;">${order.shift_number}</td>
                    <td style="text-align: left;">${order.time|unixTimeToString}</td>
                    <td style="text-align: left;" class="hyperlink">${order.sequence}</td>
                    <td style="text-align: left;">${order.invoice_no|default:''}</td>
                    <td style="text-align: right;">${order.no_of_customers|format:0}</td>
                    <td style="text-align: right;">${order.qty_subtotal|format:0}</td>
                    <td style="text-align: right;">${order.item_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.tax_subtotal|default:0|viviFormatTaxes:true}</td>
                    <td style="text-align: right;">${order.surcharge_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.discount_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.promotion_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.revalue_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.total|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.payment|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.cash|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.check|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.creditcard|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.coupon|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.giftcard|default:0|viviFormatPrices:true}</td>
                </tr>
            </tbody>
{/for}
{eval}
  delete TrimPath.RoundingPrices;
  delete TrimPath.PrecisionPrices;
  delete TrimPath.RoundingTaxes;
  delete TrimPath.PrecisionTaxes;
{/eval}
            <tfoot>
                <tr>
                    <td colspan="6" style="text-align: left;">${_( '(rpt)Records Found' ) }: ${detail.orders.length|default:0|format:0}</td>
                    <td colspan="1">${_( '(rpt)Summary' ) + ':'}</td>
                    <td style="text-align: right;">${detail.summary.no_of_customers|format:0}</td>
                    <td style="text-align: right;">${detail.summary.qty_subtotal|format:0}</td>
                    <td style="text-align: right;">${detail.summary.item_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.summary.tax_subtotal|default:0|viviFormatTaxes:true}</td>
                    <td style="text-align: right;">${detail.summary.surcharge_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.summary.discount_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.summary.promotion_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.summary.revalue_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.summary.total|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.summary.payment|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.summary.cash|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.summary.check|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.summary.creditcard|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.summary.coupon|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.summary.giftcard|default:0|viviFormatPrices:true}</td>
                </tr>
            </tfoot>
        </table>
        </br>
{/for}
</div>
<!--/div -->
