<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">

<p align="left">${head.store.name}</p>
<p align="left">${head.store.branch}</p>
<p align="left">${head.store.telephone1}</p>
<p align="left">機器編號: ${head.store.terminal_no}</p>
<p align="left">櫃員: ${head.clerk_displayname}</p>
<p align="right">列印時間: ${foot.gen_time}</p>
<p align="right">${head.start_time} - ${head.end_time}</p>
<p align="left">${head.title}</p>

{for clerk in body}
        <table id="body-table">
            <caption>${clerk.name}</caption>
            <thead>
                <tr>
                    <th>機器編號</th>
                    <th>${clerk.associated_clerk}</th>
                    <th>時間</th>
                    <th>單號</th>
                    <th>發票號碼</th>
                    <th>營業金額</th>
                    <th>附加稅</th>
                    <th>溢收</th>
                    <th>折扣</th>
                    <th>實收金額</th>
                    <th>現金</th>
                    <th>支票</th>
                    <th>信用卡</th>
                    <th>票卷</th>
                    <th>禮卡</th>
                </tr>
            </thead>
            <tbody>
{for order in clerk.orders}
                <tr>
                    <td style="text-align: left;">${order.terminal_no}</td>
                    <td style="text-align: left;">
                    {if clerk.associated_clerk == 'Proceeds Clerk'}
                    	${order.proceeds_clerk_displayname}
                    {/if}
                    {if clerk.associated_clerk == 'Service Clerk'}
                    	${order.service_clerk_displayname}
                    {/if}
                    </td>
                    <td style="text-align: left;">${order.transaction_created|unixTimeToString:'yyyy-M-d'}</td>
                    <td>${order.sequence}</td>
                    <td>${order.invoice_no}</td>
                    <td>${order.item_subtotal|viviFormatPrices:true}</td>
                    <td>${order.tax_subtotal|viviFormatPrices:true}</td>
                    <td>${order.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td>${order.discount_subtotal|viviFormatPrices:true}</td>
                    <td>${order.total|viviFormatPrices:true}</td>
                    <td>${order.cash|default:0|viviFormatPrices:true}</td>
                    <td>${order.check|default:0|viviFormatPrices:true}</td>
                    <td>${order.creditcard|default:0|viviFormatPrices:true}</td>
                    <td>${order.coupon|default:0|viviFormatPrices:true}</td>
                    <td>${order.giftcard|default:0|viviFormatPrices:true}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td></td>
                    <td></td>
                    <td colspan="3">總計:</td>
                    <td>${clerk.summary.item_subtotal|viviFormatPrices:true}</td>
                    <td>${clerk.summary.tax_subtotal|viviFormatPrices:true}</td>
                    <td>${clerk.summary.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td>${clerk.summary.discount_subtotal|viviFormatPrices:true}</td>
                    <td>${clerk.summary.total|viviFormatPrices:true}</td>
                    <td>${clerk.summary.cash|viviFormatPrices:true}</td>
                    <td>${clerk.summary.check|viviFormatPrices:true}</td>
                    <td>${clerk.summary.creditcard|viviFormatPrices:true}</td>
                    <td>${clerk.summary.coupon|viviFormatPrices:true}</td>
                    <td>${clerk.summary.giftcard|viviFormatPrices:true}</td>
                </tr>
            </tfoot>
        </table>
        </br>
{/for}
</div>
<!--/div -->
