<!--doing this can make the codes below be colored by the gedit. It's so funny, isn't it? -->
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
                       <span class="caption">${queryFormLabel.sequence_no_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.sequence_no|escape}</span>
                       <span class="caption">${queryFormLabel.sortby_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.sortby|escape}</span>
                       <br>
                       <span class="caption">${queryFormLabel.database_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.database|escape}</span>
                </td>
           </tr>
        </table>
        <table id="body-table">
            <thead>
                <tr>
                    <th style="text-align: center;">${_( '(rpt)Terminal' )}</th>
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
                    <th style="text-align: center;">${_( '(rpt)Total' )}</th>
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
                    <td style="text-align: left;">${detail.terminal_no}</td>
                    <td style="text-align: left;">${detail.sale_period|unixTimeToString:'saleperiod'}</td>
                    <td style="text-align: left;">${detail.shift_number}</td>
                    <td style="text-align: left;">${detail.Order.time|unixTimeToString}</td>
                    <td style="text-align: left;" class="hyperlink">${detail.sequence}</td>
                    <td style="text-align: left;">${detail.invoice_no|default:''}</td>
                    <td style="text-align: right;">${detail.no_of_customers|default:''|format:0}</td>
                    <td style="text-align: right;">${detail.qty_subtotal|default:0|format:0}</td>
                    <td style="text-align: right;">${detail.item_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.tax_subtotal|default:0|viviFormatTaxes:true}</td>
                    <td style="text-align: right;">${detail.surcharge_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.discount_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.promotion_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.revalue_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.total|default:0|viviFormatPrices:true}</td>
                </tr>

                <tr>
                    <td></td>
                    <td colspan="14">
                        <table width="100%">
                        	<tr style="color: gray; font-style: italic; font-size: 8pt;">
                        		<th style="text-align: left; width: 12%;">${_( '(rpt)Product Number' )}</th>
                        		<th style="text-align: left; width: 16%;">${_( '(rpt)Product Name' )}</th>
                        		<th style="text-align: left; width: 12%;">${_( '(rpt)Tax Name' )}</th>
                        		<th style="text-align: right; width: 12%;">${_( '(rpt)Surcharge' )}</th>
                        		<th style="text-align: right; width: 12%;">${_( '(rpt)Discount' )}</th>
                        		<th style="text-align: right; width: 12%;">${_( '(rpt)Price' )}</th>
                        		<th style="text-align: right; width: 12%;">${_( '(rpt)Quantity' )}</th>
                        		<th style="text-align: right; width: 12%;">${_( '(rpt)Subtotal' )}</th>
                        	</tr>
{for items in detail.OrderItem}
                            <tr>
                                <td style="text-align: left;">${items.product_no}</td>
                                <td style="text-align: left;">${items.product_name|default:''}</td>
                                <td style="text-align: left;">${items.tax_name|default:''}</td>
                                <td style="text-align: right;">${items.current_surcharge|default:0|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${items.current_discount|default:0|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${items.current_price|default:0|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${items.current_qty|default:0|format:0}</td>
                                <td style="text-align: right;">${items.current_subtotal|default:0|viviFormatPrices:true}</td>
                            </tr>
{/for}
                        </table>
                    </td>
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
                    <td colspan="4" style="text-align: left;">${_( '(rpt)Records Found' ) }: ${foot.foot_datas.rowCount|format:0}<br/>${_( '(rpt)Records Displayed' ) }: ${body.length|default:0|format:0}</td>
                    <td colspan="2">${_( '(rpt)Summary' ) + ':'}</td>
                    <td style="text-align: right;">${foot.foot_datas.guests|format:0}</td>
                    <td style="text-align: right;">${foot.foot_datas.items|format:0}</td>
                    <td style="text-align: right;">${foot.foot_datas.item_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.tax_subtotal|default:0|viviFormatTaxes:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.surcharge_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.discount_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.promotion_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.revalue_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.payment|default:0|viviFormatPrices:true}</td>
                </tr>
            </tfoot>
        </table>
        </br>
</div>
<!--/div -->
