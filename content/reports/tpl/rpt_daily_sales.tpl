<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">
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
                    <th>Surcharge</th>
                    <th>Discount</th>
                    <th>Cash</th>
                    <th>Credit Card</th>
                    <th>Coupon</th>
                </tr>
            </thead>
            <tbody>
{for detail in body}
                <tr>
                    <td style="text-align: left;">${detail.terminal_no}</td>
                    <td style="text-align: left;">${detail.transaction_created|unixTimeToLocale}</td>
                    <td>${detail.sequence}</td>
                    <td>${detail.invoice_no}</td>
                    <td>${detail.total|round:detail.precision_prices,detail.rounding_prices|format:detail.precision_prices}</td>
                    <td>${detail.surcharge_subtotal|round:detail.precision_prices,detail.rounding_prices|format:detail.precision_prices}</td>
                    <td>${detail.discount_subtotal|round:detail.precision_prices,detail.rounding_prices|format:detail.precision_prices}</td>
                    <td>${detail.cash|round:detail.precision_prices,detail.rounding_prices|format:detail.precision_prices}</td>
                    <td>${detail.creditcard|round:detail.precision_prices,detail.rounding_prices|format:detail.precision_prices}</td>
                    <td>${detail.coupon|round:detail.precision_prices,detail.rounding_prices|format:detail.precision_prices}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </tfoot>
        </table>
        </br>

</div>
<!--/div -->
