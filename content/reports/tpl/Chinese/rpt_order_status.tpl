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

        <table id="body-table">
            <caption>${head.title}</caption>
            <thead>
                <tr>
                    <th>機器編號</th>
                    <th>出單店員</th>
                    <th>訂單狀態</th>
                    <th>時間</th>
                    <th>單號</th>
                    <th>發票號碼</th>
                    <th>營業金額</th>
                    <th>附加稅</th>
                    <th>溢收</th>
                    <th>折扣</th>
                    <th>實收金額</th>
                </tr>
            </thead>
            <tbody>
{for detail in body}
                <tr>
                    <td style="text-align: left;">${detail.terminal_no}</td>
                    <td style="text-align: left;">${detail.service_clerk_displayname}</td>
                    <td style="text-align: left;">${detail.status}</td>
                    <td style="text-align: left;">${detail.transaction_created|unixTimeToString:'yyyy-M-d'}</td>
                    <td>${detail.sequence}</td>
                    <td>${detail.invoice_no}</td>
                    <td>${detail.item_subtotal|viviFormatPrices:true}</td>
                    <td>${detail.tax_subtotal|viviFormatPrices:true}</td>
                    <td>${detail.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td>${detail.discount_subtotal|viviFormatPrices:true}</td>
                    <td>${detail.total|viviFormatPrices:true}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td></td>
                    <td></td>
                    <td colspan="4">總計:</td>
                    <td>${foot.foot_datas.item_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.tax_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.discount_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.total|viviFormatPrices:true}</td>
                </tr>
            </tfoot>
        </table>
        </br>

</div>
<!--/div -->
