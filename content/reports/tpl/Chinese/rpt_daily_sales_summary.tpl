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
{for detail in body}
                <tr>
                    <td style="text-align: left;">${detail.terminal_no}</td>
                    <td>${detail.item_subtotal|viviFormatPrices:true}</td>
                    <td>${detail.tax_subtotal|viviFormatPrices:true}</td>
                    <td>${detail.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td>${detail.discount_subtotal|viviFormatPrices:true}</td>
                    <td>${detail.total|viviFormatPrices:true}</td>
                    <td>${detail.cash|default:0|viviFormatPrices:true}</td>
                    <td>${detail.check|default:0|viviFormatPrices:true}</td>
                    <td>${detail.creditcard|default:0|viviFormatPrices:true}</td>
                    <td>${detail.coupon|default:0|viviFormatPrices:true}</td>
                    <td>${detail.giftcard|default:0|viviFormatPrices:true}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="1">總計:</td>
                    <td>${foot.foot_datas.item_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.tax_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.discount_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.total|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.cash|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.check|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.creditcard|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.coupon|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.giftcard|viviFormatPrices:true}</td>
                </tr>
            </tfoot>
        </table>
        </br>

</div>
<!--/div -->
