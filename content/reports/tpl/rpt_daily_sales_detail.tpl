<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">
 <!-- ${head.starttime} - ${head.endtime} -->
        <table id="body-table">
            <caption>${head.title}</caption>
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Sequence</th>
                    <th>Total</th>
                    <th>Guests</th>
                    <th>Items</th>
                </tr>
            </thead>
            <tbody>
{for detail in body}
                <tr>
                    <td style="text-align: left;">${detail.Order.Time}</td>
                    <td>${detail.sequence}</td>
                    <td>${detail.total}</td>
                    <td>${detail.no_of_customers}</td>
                    <td>${detail.items_count}</td>
                </tr>

                <tr>
                    <td></td>
                    <td colspan="4">
                        <table width="100%">
{for items in detail.OrderItem}
                            <tr>
                                <td>${items.product_no}</td>
                                <td>${items.product_name}</td>
                                <td>${items.current_price}</td>
                                <td>${items.current_qty}</td>
                                <td>${items.current_subtotal}</td>
                            </tr>
{/for}
                        </table>
                    </td>
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
