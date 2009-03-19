<!--div class="paper"-->
<div id="printhead">
	<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>

<div id="docbody" class="paper">

<p class="heading_store">${head.store.name} - ${head.store.branch}</p>
<p class="heading_store">${head.store.telephone1}</p>

<div style="float: left;">
	<p class="heading_p">機器編號: ${head.store.terminal_no}</p>
	<p class="heading_p">收銀員: ${head.clerk_displayname}</p>
	<p class="caption">${head.title}</p>
</div>

<div style="float: right;">
	<p class="heading_p">&nbsp;</p>
	<p class="heading_p" align="right">列印時間: ${foot.gen_time}</p>
	<p class="caption">${head.start_time} - ${head.end_time}</p>
</div>

    <table id="body-table">
        <!--caption>${head.title}</caption-->
        <thead>
            <tr>
            	<th style="text-align: left;">時間</th>
            	<th style="text-align: right;">班別</th>
            	<th style="text-align: left;">發票號碼</th>
            	<th style="text-align: left;">統一編號</th>
            	<th style="text-align: left;">備註</th>
            	<th style="text-align: right;">發票張數</th>
                <th style="text-align: right;">總計</th>
                <th style="text-align: right;">折扣金額</th>
                <th style="text-align: right;">附加費</th>
                <th style="text-align: right;">外加稅</th>
                <th style="text-align: right;">內含稅</th>
{for tax in taxList}
                <th style="text-align: right;">${tax.no}</th>
{/for}
            </tr>
        </thead>
        <tbody>
{for item in body}
            <tr>
            	<td style="text-align: left;">${item.created}</td>
            	<td style="text-align: right;">${item.shift_number}</td>
            	<td style="text-align: left;">${item.invoice_no}</td>
            	<td style="text-align: left;">${item.uniform_business_number}</td>
            	<td style="text-align: left;">${item.status}</td>
            	<td style="text-align: right;">${item.num_invoices}</td>
                <td style="text-align: right;">${item.Order.total|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${item.discount_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${item.surcharge_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${item.Order.tax_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${item.Order.included_tax_subtotal|default:0|viviFormatPrices:true}</td>
{for tax in taxList}
                <td style="text-align: right;">${item[ tax.no ]|viviFormatPrices:true}</td>
{/for}
            </tr>
{/for}
        </tbody>
        <tfoot>
            <tr>
				<td colspan="5">總計:</td>
				<td style="text-align: right;">${foot.summary.num_invoices|default:0}</td>
				<td style="text-align: right;">${foot.summary.total|default:0|viviFormatPrices:true}</td>
				<td style="text-align: right;">${foot.summary.discount_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${foot.summary.surcharge_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${foot.summary.tax_subtotal|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${foot.summary.included_tax_subtotal|default:0|viviFormatPrices:true}</td>
{for tax in taxList}
                <td style="text-align: right;">${foot.summary[ tax.no ]|viviFormatPrices:true}</td>
{/for}
            </tr>
        </tfoot>
    </table>
    <br />
</div>
<br />
