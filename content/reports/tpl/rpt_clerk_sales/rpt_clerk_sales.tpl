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
                       <span class="caption">${queryFormLabel.clerk_type_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.clerk_type|escape}</span>
                       <span class="caption">${queryFormLabel.sortby_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.sortby|escape}</span>
                       <br>
                       <span class="caption">${queryFormLabel.database_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.database|escape}</span>
                </td>
           </tr>
       </table>
{for clerk in body}
        <table id="body-table">
            <!--caption>${clerk.name}</caption-->
            <thead>
            	<tr>
            		<td colspan="14" class="subtitle">${clerk.name}</td>
				</tr>
                <tr class="fields">
                    <th style="text-align: center;">${_( '(rpt)Terminal' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Sale Period' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Shift' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Time' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Sequence' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Invoice Number' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Number of Guests' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Number of Items' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Total' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Gross Sales' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Add-on Tax' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Surcharge' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Discount' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Promotion' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Revalue' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Payment' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Cash' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Check' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Credit Card' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Coupon' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Gift Card' )}</th>
                </tr>
            </thead>
            <tbody>
{for order in clerk.orders}
{eval}
  TrimPath.RoundingPrices = order.rounding_prices;
  TrimPath.PrecisionPrices = order.precision_prices;
  TrimPath.RoundingTaxes = order.rounding_taxes;
  TrimPath.PrecisionTaxes = order.precision_taxes;
{/eval}
                <tr id="${order.id}">
                    <td style="text-align: left;">${order.terminal_no}</td>
                    <td style="text-align: left;">${order.sale_period|unixTimeToString:'saleperiod'}</td>
                    <td style="text-align: left;">${order.shift_number}</td>
                    <td style="text-align: left;">${order.time|unixTimeToString}</td>
                    <td style="text-align: left;" class="hyperlink">${order.sequence}</td>
                    <td style="text-align: left;">${order.invoice_no|default:''}</td>
                    <td style="text-align: right;">${order.no_of_customers|default:1|format:0}</td>
                    <td style="text-align: right;">${order.qty_subtotal|format:0}</td>
                    <td style="text-align: right;">${order.total|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.item_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.tax_subtotal|default:0|viviFormatTaxes:true}</td>
                    <td style="text-align: right;">${order.surcharge_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.discount_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.promotion_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.revalue_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.payment|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.cash|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.check|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.creditcard|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.coupon|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${order.giftcard|default:0|viviFormatPrices:true}</td>
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
                    <td colspan="4" style="text-align: left;">${_( '(rpt)Records Found' ) }: ${foot.rowCount|default:0|format:0} <br/>${_( '(rpt)Records Displayed' ) }: ${clerk.orders.length|default:0|format:0}</td>
                    <td colspan="2">${_( '(rpt)Summary' ) }:</td>
                    <td style="text-align: right;">${clerk.summary.guests|format:0}</td>
                    <td style="text-align: right;">${clerk.summary.items|format:0}</td>
                    <td style="text-align: right;">${clerk.summary.total|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${clerk.summary.item_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${clerk.summary.tax_subtotal|default:0|viviFormatTaxes:true}</td>
                    <td style="text-align: right;">${clerk.summary.surcharge_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${clerk.summary.discount_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${clerk.summary.promotion_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${clerk.summary.revalue_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${clerk.summary.payment|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${clerk.summary.cash|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${clerk.summary.check|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${clerk.summary.creditcard|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${clerk.summary.coupon|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${clerk.summary.giftcard|default:0|viviFormatPrices:true}</td>
                </tr>
            </tfoot>
        </table>
        </br>
{/for}
</div>
<!--/div -->
