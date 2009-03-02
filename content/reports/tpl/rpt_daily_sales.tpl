<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">

<p align="left">${head.store.name}</p>
<p align="left">${head.store.branch}</p>
<p align="left">${head.store.telephone1}</p>
<p align="left">Terminal: ${head.store.terminal_no}</p>
<p align="left">Clerk: ${head.clerk_displayname}</p>
<p align="right">${head.start_time} - ${head.end_time}</p>

        <table id="body-table">
            <caption>${head.title}</caption>
            <thead>
                <tr>
                    <th>Term_No.</th>
                    <th>Time</th>
                    <th>Sequence</th>
                    <th>Invoice No</th>
                    <th>Total</th>
                    <th>Add-on Tax</th>
                    <th>Surcharge</th>
                    <th>Discount</th>
                    <th>Payment</th>
                    <th>Cash</th>
                    <th>Credit Card</th>
                    <th>Coupon</th>
                    <th>Gift Card</th>
                </tr>
            </thead>
            <tbody>
{for detail in body}
                <tr>
                    <td style="text-align: left;">${detail.terminal_no}</td>
                    <td style="text-align: left;">${detail.transaction_created|unixTimeToString:'yyyy-M-d'}</td>
                    <td>${detail.sequence}</td>
                    <td>${detail.invoice_no}</td>
                    <td>${detail.item_subtotal|viviFormatPrices:true}</td>
                    <td>${detail.tax_subtotal|viviFormatPrices:true}</td>
                    <td>${detail.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td>${detail.discount_subtotal|viviFormatPrices:true}</td>
                    <td>${detail.total|viviFormatPrices:true}</td>
                    <td>${detail.cash|default:0|viviFormatPrices:true}</td>
                    <td>${detail.creditcard|default:0|viviFormatPrices:true}</td>
                    <td>${detail.coupon|default:0|viviFormatPrices:true}</td>
                    <td>${detail.giftcard|default:0|viviFormatPrices:true}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td></td>
                    <td></td>
                    <td colspan="2">Summary:</td>
                    <td>${foot.foot_datas.item_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.tax_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.discount_subtotal|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.total|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.cash|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.creditcard|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.coupon|viviFormatPrices:true}</td>
                    <td>${foot.foot_datas.giftcard|viviFormatPrices:true}</td>
                </tr>
            </tfoot>
        </table>
        </br>

</div>
<!--/div -->
