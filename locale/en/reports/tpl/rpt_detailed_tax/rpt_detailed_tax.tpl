<div class="paper">
    <img src="chrome://viviecr/content/skin/images/logo.png" />
    <br />

    <p align="left">${head.store.name}</p>
	<p align="left">${head.store.branch}</p>
	<p align="left">${head.store.telephone1}</p>
	<p align="left">Terminal: ${head.store.terminal_no}</p>
	<p align="left">Clerk: ${head.clerk_displayname}</p>
	<p align="right">Printed Time: ${foot.gen_time}</p>
	<p align="right">${head.start_time} - ${head.end_time}</p>

    <table id="body-table">
        <caption>${head.title}</caption>
        <thead>
            <tr>
                <th style="text-align: left;">Sequence</th>
                <th style="text-align: left;">Total</th>
                <th style="text-align: right;">Add-on Tax</th>
                <th style="text-align: right;">Included Tax</th>
{for tax in taxList}
                <th style="text-align: right;">${tax.no}</th>
{/for}
            </tr>
        </thead>
        <tbody>
{for item in body}
            <tr>
                <td style="text-align: left;">${item.Order.sequence}</td>
                <td style="text-align: left;">${item.Order.total|default:0|viviFormatPrices:true}</td>
                <td>${item.Order.tax_subtotal|default:0|viviFormatPrices:true}</td>
                <td>${item.Order.included_tax_subtotal|default:0|viviFormatPrices:true}</td>
{for tax in taxList}
                <td>${item[ tax.no ]|viviFormatPrices:true}</td>
{/for}
            </tr>
{/for}
        </tbody>
        <tfoot>
            <tr>
				<td>Summary:</td>
				<td style="text-align: left;">${foot.summary.total|default:0|viviFormatPrices:true}</td>
                <td>${foot.summary.tax_subtotal|default:0|viviFormatPrices:true}</td>
                <td>${foot.summary.included_tax_subtotal|default:0|viviFormatPrices:true}</td>
{for tax in taxList}
                <td style="text-align: right;">${foot.summary[ tax.no ]|viviFormatPrices:true}</td>
{/for}
            </tr>
        </tfoot>
    </table>
    <br />
</div>
<br />
