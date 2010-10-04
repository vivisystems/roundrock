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
                       <span class="caption">${queryFormLabel.sortby_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.sortby|escape}</span>
                       <span class="caption">${queryFormLabel.database_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.database|escape}</span>
                </td>
           </tr>
        </table>
	
        <table id="body-table">
            <!--caption>${head.title}</caption-->
            <thead>
                <tr>
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
                    <th style="text-align: center;">${_( '(rpt)Total' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Payment' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Cash' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Check' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Credit Card' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Coupon' )}</th>
                    <th style="text-align: center;">${_( '(rpt)Gift Card' )}</th>
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
                    <td style="text-align: left;">${detail.service_clerk_displayname|default:''}/ ${detail.proceeds_clerk_displayname|default:''}</td>
                    <td style="text-align: left;">${detail.sale_period|unixTimeToString:'saleperiod'}</td>
                    <td style="text-align: left;">${detail.shift_number}</td>
                    <td style="text-align: left;">${detail.time|unixTimeToString}</td>
                    <td style="text-align: left;" class="hyperlink">${detail.sequence}</td>
                    <td style="text-align: left;">${detail.invoice_no|default:''}</td>
                    <td style="text-align: right;">${detail.no_of_customers|format:0}</td>
                    <td style="text-align: right;">${detail.qty_subtotal|format:0}</td>
                    <td style="text-align: right;">${detail.item_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.tax_subtotal|default:0|viviFormatTaxes:true}</td>
                    <td style="text-align: right;">${detail.surcharge_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.discount_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.promotion_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.revalue_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.total|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.payment|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.cash|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.check|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.creditcard|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.coupon|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.giftcard|default:0|viviFormatPrices:true}</td>
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
                    <td colspan="6" style="text-align: left;">${_( '(rpt)Records Found' ) }: ${foot.foot_datas.rowCount|format:0} <br/>${_( '(rpt)Records Displayed' ) }: ${body.length|default:0|format:0}</td>
                    <td colspan="1">${_( '(rpt)Summary' ) + ':'}</td>
                    <td style="text-align: right;">${foot.foot_datas.guests|format:0}</td>
                    <td style="text-align: right;">${foot.foot_datas.items|format:0}</td>
                    <td style="text-align: right;">${foot.foot_datas.item_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.tax_subtotal|default:0|viviFormatTaxes:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.surcharge_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.discount_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.promotion_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.revalue_subtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.total|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.payment|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.cash|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.check|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.creditcard|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.coupon|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.giftcard|default:0|viviFormatPrices:true}</td>
                </tr>
            </tfoot>
        </table>
        </br>
</div>
<!--/div -->
